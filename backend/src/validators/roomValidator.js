const { z } = require("zod");

const createRoomSchema = z.object({
  name: z
    .string({ required_error: "Room name is required" })
    .trim()
    .min(2, "Room name must be at least 2 characters")
    .max(100, "Room name must be under 100 characters"),
});

const joinRoomSchema = z.object({
  code: z
    .string({ required_error: "Room code is required" })
    .trim()
    .toUpperCase()
    .length(6, "Room code must be exactly 6 characters"),
});

const renameRoomSchema = z.object({
  name: z
    .string({ required_error: "Room name is required" })
    .trim()
    .min(2, "Room name must be at least 2 characters")
    .max(100, "Room name must be under 100 characters"),
});

module.exports = { createRoomSchema, joinRoomSchema, renameRoomSchema };
