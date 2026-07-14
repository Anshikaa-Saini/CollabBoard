const Board = require("../models/Board");
const Room = require("../models/Room");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const MAX_HISTORY = 5;

const ensureMembership = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, "Room not found");

  const isMember = room.members.some((memberId) => memberId.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, "You do not have access to this room");

  return room;
};

/**
 * @route   GET /api/rooms/:id/board
 * @access  Private (room members)
 * Used when a room is opened/reopened to restore the persisted whiteboard.
 */
const getBoard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureMembership(id, req.user._id);

  const board = await Board.findOne({ room: id })
    .populate("lastSavedBy", "name")
    .populate("history.savedBy", "name");

  res.status(200).json({
    success: true,
    data: {
      board: board || { snapshot: null, lastSavedAt: null, lastSavedBy: null, history: [] },
    },
  });
});

/**
 * @route   POST /api/rooms/:id/board
 * @access  Private (room members)
 * Persists the current canvas. Used identically by both the 10-second
 * auto-save timer and the manual Save button on the frontend - from the
 * server's point of view, a save is a save.
 */
const saveBoard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { snapshot } = req.body;

  await ensureMembership(id, req.user._id);

  let board = await Board.findOne({ room: id });

  if (!board) {
    board = new Board({ room: id, history: [] });
  } else if (board.snapshot) {
    // Push the outgoing snapshot into history before overwriting it, so
    // "Room history" always reflects what was actually saved before, not the
    // draft currently being written.
    board.history.unshift({
      snapshot: board.snapshot,
      savedAt: board.lastSavedAt || new Date(),
      savedBy: board.lastSavedBy,
    });
    board.history = board.history.slice(0, MAX_HISTORY);
  }

  board.snapshot = snapshot;
  board.lastSavedAt = new Date();
  board.lastSavedBy = req.user._id;
  await board.save();

  res.status(200).json({
    success: true,
    message: "Board saved",
    data: { lastSavedAt: board.lastSavedAt },
  });
});

module.exports = { getBoard, saveBoard };
