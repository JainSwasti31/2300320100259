import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Slider,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import { fetchNotifications } from "../services/api";
import { getTopN } from "../services/priority";
import Log from "../services/logger";

/**
 * Priority Inbox Page
 * Shows top N most important notifications ranked by type weight + recency.
 * User can adjust N (5, 10, 15, 20) and filter by type.
 */
const PriorityInbox = () => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [priorityNotifs, setPriorityNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewedIds, setViewedIds] = useState(() => {
    const saved = localStorage.getItem("viewedNotifications");
    return saved ? JSON.parse(saved) : [];
  });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (typeFilter !== "all") params.type = typeFilter;
      const data = await fetchNotifications(params);
      setAllNotifications(data);
      Log("frontend", "info", "page", `Priority: fetched ${data.length} notifications`);
    } catch (err) {
      setError("Failed to load notifications.");
      Log("frontend", "error", "page", `Priority load failed: ${err.message}`);
    }
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Recompute priority whenever data or N changes
  useEffect(() => {
    if (allNotifications.length > 0) {
      const ranked = getTopN(allNotifications, topN);
      setPriorityNotifs(ranked);
      Log("frontend", "info", "state", `Priority computed: top ${topN} from ${allNotifications.length}`);
    }
  }, [allNotifications, topN]);

  const handleTopNChange = (event, newValue) => {
    setTopN(newValue);
    Log("frontend", "info", "component", `Top N changed to: ${newValue}`);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setTypeFilter(newFilter);
      Log("frontend", "info", "component", `Priority filter changed to: ${newFilter}`);
    }
  };

  const markAsViewed = (id) => {
    const updated = [...viewedIds, id];
    setViewedIds(updated);
    localStorage.setItem("viewedNotifications", JSON.stringify(updated));
    Log("frontend", "info", "state", `Notification marked as viewed: id=${id}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Priority Inbox
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ranked by importance: Placement (3x) &gt; Result (2x) &gt; Event (1x), weighted by recency.
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: { sm: "center" } }}>
          {/* Top N slider */}
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary">
              Show top: {topN}
            </Typography>
            <Slider
              value={topN}
              onChange={handleTopNChange}
              min={5}
              max={20}
              step={5}
              marks={[
                { value: 5, label: "5" },
                { value: 10, label: "10" },
                { value: 15, label: "15" },
                { value: 20, label: "20" },
              ]}
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Type filter */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Filter by type:
            </Typography>
            <ToggleButtonGroup
              value={typeFilter}
              exclusive
              onChange={handleFilterChange}
              size="small"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="Placement">Placement</ToggleButton>
              <ToggleButton value="Result">Result</ToggleButton>
              <ToggleButton value="Event">Event</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Priority list */}
      {!loading && !error && priorityNotifs.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && priorityNotifs.map((notif, idx) => (
        <Box key={notif.ID} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              fontWeight: 700,
              color: idx < 3 ? "primary.main" : "text.secondary",
              minWidth: 28,
            }}
          >
            #{idx + 1}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <NotificationCard
              notification={notif}
              isViewed={viewedIds.includes(notif.ID)}
              onMarkViewed={markAsViewed}
              showScore={true}
            />
          </Box>
        </Box>
      ))}
    </Container>
  );
};

export default PriorityInbox;
