const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

/**
 * @route   GET /api/health
 * @access  Public
 */
router.get("/", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

  res.status(200).json({
    success: true,
    message: "CollabBoard API is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStates[mongoose.connection.readyState] || "unknown",
  });
});

module.exports = router;
