const jwt = require("jsonwebtoken");
const Log = require("../../logging_middleware");

const PKG = "notification_app_be";


const setupSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      Log(
        "Socket.authMiddleware",
        "warn",
        PKG,
        `Socket connection rejected - no auth token provided from ${socket.handshake.address}`
      );
      return next(new Error("Authentication token is required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      Log(
        "Socket.authMiddleware",
        "debug",
        PKG,
        `Socket authenticated for user=${decoded.userId}`
      );
      next();
    } catch (err) {
      Log(
        "Socket.authMiddleware",
        "warn",
        PKG,
        `Socket authentication failed: ${err.message}`
      );
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    Log(
      "Socket.connection",
      "info",
      PKG,
      `User connected via WebSocket: userId=${socket.userId}, socketId=${socket.id}`
    );

    // Join user to their private room
    socket.join(`user_${socket.userId}`);

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      Log(
        "Socket.disconnect",
        "info",
        PKG,
        `User disconnected: userId=${socket.userId}, socketId=${socket.id}, reason=${reason}`
      );
    });
  });
};

module.exports = { setupSocket };
