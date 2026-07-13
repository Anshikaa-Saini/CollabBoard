const { Server } = require("socket.io");
const Room = require("../models/Room");
const socketAuth = require("./socketAuth");
const {
  getRoomState,
  addParticipant,
  removeParticipant,
  getParticipantList,
  updateSnapshotIfNewer,
} = require("./roomState");

const CURSOR_COLORS = [
  "#2563eb",
  "#ef4444",
  "#16a34a",
  "#f59e0b",
  "#a855f7",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

/**
 * Wires up Socket.io on top of the existing HTTP server. Each whiteboard
 * room maps 1:1 to a Socket.io room (identified by the Mongo room _id), so
 * broadcasting to "everyone in this room" is just `io.to(roomId).emit(...)`.
 *
 * Event contract:
 *   Client -> Server:
 *     join-room    { roomId }
 *     draw         { x0, y0, x1, y1, color, size, tool, timestamp }
 *     clear-board  { timestamp }
 *     canvas-sync  { snapshot, timestamp }   (full canvas, sent after each stroke)
 *     cursor-move  { x, y }
 *     leave-room   {}
 *
 *   Server -> Clients:
 *     board-state         { snapshot, timestamp }   (sent only to the joining socket)
 *     participants-update { count, participants }
 *     draw                (relayed, + userId)
 *     clear-board         (relayed, + userId)
 *     canvas-sync         (relayed, + userId)
 *     cursor-move         { userId, name, color, x, y }
 *     cursor-leave        { userId }
 *     error-message       string
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    let currentRoomId = null;

    const broadcastParticipants = (roomId) => {
      const state = getRoomState(roomId);
      io.to(roomId).emit("participants-update", {
        count: state.participants.size,
        participants: getParticipantList(roomId),
      });
    };

    const leaveCurrentRoom = () => {
      if (!currentRoomId) return;
      const roomId = currentRoomId;
      socket.leave(roomId);
      removeParticipant(roomId, socket.id);
      broadcastParticipants(roomId);
      socket.to(roomId).emit("cursor-leave", { userId: socket.user.id });
      currentRoomId = null;
    };

    socket.on("join-room", async ({ roomId } = {}) => {
      try {
        if (!roomId) return;

        // Authorize against MongoDB: only members of the room may join its
        // Socket.io room (mirrors the REST getRoomById authorization check).
        const room = await Room.findById(roomId);
        if (!room) {
          return socket.emit("error-message", "Room not found");
        }

        const isMember = room.members.some(
          (memberId) => memberId.toString() === socket.user.id
        );
        if (!isMember) {
          return socket.emit("error-message", "Not authorized for this room");
        }

        // Support switching rooms on the same connection without leaking membership
        if (currentRoomId && currentRoomId !== roomId) {
          leaveCurrentRoom();
        }

        currentRoomId = roomId;
        socket.join(roomId);

        const state = getRoomState(roomId);
        const color = CURSOR_COLORS[state.participants.size % CURSOR_COLORS.length];
        addParticipant(roomId, socket.id, {
          userId: socket.user.id,
          name: socket.user.name,
          color,
        });

        // Send the current canonical board state only to the joining socket.
        // This is also what powers reconnect handling - a dropped-then-restored
        // connection simply re-runs join-room and gets caught back up here.
        socket.emit("board-state", { snapshot: state.snapshot, timestamp: state.timestamp });

        broadcastParticipants(roomId);
      } catch (err) {
        socket.emit("error-message", "Failed to join room");
      }
    });

    // Live incremental stroke segment - relayed instantly, never stored.
    // This is what makes drawing feel real-time; the canonical state is
    // reconciled separately via canvas-sync below.
    socket.on("draw", (payload) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit("draw", { ...payload, userId: socket.user.id });
    });

    // Full board clear - goes through the same Last-Write-Wins path as
    // canvas-sync so a clear can't be silently overwritten by a stale sync.
    socket.on("clear-board", ({ timestamp } = {}) => {
      if (!currentRoomId || !timestamp) return;
      const applied = updateSnapshotIfNewer(currentRoomId, null, timestamp);
      if (applied) {
        socket.to(currentRoomId).emit("clear-board", { timestamp, userId: socket.user.id });
      }
    });

    // Full canvas snapshot sent after each completed stroke - the source of
    // truth for late joiners/reconnects. Last-Write-Wins by timestamp: if two
    // clients finish strokes around the same time, whichever timestamp is
    // newer becomes the room's canonical state, and the loser is discarded.
    socket.on("canvas-sync", ({ snapshot, timestamp } = {}) => {
      if (!currentRoomId || !timestamp) return;
      const applied = updateSnapshotIfNewer(currentRoomId, snapshot, timestamp);
      if (applied) {
        socket.to(currentRoomId).emit("canvas-sync", { snapshot, timestamp, userId: socket.user.id });
      }
    });

    // Cursor position broadcast (throttled client-side to ~20/sec)
    socket.on("cursor-move", ({ x, y } = {}) => {
      if (!currentRoomId) return;
      const state = getRoomState(currentRoomId);
      const participant = state.participants.get(socket.id);
      socket.to(currentRoomId).emit("cursor-move", {
        userId: socket.user.id,
        name: socket.user.name,
        color: participant?.color || CURSOR_COLORS[0],
        x,
        y,
      });
    });

    socket.on("leave-room", leaveCurrentRoom);
    socket.on("disconnect", leaveCurrentRoom);
  });

  return io;
};

module.exports = initSocket;
