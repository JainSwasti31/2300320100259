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
import InfoIcon from "@mui/icons-material/Info";
import PaymentIcon from "@mui/icons-material/Payment";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningIcon from "@mui/icons-material/Warning";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { markAsRead, deleteNotification } from "../services/api";

const typeIcons = {
  info: <InfoIcon color="info" />,
  payment: <PaymentIcon color="success" />,
  order: <ShoppingCartIcon color="primary" />,
  alert: <WarningIcon color="warning" />,
  system: <SettingsIcon color="action" />,
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
      await markAsRead(id);
      onRefresh();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification(id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete notification:", err);
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
              <IconButton edge="end" onClick={handleMarkRead} aria-label="Mark as read">
                <CheckCircleIcon color="success" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton edge="end" onClick={handleDelete} aria-label="Delete notification">
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemIcon>{typeIcons[notification.type] || <InfoIcon />}</ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <strong>{notification.title}</strong>
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
            <Typography variant="caption" color="text.secondary" component="span">
              {new Date(notification.createdAt).toLocaleString()}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default NotificationItem;
