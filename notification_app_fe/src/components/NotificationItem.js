import React from "react";
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Box,
  Tooltip,
  Typography,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { markAsRead, deleteNotification } from "../services/api";
import Log from "../services/logger";

/**
 * NotificationItem Component
 * Renders a single campus notification with type-specific icons.
 * Types: placement (job icon), event (calendar icon), result (assignment icon)
 */

const typeIcons = {
  placement: <WorkIcon color="primary" />,
  event: <EventIcon color="secondary" />,
  result: <AssignmentIcon color="success" />,
};

const typeLabels = {
  placement: "Placement",
  event: "Event",
  result: "Result",
};

const priorityColors = {
  high: "error",
  medium: "warning",
  low: "default",
};

const NotificationItem = ({ notification, onRefresh }) => {
  const isUnread = notification.status === "unread";
  const id = notification._id || notification.id;

  const handleMarkRead = async () => {
    try {
      Log("frontend", "info", "component", `Marking notification as read: id=${id}`);
      await markAsRead(id);
      Log("frontend", "info", "component", `Notification id=${id} marked as read successfully`);
      onRefresh();
    } catch (err) {
      Log("frontend", "error", "component", `Failed to mark notification id=${id} as read: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      Log("frontend", "info", "component", `Deleting notification: id=${id}`);
      await deleteNotification(id);
      Log("frontend", "info", "component", `Notification id=${id} deleted successfully`);
      onRefresh();
    } catch (err) {
      Log("frontend", "error", "component", `Failed to delete notification id=${id}: ${err.message}`);
    }
  };

  return (
    <ListItem
      sx={{
        bgcolor: isUnread ? "action.hover" : "transparent",
        borderRadius: 1,
        mb: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
      secondaryAction={
        <Box>
          {isUnread && (
            <Tooltip title="Mark as read">
              <IconButton
                edge="end"
                onClick={handleMarkRead}
                aria-label="Mark as read"
              >
                <CheckCircleIcon color="success" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton
              edge="end"
              onClick={handleDelete}
              aria-label="Delete notification"
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemIcon>
        {typeIcons[notification.type] || <EventIcon />}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <strong>{notification.title}</strong>
            <Chip
              label={typeLabels[notification.type] || notification.type}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={notification.priority}
              size="small"
              color={priorityColors[notification.priority] || "default"}
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <>
            {notification.message}
            <br />
            <Typography
              variant="caption"
              color="text.secondary"
              component="span"
            >
              {new Date(notification.createdAt).toLocaleString()}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default NotificationItem;
