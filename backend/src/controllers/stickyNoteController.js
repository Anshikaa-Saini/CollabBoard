const StickyNote = require("../models/StickyNote");
const Room = require("../models/Room");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { generateStickyNoteTasks } = require("../services/aiService");

const ensureMembership = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, "Room not found");

  const isMember = room.members.some((memberId) => memberId.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, "You do not have access to this room");

  return room;
};

const NOTE_COLORS = ["#fef08a", "#bfdbfe", "#bbf7d0", "#fecaca", "#e9d5ff"];

// Simple cascading grid so freshly generated notes don't all stack exactly
// on top of one another; the user can drag them wherever they like after.
const layoutPosition = (index) => ({
  x: 40 + (index % 4) * 180,
  y: 40 + Math.floor(index / 4) * 160,
});

/**
 * @route   GET /api/rooms/:id/sticky-notes
 * @access  Private (room members)
 */
const getStickyNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureMembership(id, req.user._id);

  const notes = await StickyNote.find({ room: id }).sort({ createdAt: 1 });

  res.status(200).json({ success: true, data: { notes } });
});

/**
 * @route   POST /api/rooms/:id/sticky-notes/generate
 * @access  Private (room members)
 * Body: { prompt } - e.g. "Generate sprint tasks for login module"
 */
const generateStickyNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { prompt } = req.body;

  await ensureMembership(id, req.user._id);

  const existingCount = await StickyNote.countDocuments({ room: id });
  const tasks = await generateStickyNoteTasks(prompt);

  if (tasks.length === 0) {
    throw new ApiError(502, "AI did not return any tasks. Please try a different prompt.");
  }

  const notesToCreate = tasks.map((text, i) => {
    const { x, y } = layoutPosition(existingCount + i);
    return {
      room: id,
      text,
      color: NOTE_COLORS[(existingCount + i) % NOTE_COLORS.length],
      x,
      y,
      createdBy: req.user._id,
    };
  });

  const notes = await StickyNote.insertMany(notesToCreate);

  res.status(201).json({
    success: true,
    message: "Sticky notes generated",
    data: { notes },
  });
});

/**
 * @route   PATCH /api/rooms/:id/sticky-notes/:noteId
 * @access  Private (room members)
 * Body: { x, y } - called when a note finishes being dragged.
 */
const updateStickyNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  const { x, y } = req.body;

  await ensureMembership(id, req.user._id);

  const note = await StickyNote.findOne({ _id: noteId, room: id });
  if (!note) throw new ApiError(404, "Sticky note not found");

  if (typeof x === "number") note.x = x;
  if (typeof y === "number") note.y = y;
  await note.save();

  res.status(200).json({ success: true, data: { note } });
});

/**
 * @route   DELETE /api/rooms/:id/sticky-notes/:noteId
 * @access  Private (room members)
 */
const deleteStickyNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;
  await ensureMembership(id, req.user._id);

  const note = await StickyNote.findOneAndDelete({ _id: noteId, room: id });
  if (!note) throw new ApiError(404, "Sticky note not found");

  res.status(200).json({ success: true, message: "Sticky note deleted" });
});

module.exports = { getStickyNotes, generateStickyNotes, updateStickyNote, deleteStickyNote };
