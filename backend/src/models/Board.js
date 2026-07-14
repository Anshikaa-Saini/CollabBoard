const mongoose = require("mongoose");

// Each history entry is a previously-saved full canvas snapshot, kept so a
// user can see/restore recent versions. Intentionally NOT its own collection
// - it's small, always read together with the board, and capped in size by
// the controller (see MAX_HISTORY in boardController.js).
const historyEntrySchema = new mongoose.Schema(
  {
    snapshot: { type: String, required: true },
    savedAt: { type: Date, default: Date.now },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const boardSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      unique: true,
    },
    // Full canvas as a data URL (same format used by Milestone 3's socket
    // sync), or null for a board that's never been saved. We persist a
    // raster snapshot rather than a stroke-by-stroke event log - simple to
    // save/restore, at the cost of not supporting fine-grained replay.
    snapshot: {
      type: String,
      default: null,
    },
    lastSavedAt: {
      type: Date,
      default: null,
    },
    lastSavedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

boardSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("Board", boardSchema);
