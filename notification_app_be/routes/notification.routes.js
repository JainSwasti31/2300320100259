const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notification.controller");

// All routes require authentication
router.use(authMiddleware);

// GET /api/v1/notifications/unread-count (placed before /:id to avoid conflict)
router.get("/unread-count", getUnreadCount);

// GET /api/v1/notifications
router.get("/", getNotifications);

// GET /api/v1/notifications/:id
router.get("/:id", getNotificationById);

// POST /api/v1/notifications
router.post("/", createNotification);

// PATCH /api/v1/notifications/read-all
router.patch("/read-all", markAllAsRead);

// PATCH /api/v1/notifications/:id/read
router.patch("/:id/read", markAsRead);

// DELETE /api/v1/notifications/:id
router.delete("/:id", deleteNotification);

module.exports = router;
