import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import { fetchNotifications } from "../services/api";
import Log from "../services/logger";

/**
 * All Notifications Page
 * Shows all notifications with type filtering and pagination.
 * Distinguishes between new (unviewed) and already viewed notifications.
 */
const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewedIds, setViewedIds] = useState(() => {
    // Persist viewed state in localStorage
    const saved = localStorage.getItem("viewedNotifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (typeFilter !== "all") params.type = typeFilter;

      const data = await fetchNotifications(params);
      setNotifications(data);
      Log("frontend", "info", "page", `Loaded ${data.length} notifications, filter=${typeFilter}`);
    } catch (err) {
      setError("Failed to load notifications. Please try again.");
      Log("frontend", "error", "page", `Load failed: ${err.message}`);
    }
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setTypeFilter(newFilter);
      setPage(1);
      Log("frontend", "info", "component", `Filter changed to: ${newFilter}`);
    }
  };

  const markAsViewed = (id) => {
    const updated = [...viewedIds, id];
    setViewedIds(updated);
    localStorage.setItem("viewedNotifications", JSON.stringify(updated));
    Log("frontend", "info", "state", `Notification marked as viewed: id=${id}`);
  };

  // Pagination
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const paginatedNotifs = notifications.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        All Notifications
      </Typography>

      {/* Type filter */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{ flexWrap: "wrap" }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="Placement">Placement</ToggleButton>
          <ToggleButton value="Result">Result</ToggleButton>
          <ToggleButton value="Event">Event</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Notifications list */}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found for this filter.</Alert>
      )}

      {!loading && paginatedNotifs.map((notif) => (
        <NotificationCard
          key={notif.ID}
          notification={notif}
          isViewed={viewedIds.includes(notif.ID)}
          onMarkViewed={markAsViewed}
          showScore={false}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default AllNotifications;
