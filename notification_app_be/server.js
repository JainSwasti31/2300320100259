// Load environment variables before any module that depends on them
require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const Log = require("../logging_middleware");
const notificationRoutes = require("./routes/notification.routes");
const { setupSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Socket.IO configuration with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Make Socket.IO instance accessible in route handlers
app.set("io", io);

// Global middleware
app.use(cors());
app.use(express.json());

// HTTP request/response logging via logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    Log(
      "backend",
      res.statusCode >= 400 ? "error" : "info",
      "middleware",
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// API Routes
app.use("/api/v1/notifications", notificationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Campus Notification Server is running" });
});

// Initialize Socket.IO
setupSocket(io);

// Database connection and server startup
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/notification_app";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    Log("backend", "info", "db", "Successfully connected to MongoDB");
    server.listen(PORT, () => {
      Log(
        "backend",
        "info",
        "domain",
        `Campus Notification Server running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    Log(
      "backend",
      "fatal",
      "db",
      `MongoDB connection failed: ${err.message}. Server shutting down.`
    );
    process.exit(1);
  });
