import React, { useState, useEffect } from "react";
import { Container, AppBar, Toolbar, Typography, Box } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import NotificationList from "./components/NotificationList";
import NotificationBell from "./components/NotificationBell";
import { getNotifications, getUnreadCount } from "./services/api";
import { connectSocket, subscribeToNotifications } from "./services/socket";
import Log from "./services/logger";

/**
 * App Component
 * Main entry point for the Campus Notification Platform.
 * Displays real-time notifications about Placements, Events, and Results.
 */
function App() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    Log("frontend", "info", "component", "App mounted - initializing campus notification system");

    fetchNotifications();
    fetchUnreadCount();

    // Establish WebSocket connection for real-time updates
    const socket = connectSocket();

    subscribeToNotifications(socket, {
      onNewNotification: (notification) => {
        Log(
          "frontend",
          "info",
          "state",
          `Real-time notification received: type=${notification.type}, title="${notification.title}"`
        );
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      },
      onNotificationRead: ({ id }) => {
        Log("frontend", "info", "state", `Notification marked as read via socket: id=${id}`);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id || n.id === id ? { ...n, status: "read" } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      },
      onAllRead: () => {
        Log("frontend", "info", "state", "All notifications marked as read via socket");
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: "read" }))
        );
        setUnreadCount(0);
      },
      onDeleted: ({ id }) => {
        Log("frontend", "info", "state", `Notification deleted via socket: id=${id}`);
        setNotifications((prev) =>
          prev.filter((n) => n._id !== id && n.id !== id)
        );
      },
    });

    return () => {
      Log("frontend", "info", "component", "App unmounting - disconnecting socket");
      socket.disconnect();
    };
  }, []);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      Log("frontend", "info", "api", `Fetching notifications page=${pageNum}`);
      const res = await getNotifications(pageNum);
      setNotifications(res.data.data.notifications);
      setTotalPages(res.data.data.pagination.totalPages);
      setPage(res.data.data.pagination.currentPage);
      Log(
        "frontend",
        "info",
        "api",
        `Loaded ${res.data.data.notifications.length} notifications`
      );
    } catch (err) {
      Log("frontend", "error", "api", `Failed to fetch notifications: ${err.message}`);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.data.unreadCount);
      Log("frontend", "debug", "api", `Unread count: ${res.data.data.unreadCount}`);
    } catch (err) {
      Log("frontend", "error", "api", `Failed to fetch unread count: ${err.message}`);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: "#1565c0" }}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Campus Notifications
          </Typography>
          <NotificationBell count={unreadCount} />
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <NotificationList
          notifications={notifications}
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => fetchNotifications(newPage)}
          onRefresh={() => {
            fetchNotifications();
            fetchUnreadCount();
          }}
        />
      </Container>
    </Box>
  );
}

export default App;
