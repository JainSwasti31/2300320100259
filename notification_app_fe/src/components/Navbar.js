import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";

/**
 * Navbar with navigation between All Notifications and Priority Inbox
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#1565c0" }}>
      <Toolbar>
        <SchoolIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Campus Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<NotificationsIcon />}
            onClick={() => navigate("/")}
            variant={location.pathname === "/" ? "outlined" : "text"}
            sx={{ borderColor: "white" }}
          >
            All
          </Button>
          <Button
            color="inherit"
            startIcon={<StarIcon />}
            onClick={() => navigate("/priority")}
            variant={location.pathname === "/priority" ? "outlined" : "text"}
            sx={{ borderColor: "white" }}
          >
            Priority
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
