const MeetingSummary = require("../models/MeetingSummary");
const StickyNote = require("../models/StickyNote");
const Room = require("../models/Room");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { generateMeetingSummary } = require("../services/aiService");

const ensureMembership = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, "Room not found");

  const isMember = room.members.some((memberId) => memberId.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, "You do not have access to this room");

  return room;
};

/**
 * @route   POST /api/rooms/:id/ai/summary
 * @access  Private (room members)
 * Summarizes this room's sticky notes into a structured meeting recap
 * (summary, action items, decisions taken, open questions) and stores it.
 */
const generateSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureMembership(id, req.user._id);

  const notes = await StickyNote.find({ room: id }).sort({ createdAt: 1 });
  if (notes.length === 0) {
    throw new ApiError(400, "Add some sticky notes before generating a summary");
  }

  const notesText = notes.map((note, i) => `${i + 1}. ${note.text}`).join("\n");
  const result = await generateMeetingSummary(notesText);

  const summary = await MeetingSummary.create({
    room: id,
    ...result,
    generatedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Summary generated",
    data: { summary },
  });
});

/**
 * @route   GET /api/rooms/:id/ai/summary
 * @access  Private (room members)
 * Returns the most recently generated summary for this room, if any.
 */
const getLatestSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureMembership(id, req.user._id);

  const summary = await MeetingSummary.findOne({ room: id }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { summary } });
});

module.exports = { generateSummary, getLatestSummary };
