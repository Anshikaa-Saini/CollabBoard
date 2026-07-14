const express = require("express");
const {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomById,
  renameRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { getBoard, saveBoard } = require("../controllers/boardController");
const {
  getStickyNotes,
  generateStickyNotes,
  updateStickyNote,
  deleteStickyNote,
} = require("../controllers/stickyNoteController");
const { generateSummary, getLatestSummary } = require("../controllers/aiController");
const validate = require("../middleware/validate");
const { createRoomSchema, joinRoomSchema, renameRoomSchema } = require("../validators/roomValidator");
const { saveBoardSchema } = require("../validators/boardValidator");
const {
  generateStickyNotesSchema,
  updateStickyNoteSchema,
} = require("../validators/stickyNoteValidator");
const protect = require("../middleware/auth");

const router = express.Router();

// All room routes require authentication
router.use(protect);

// Room CRUD
router.post("/", validate(createRoomSchema), createRoom);
router.post("/join", validate(joinRoomSchema), joinRoom);
router.get("/", getMyRooms);
router.get("/:id", getRoomById);
router.patch("/:id", validate(renameRoomSchema), renameRoom);
router.delete("/:id", deleteRoom);

// Whiteboard persistence (auto-save + manual save both hit the same endpoint)
router.get("/:id/board", getBoard);
router.post("/:id/board", validate(saveBoardSchema), saveBoard);

// AI sticky notes
router.get("/:id/sticky-notes", getStickyNotes);
router.post("/:id/sticky-notes/generate", validate(generateStickyNotesSchema), generateStickyNotes);
router.patch("/:id/sticky-notes/:noteId", validate(updateStickyNoteSchema), updateStickyNote);
router.delete("/:id/sticky-notes/:noteId", deleteStickyNote);

// AI meeting summary
router.get("/:id/ai/summary", getLatestSummary);
router.post("/:id/ai/summary", generateSummary);

module.exports = router;
