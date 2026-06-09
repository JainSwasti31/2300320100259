const Notification = require("../models/Notification");
const Log = require("../../logging_middleware");

/**
 * GET /api/v1/notifications
 * Retrieves all notifications with pagination and optional status filter.
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "all", type } = req.query;

    Log(
      "backend",
      "info",
      "controller",
      `Fetching notifications: page=${page}, limit=${limit}, status=${status}, type=${type || "all"}`
    );

    const filter = {};
    if (status !== "all") {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalItems = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    Log(
      "backend",
      "info",
      "controller",
      `Returned ${notifications.length} of ${totalItems} total notifications`
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
      "backend",
      "error",
      "controller",
      `Failed to fetch notifications: ${err.message}`
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
 * GET /api/v1/notifications/:id
 * Retrieves a single notification by its ID.
 */
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    Log("backend", "info", "controller", `Fetching notification id=${id}`);

    const notification = await Notification.findById(id);

    if (!notification) {
      Log("backend", "warn", "controller", `Notification id=${id} not found`);
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
      "backend",
      "error",
      "controller",
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
 * POST /api/v1/notifications
 * Creates a new campus notification (Placement, Event, or Result).
 */
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, priority, metadata } = req.body;

    Log(
      "backend",
      "info",
      "controller",
      `Creating notification: type=${type}, priority=${priority || "low"}, title="${title}"`
    );

    // Manual validation without external libraries
    const errors = [];
    if (!title) errors.push({ field: "title", message: "Title is required." });
    if (!message) errors.push({ field: "message", message: "Message is required." });
    if (!type) errors.push({ field: "type", message: "Type is required." });
    if (type && !["placement", "event", "result"].includes(type)) {
      errors.push({ field: "type", message: "Type must be placement, event, or result." });
    }
    if (priority && !["low", "medium", "high"].includes(priority)) {
      errors.push({ field: "priority", message: "Priority must be low, medium, or high." });
    }

    if (errors.length > 0) {
      Log(
        "backend",
        "warn",
        "handler",
        `Validation failed for createNotification: ${errors.map((e) => e.field).join(", ")}`
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
      title,
      message,
      type,
      priority: priority || "low",
      metadata: metadata || {},
    });

    Log(
      "backend",
      "info",
      "controller",
      `Notification created: id=${notification._id}, type=${type}, emitting real-time event`
    );

    // Emit real-time notification via Socket.IO to all connected clients
    const io = req.app.get("io");
    io.emit("new_notification", {
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
      "backend",
      "error",
      "controller",
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
 * PATCH /api/v1/notifications/:id/read
 * Marks a specific notification as read.
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    Log("backend", "info", "controller", `Marking notification id=${id} as read`);

    const notification = await Notification.findByIdAndUpdate(
      id,
      { status: "read", readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      Log("backend", "warn", "controller", `Notification id=${id} not found for markAsRead`);
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
    io.emit("notification_read", {
      id: notification._id,
      readAt: notification.readAt,
    });

    Log("backend", "info", "handler", `Notification id=${id} marked as read at ${notification.readAt}`);

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
      "backend",
      "error",
      "controller",
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
 * PATCH /api/v1/notifications/read-all
 * Marks all unread notifications as read.
 */
exports.markAllAsRead = async (req, res) => {
  try {
    Log("backend", "info", "controller", "Marking all unread notifications as read");

    const result = await Notification.updateMany(
      { status: "unread" },
      { status: "read", readAt: new Date() }
    );

    // Emit real-time event
    const io = req.app.get("io");
    io.emit("all_notifications_read", {
      updatedCount: result.modifiedCount,
    });

    Log(
      "backend",
      "info",
      "handler",
      `Marked ${result.modifiedCount} notifications as read`
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
      "backend",
      "error",
      "controller",
      `Failed to mark all as read: ${err.message}`
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
 * DELETE /api/v1/notifications/:id
 * Deletes a specific notification.
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    Log("backend", "info", "controller", `Deleting notification id=${id}`);

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      Log("backend", "warn", "controller", `Notification id=${id} not found for deletion`);
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
    io.emit("notification_deleted", { id: notification._id });

    Log("backend", "info", "controller", `Notification id=${id} deleted successfully`);

    res.status(200).json({
      success: true,
      data: {
        message: "Notification deleted successfully.",
        id: notification._id,
      },
    });
  } catch (err) {
    Log(
      "backend",
      "error",
      "controller",
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
 * GET /api/v1/notifications/unread-count
 * Returns the count of all unread notifications.
 */
exports.getUnreadCount = async (req, res) => {
  try {
    Log("backend", "info", "controller", "Fetching unread notification count");

    const unreadCount = await Notification.countDocuments({ status: "unread" });

    Log("backend", "debug", "controller", `Unread count: ${unreadCount}`);

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (err) {
    Log(
      "backend",
      "error",
      "controller",
      `Failed to get unread count: ${err.message}`
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
