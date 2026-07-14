const { z } = require("zod");

const saveBoardSchema = z.object({
  snapshot: z
    .string({ required_error: "Snapshot is required" })
    .min(1, "Snapshot is required"),
});

module.exports = { saveBoardSchema };
