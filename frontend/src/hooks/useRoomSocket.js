import { useCallback, useEffect, useRef, useState } from "react";
import socket from "../socket/socket";

/**
 * Encapsulates all Socket.io wiring for a single whiteboard room: joining
 * the room (and re-joining automatically on reconnect), tracking
 * participant count and remote cursors, and exposing emit helpers for
 * outgoing drawing events.
 *
 * Incoming drawing events are applied directly onto the canvas via the
 * `whiteboardRef` imperative API (see Whiteboard.jsx), bypassing React
 * state so a fast-drawing remote user doesn't cause a re-render per segment.
 *
 * Pass `roomId` as null/undefined to stay idle (e.g. while the room's
 * metadata is still loading and the Whiteboard hasn't mounted yet).
 */
const useRoomSocket = (roomId, whiteboardRef) => {
  const [connected, setConnected] = useState(socket.connected);
  const [participantCount, setParticipantCount] = useState(1);
  const [remoteCursors, setRemoteCursors] = useState({}); // userId -> { name, color, x, y }

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  useEffect(() => {
    if (!roomId) return undefined;

    const joinRoom = () => socket.emit("join-room", { roomId: roomIdRef.current });

    // Fires on the very first connection AND on every automatic reconnect -
    // this single handler is what makes "reconnect handling" work: the
    // client just re-announces itself and the server re-syncs it.
    const handleConnect = () => {
      setConnected(true);
      joinRoom();
    };

    const handleDisconnect = () => setConnected(false);

    const handleBoardState = ({ snapshot }) => {
      if (snapshot) whiteboardRef.current?.loadSnapshot(snapshot);
    };

    const handleParticipantsUpdate = ({ count }) => setParticipantCount(count);

    const handleRemoteDraw = (segment) => {
      whiteboardRef.current?.drawRemoteSegment(segment);
    };

    const handleRemoteClear = () => {
      whiteboardRef.current?.clearRemote();
    };

    const handleRemoteSnapshot = ({ snapshot }) => {
      if (snapshot) whiteboardRef.current?.loadSnapshot(snapshot);
    };

    const handleCursorMove = ({ userId, name, color, x, y }) => {
      setRemoteCursors((prev) => ({ ...prev, [userId]: { name, color, x, y } }));
    };

    const handleCursorLeave = ({ userId }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("board-state", handleBoardState);
    socket.on("participants-update", handleParticipantsUpdate);
    socket.on("draw", handleRemoteDraw);
    socket.on("clear-board", handleRemoteClear);
    socket.on("canvas-sync", handleRemoteSnapshot);
    socket.on("cursor-move", handleCursorMove);
    socket.on("cursor-leave", handleCursorLeave);

    // The socket may already be connected (e.g. navigated here from the
    // Dashboard with a warm connection) - in that case "connect" won't fire
    // again, so join explicitly.
    if (socket.connected) {
      setConnected(true);
      joinRoom();
    }

    return () => {
      socket.emit("leave-room");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("board-state", handleBoardState);
      socket.off("participants-update", handleParticipantsUpdate);
      socket.off("draw", handleRemoteDraw);
      socket.off("clear-board", handleRemoteClear);
      socket.off("canvas-sync", handleRemoteSnapshot);
      socket.off("cursor-move", handleCursorMove);
      socket.off("cursor-leave", handleCursorLeave);
      setRemoteCursors({});
    };
  }, [roomId, whiteboardRef]);

  const emitDraw = useCallback((segment) => {
    socket.emit("draw", { ...segment, timestamp: Date.now() });
  }, []);

  const emitClear = useCallback(() => {
    socket.emit("clear-board", { timestamp: Date.now() });
  }, []);

  const emitSnapshot = useCallback((snapshot) => {
    socket.emit("canvas-sync", { snapshot, timestamp: Date.now() });
  }, []);

  const emitCursor = useCallback((x, y) => {
    socket.emit("cursor-move", { x, y });
  }, []);

  return {
    connected,
    participantCount,
    remoteCursors,
    emitDraw,
    emitClear,
    emitSnapshot,
    emitCursor,
  };
};

export default useRoomSocket;
