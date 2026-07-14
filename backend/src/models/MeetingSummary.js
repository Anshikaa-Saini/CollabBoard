const mongoose = require("mongoose");

const meetingSummarySchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    summary: { type: String, default: "" },
    actionItems: { type: [String], default: [] },
    decisionsTaken: { type: [String], default: [] },
    openQuestions: { type: [String], default: [] },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

meetingSummarySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("MeetingSummary", meetingSummarySchema);
