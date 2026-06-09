const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Log = require("../logging_middleware");
const notificationRoutes = require("./routes/notification.routes");
const { setupSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// HTTP request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    Log(
      "HTTPMiddleware",
      res.statusCode >= 400 ? "error" : "info",
      "notification_app_be",
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) from ${req.ip}`
    );
  });
  next();
});

// Routes
app.use("/api/v1/notifications", notificationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Socket.IO authentication and setup
setupSocket(io);

// MongoDB connection and server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/notification_app";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    Log(
      "Server.startup",
      "info",
      "notification_app_be",
      `Successfully connected to MongoDB at ${MONGODB_URI}`
    );
    server.listen(PORT, () => {
      Log(
        "Server.startup",
        "info",
        "notification_app_be",
        `Server running on port ${PORT}, accepting connections`
      );
    });
  })
  .catch((err) => {
    Log(
      "Server.startup",
      "error",
      "notification_app_be",
      `MongoDB connection failed: ${err.message}. Shutting down.`
    );
    process.exit(1);
  });
