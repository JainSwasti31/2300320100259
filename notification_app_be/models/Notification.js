const mongoose = require("mongoose");

/**
 * Notification Schema
 * Represents a campus notification for students about Placements, Events, or Results.
 */
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      required: true,
      enum: ["placement", "event", "result"],
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
