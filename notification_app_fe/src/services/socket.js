import { io } from "socket.io-client";
import Log from "./logger";

/**
 * Socket Service
 * Manages WebSocket connection for real-time campus notifications.
 * No authentication required - users are pre-authorized.
 */

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

/**
 * Establishes WebSocket connection to the notification server.
 * @returns {Socket} Connected socket instance
 */
export const connectSocket = () => {
  Log("frontend", "info", "config", `Initiating WebSocket connection to ${SOCKET_URL}`);

  const socket = io(SOCKET_URL);

  socket.on("connect", () => {
    Log(
      "frontend",
      "info",
      "middleware",
      `WebSocket connected: socketId=${socket.id}`
    );
  });

  socket.on("connect_error", (err) => {
    Log(
      "frontend",
      "error",
      "middleware",
      `WebSocket connection error: ${err.message}`
    );
  });

  socket.on("disconnect", (reason) => {
    Log(
      "frontend",
      "warn",
      "middleware",
      `WebSocket disconnected: reason=${reason}`
    );
  });

  return socket;
};

/**
 * Subscribes to all real-time notification events.
 * @param {Socket} socket - Connected socket instance
 * @param {Object} handlers - Event handler callbacks
 */
export const subscribeToNotifications = (socket, handlers) => {
  const { onNewNotification, onNotificationRead, onAllRead, onDeleted } =
    handlers;

  socket.on("new_notification", (notification) => {
    if (onNewNotification) onNewNotification(notification);
  });

  socket.on("notification_read", (data) => {
    if (onNotificationRead) onNotificationRead(data);
  });

  socket.on("all_notifications_read", (data) => {
    if (onAllRead) onAllRead(data);
  });

  socket.on("notification_deleted", (data) => {
    if (onDeleted) onDeleted(data);
  });
};
