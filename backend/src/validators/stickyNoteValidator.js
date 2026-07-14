const { z } = require("zod");

const generateStickyNotesSchema = z.object({
  prompt: z
    .string({ required_error: "Prompt is required" })
    .trim()
    .min(3, "Prompt is too short")
    .max(300, "Prompt is too long"),
});

const updateStickyNoteSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
});

module.exports = { generateStickyNotesSchema, updateStickyNoteSchema };
