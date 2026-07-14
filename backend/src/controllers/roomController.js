const Room = require("../models/Room");
const Board = require("../models/Board");
const StickyNote = require("../models/StickyNote");
const MeetingSummary = require("../models/MeetingSummary");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateRoomCode = require("../utils/generateRoomCode");

const MAX_CODE_ATTEMPTS = 5;

/**
 * Generates a room code and retries on the rare chance of a collision.
 */
const generateUniqueRoomCode = async () => {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    // eslint-disable-next-line no-await-in-loop
    const existing = await Room.findOne({ code });
    if (!existing) return code;
  }
  throw new ApiError(500, "Could not generate a unique room code, please try again");
};

/**
 * @route   POST /api/rooms
 * @access  Private
 */
const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const code = await generateUniqueRoomCode();

  const room = await Room.create({
    name,
    code,
    owner: req.user._id,
    members: [req.user._id],
  });

  await room.populate("owner", "name email");

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: { room },
  });
});

/**
 * @route   POST /api/rooms/join
 * @access  Private
 */
const joinRoom = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const room = await Room.findOne({ code });
  if (!room) {
    throw new ApiError(404, "No room found with this code");
  }

  const alreadyMember = room.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (!alreadyMember) {
    room.members.push(req.user._id);
    await room.save();
  }

  await room.populate("owner", "name email");

  res.status(200).json({
    success: true,
    message: "Joined room successfully",
    data: { room },
  });
});

/**
 * @route   GET /api/rooms
 * @access  Private
 * Returns all rooms the current user owns or has joined, most recently updated first.
 */
const getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ members: req.user._id })
    .populate("owner", "name email")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: { rooms },
  });
});

/**
 * @route   GET /api/rooms/:id
 * @access  Private
 * Fetches a single room's metadata. Used by the Room page so a refresh
 * or a direct link still resolves the room name/code correctly.
 */
const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await Room.findById(id).populate("owner", "name email");

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const isMember = room.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );

  if (!isMember) {
    throw new ApiError(403, "You do not have access to this room");
  }

  res.status(200).json({
    success: true,
    data: { room },
  });
});

/**
 * @route   PATCH /api/rooms/:id
 * @access  Private (owner only)
 */
const renameRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const room = await Room.findById(id);
  if (!room) throw new ApiError(404, "Room not found");

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the room owner can rename this room");
  }

  room.name = name;
  await room.save();
  await room.populate("owner", "name email");

  res.status(200).json({
    success: true,
    message: "Room renamed",
    data: { room },
  });
});

/**
 * @route   DELETE /api/rooms/:id
 * @access  Private (owner only)
 * Cascades to the room's board, sticky notes, and meeting summaries so
 * deleting a room doesn't leave orphaned documents behind.
 */
const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await Room.findById(id);
  if (!room) throw new ApiError(404, "Room not found");

  if (room.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the room owner can delete this room");
  }

  await Promise.all([
    Room.deleteOne({ _id: id }),
    Board.deleteOne({ room: id }),
    StickyNote.deleteMany({ room: id }),
    MeetingSummary.deleteMany({ room: id }),
  ]);

  res.status(200).json({
    success: true,
    message: "Room deleted",
  });
});

module.exports = { createRoom, joinRoom, getMyRooms, getRoomById, renameRoom, deleteRoom };
