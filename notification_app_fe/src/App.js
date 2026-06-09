import React, { useState, useEffect } from "react";
import { Container, AppBar, Toolbar, Typography, Box } from "@mui/material";
import NotificationList from "./components/NotificationList";
import NotificationBell from "./components/NotificationBell";
import { getNotifications, getUnreadCount } from "./services/api";
import { connectSocket, subscribeToNotifications } from "./services/socket";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Connect to WebSocket
    const socket = connectSocket();
    subscribeToNotifications(socket, {
      onNewNotification: (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      },
      onNotificationRead: ({ id }) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id || n.id === id ? { ...n, status: "read" } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      },
      onAllRead: () => {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: "read" }))
        );
        setUnreadCount(0);
      },
      onDeleted: ({ id }) => {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== id && n.id !== id)
        );
      },
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      const res = await getNotifications(pageNum);
      setNotifications(res.data.data.notifications);
      setTotalPages(res.data.data.pagination.totalPages);
      setPage(res.data.data.pagination.currentPage);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notification App
          </Typography>
          <NotificationBell count={unreadCount} />
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
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
