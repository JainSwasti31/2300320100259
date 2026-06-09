import React from "react";
import {
  List,
  Typography,
  Box,
  Button,
  Pagination,
  Paper,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationItem from "./NotificationItem";
import { markAllAsRead } from "../services/api";
import Log from "../services/logger";

/**
 * NotificationList Component
 * Displays a paginated list of campus notifications with a "Mark All Read" action.
 */
const NotificationList = ({
  notifications,
  page,
  totalPages,
  onPageChange,
  onRefresh,
}) => {
  const handleMarkAllRead = async () => {
    try {
      Log("frontend", "info", "component", "User clicked Mark All Read");
      await markAllAsRead();
      Log("frontend", "info", "component", "All notifications marked as read successfully");
      onRefresh();
    } catch (err) {
      Log("frontend", "error", "component", `Failed to mark all as read: ${err.message}`);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1">
          Campus Notifications
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
        >
          Mark All Read
        </Button>
      </Box>

      {notifications.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ py: 4, textAlign: "center" }}
        >
          No notifications yet. Check back for Placements, Events, and Results updates.
        </Typography>
      ) : (
        <>
          <List>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id || notification.id}
                notification={notification}
                onRefresh={onRefresh}
              />
            ))}
          </List>
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => onPageChange(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default NotificationList;
