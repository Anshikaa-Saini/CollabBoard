const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Socket.io middleware that authenticates a connecting client using the
 * same JWT scheme as the REST API. The token is expected on
 * `socket.handshake.auth.token` (set by the frontend socket client).
 * On success, attaches a minimal `socket.user` object for use by handlers.
 */
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User no longer exists"));
    }

    socket.user = { id: user._id.toString(), name: user.name };
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
};

module.exports = socketAuth;
