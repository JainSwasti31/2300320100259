const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notification.controller");

// No authentication required - users are pre-authorized

// GET /api/v1/notifications/unread-count (placed before /:id to avoid route conflict)
router.get("/unread-count", getUnreadCount);

// GET /api/v1/notifications
router.get("/", getNotifications);

// GET /api/v1/notifications/:id
router.get("/:id", getNotificationById);

// POST /api/v1/notifications
router.post("/", createNotification);

// PATCH /api/v1/notifications/read-all (placed before /:id/read to avoid conflict)
router.patch("/read-all", markAllAsRead);

// PATCH /api/v1/notifications/:id/read
router.patch("/:id/read", markAsRead);

// DELETE /api/v1/notifications/:id
router.delete("/:id", deleteNotification);

module.exports = router;
