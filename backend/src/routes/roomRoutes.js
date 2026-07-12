const express = require("express");
const {
  createRoom,
  joinRoom,
  getMyRooms,
  getRoomById,
} = require("../controllers/roomController");
const validate = require("../middleware/validate");
const { createRoomSchema, joinRoomSchema } = require("../validators/roomValidator");
const protect = require("../middleware/auth");

const router = express.Router();

// All room routes require authentication
router.use(protect);

router.post("/", validate(createRoomSchema), createRoom);
router.post("/join", validate(joinRoomSchema), joinRoom);
router.get("/", getMyRooms);
router.get("/:id", getRoomById);

module.exports = router;
