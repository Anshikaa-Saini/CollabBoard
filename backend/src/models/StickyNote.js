const mongoose = require("mongoose");

const stickyNoteSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    color: {
      type: String,
      default: "#fef08a",
    },
    // Position in the same fixed canvas-space coordinates (0-1600, 0-900)
    // used by the whiteboard and remote cursors, so notes line up on any screen.
    x: { type: Number, default: 40 },
    y: { type: Number, default: 40 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

stickyNoteSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("StickyNote", stickyNoteSchema);
