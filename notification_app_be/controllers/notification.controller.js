const Notification = require("../models/Notification");
const Log = require("../../logging_middleware");

const PKG = "notification_app_be";

/**
 * Get all notifications for the logged-in user
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "all" } = req.query;
    const userId = req.user.userId;

    Log(
      "NotificationController.getNotifications",
      "info",
      PKG,
      `Fetching notifications for user=${userId}, page=${page}, limit=${limit}, status=${status}`
    );

    const filter = { userId };
    if (status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalItems = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    Log(
      "NotificationController.getNotifications",
      "info",
      PKG,
      `Returned ${notifications.length} notifications out of ${totalItems} total for user=${userId}`
    );

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / parseInt(limit)),
          totalItems,
          limit: parseInt(limit),
        },
      },
    });
  } catch (err) {
    Log(
      "NotificationController.getNotifications",
      "error",
      PKG,
      `Failed to fetch notifications for user=${req.user.userId}: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};

/**
 * Get a single notification by ID
 */
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    Log(
      "NotificationController.getNotificationById",
      "info",
      PKG,
      `Fetching notification id=${id} for user=${req.user.userId}`
    );

    const notification = await Notification.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!notification) {
      Log(
        "NotificationController.getNotificationById",
        "warn",
        PKG,
        `Notification id=${id} not found for user=${req.user.userId}`
      );
      return res.status(404).json({
        success: false,
        error: {
          code: "NOTIFICATION_NOT_FOUND",
          message: "Notification with the given ID does not exist.",
        },
      });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    Log(
      "NotificationController.getNotificationById",
      "error",
      PKG,
      `Error fetching notification id=${req.params.id}: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};

/**
 * Create a new notification
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, priority, metadata } = req.body;

    Log(
      "NotificationController.createNotification",
      "info",
      PKG,
      `Creating notification: type=${type}, priority=${priority || "low"}, targetUser=${userId}, title="${title}"`
    );

    // Validation
    const errors = [];
    if (!userId) errors.push({ field: "userId", message: "User ID is required." });
    if (!title) errors.push({ field: "title", message: "Title is required." });
    if (!message) errors.push({ field: "message", message: "Message is required." });
    if (!type) errors.push({ field: "type", message: "Type is required." });

    if (errors.length > 0) {
      Log(
        "NotificationController.createNotification",
        "warn",
        PKG,
        `Validation failed: ${errors.map((e) => e.field).join(", ")} missing`
      );
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: errors,
        },
      });
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      priority: priority || "low",
      metadata: metadata || {},
    });

    Log(
      "NotificationController.createNotification",
      "info",
      PKG,
      `Notification created successfully: id=${notification._id}, emitting real-time event to user=${userId}`
    );

    // Emit real-time notification via Socket.IO
    const io = req.app.get("io");
    io.to(`user_${userId}`).emit("new_notification", {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    Log(
      "NotificationController.createNotification",
      "error",
      PKG,
      `Failed to create notification: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    Log(
      "NotificationController.markAsRead",
      "info",
      PKG,
      `Marking notification id=${id} as read for user=${req.user.userId}`
    );

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { status: "read", readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      Log(
        "NotificationController.markAsRead",
        "warn",
        PKG,
        `Notification id=${id} not found or not owned by user=${req.user.userId}`
      );
      return res.status(404).json({
        success: false,
        error: {
          code: "NOTIFICATION_NOT_FOUND",
          message: "Notification with the given ID does not exist.",
        },
      });
    }

    // Emit real-time event
    const io = req.app.get("io");
    io.to(`user_${req.user.userId}`).emit("notification_read", {
      id: notification._id,
      readAt: notification.readAt,
    });

    Log(
      "NotificationController.markAsRead",
      "info",
      PKG,
      `Notification id=${id} marked as read at ${notification.readAt}`
    );

    res.status(200).json({
      success: true,
      data: {
        id: notification._id,
        status: notification.status,
        readAt: notification.readAt,
      },
    });
  } catch (err) {
    Log(
      "NotificationController.markAsRead",
      "error",
      PKG,
      `Failed to mark notification id=${req.params.id} as read: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    Log(
      "NotificationController.markAllAsRead",
      "info",
      PKG,
      `Marking all unread notifications as read for user=${req.user.userId}`
    );

    const result = await Notification.updateMany(
      { userId: req.user.userId, status: "unread" },
      { status: "read", readAt: new Date() }
    );

    // Emit real-time event
    const io = req.app.get("io");
    io.to(`user_${req.user.userId}`).emit("all_notifications_read", {
      updatedCount: result.modifiedCount,
    });

    Log(
      "NotificationController.markAllAsRead",
      "info",
      PKG,
      `Marked ${result.modifiedCount} notifications as read for user=${req.user.userId}`
    );

    res.status(200).json({
      success: true,
      data: {
        message: "All notifications marked as read.",
        updatedCount: result.modifiedCount,
      },
    });
  } catch (err) {
    Log(
      "NotificationController.markAllAsRead",
      "error",
      PKG,
      `Failed to mark all as read for user=${req.user.userId}: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    Log(
      "NotificationController.deleteNotification",
      "info",
      PKG,
      `Deleting notification id=${id} for user=${req.user.userId}`
    );

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!notification) {
      Log(
        "NotificationController.deleteNotification",
        "warn",
        PKG,
        `Notification id=${id} not found or not owned by user=${req.user.userId}`
      );
      return res.status(404).json({
        success: false,
        error: {
          code: "NOTIFICATION_NOT_FOUND",
          message: "Notification with the given ID does not exist.",
        },
      });
    }

    // Emit real-time event
    const io = req.app.get("io");
    io.to(`user_${req.user.userId}`).emit("notification_deleted", {
      id: notification._id,
    });

    Log(
      "NotificationController.deleteNotification",
      "info",
      PKG,
      `Notification id=${id} deleted successfully`
    );

    res.status(200).json({
      success: true,
      data: {
        message: "Notification deleted successfully.",
        id: notification._id,
      },
    });
  } catch (err) {
    Log(
      "NotificationController.deleteNotification",
      "error",
      PKG,
      `Failed to delete notification id=${req.params.id}: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    Log(
      "NotificationController.getUnreadCount",
      "info",
      PKG,
      `Fetching unread count for user=${req.user.userId}`
    );

    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      status: "unread",
    });

    Log(
      "NotificationController.getUnreadCount",
      "debug",
      PKG,
      `User=${req.user.userId} has ${unreadCount} unread notifications`
    );

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (err) {
    Log(
      "NotificationController.getUnreadCount",
      "error",
      PKG,
      `Failed to get unread count for user=${req.user.userId}: ${err.message}`
    );
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};
