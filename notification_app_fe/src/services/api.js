import axios from "axios";
import Log from "./logger";

/**
 * API Service
 * Handles all HTTP communication with the backend notification API.
 * No authentication headers needed - users are pre-authorized.
 */

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:5000/api/v1/notifications";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - logs all outgoing API calls
api.interceptors.request.use(
  (config) => {
    Log(
      "frontend",
      "debug",
      "api",
      `Request: ${config.method.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    Log("frontend", "error", "api", `Request setup error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor - logs all API responses
api.interceptors.response.use(
  (response) => {
    Log(
      "frontend",
      "debug",
      "api",
      `Response: ${response.status} from ${response.config.url}`
    );
    return response;
  },
  (error) => {
    Log(
      "frontend",
      "error",
      "api",
      `Response error: ${error.response?.status || "network"} - ${error.message}`
    );
    return Promise.reject(error);
  }
);

/** Fetch all notifications with pagination */
export const getNotifications = (page = 1, limit = 20) => {
  return api.get(`/?page=${page}&limit=${limit}`);
};

/** Fetch a single notification by ID */
export const getNotificationById = (id) => {
  return api.get(`/${id}`);
};

/** Get unread notification count */
export const getUnreadCount = () => {
  return api.get("/unread-count");
};

/** Mark a single notification as read */
export const markAsRead = (id) => {
  return api.patch(`/${id}/read`);
};

/** Mark all notifications as read */
export const markAllAsRead = () => {
  return api.patch("/read-all");
};

/** Delete a notification */
export const deleteNotification = (id) => {
  return api.delete(`/${id}`);
};

export default api;
