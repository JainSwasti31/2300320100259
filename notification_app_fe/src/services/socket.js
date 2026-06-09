import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const connectSocket = () => {
  const token = localStorage.getItem("token") || "demo_token";

  const socket = io(SOCKET_URL, {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
};

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
