import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FiberNewIcon from "@mui/icons-material/FiberNew";

/**
 * NotificationCard - renders a single notification
 * Shows type icon, message, timestamp, and new/viewed indicator
 */

const typeConfig = {
  Placement: { icon: <WorkIcon />, color: "#1565c0", label: "Placement" },
  Result: { icon: <AssignmentIcon />, color: "#2e7d32", label: "Result" },
  Event: { icon: <EventIcon />, color: "#e65100", label: "Event" },
};

const NotificationCard = ({ notification, isViewed, onMarkViewed, showScore }) => {
  const config = typeConfig[notification.Type] || typeConfig.Event;
  const timeAgo = getTimeAgo(notification.Timestamp);

  return (
    <Card
      sx={{
        mb: 1.5,
        border: isViewed ? "1px solid #e0e0e0" : "2px solid #1565c0",
        bgcolor: isViewed ? "#fafafa" : "#ffffff",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Type icon */}
          <Box sx={{ color: config.color, display: "flex" }}>
            {config.icon}
          </Box>

          {/* Content */}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body1" sx={{ fontWeight: isViewed ? 400 : 600 }}>
                {notification.Message}
              </Typography>
              <Chip
                label={config.label}
                size="small"
                sx={{ bgcolor: config.color, color: "white", height: 22, fontSize: "0.7rem" }}
              />
              {!isViewed && (
                <Chip
                  icon={<FiberNewIcon sx={{ fontSize: 14, color: "#fff !important" }} />}
                  label="New"
                  size="small"
                  sx={{ bgcolor: "#e91e63", color: "white", height: 22, fontSize: "0.7rem" }}
                />
              )}
              {showScore && notification.score && (
                <Chip
                  label={`Score: ${notification.score.toFixed(3)}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: "0.7rem" }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {timeAgo} &middot; {notification.Timestamp}
            </Typography>
          </Box>

          {/* Mark as viewed */}
          {!isViewed && (
            <Tooltip title="Mark as viewed">
              <IconButton
                size="small"
                onClick={() => onMarkViewed(notification.ID)}
                aria-label="Mark as viewed"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

/** Compute human-readable time ago */
function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default NotificationCard;
