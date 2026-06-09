const Log = require("../../logging_middleware");

/**
 * Socket.IO Setup
 * Handles real-time WebSocket connections for campus notifications.
 * No authentication required - users are pre-authorized.
 */
const setupSocket = (io) => {
  io.on("connection", (socket) => {
    Log(
      "backend",
      "info",
      "domain",
      `WebSocket connected: socketId=${socket.id}, transport=${socket.conn.transport.name}`
    );

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      Log(
        "backend",
        "info",
        "domain",
        `WebSocket disconnected: socketId=${socket.id}, reason=${reason}`
      );
    });

    // Handle connection errors
    socket.on("error", (err) => {
      Log(
        "backend",
        "error",
        "domain",
        `WebSocket error: socketId=${socket.id}, error=${err.message}`
      );
    });
  });
};

module.exports = { setupSocket };
