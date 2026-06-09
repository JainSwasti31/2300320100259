import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1/notifications";

// For demo purposes - in production, get token from login flow
const TOKEN = localStorage.getItem("token") || "demo_token";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

export const getNotifications = (page = 1, limit = 20) => {
  return api.get(`/?page=${page}&limit=${limit}`);
};

export const getNotificationById = (id) => {
  return api.get(`/${id}`);
};

export const getUnreadCount = () => {
  return api.get("/unread-count");
};

export const markAsRead = (id) => {
  return api.patch(`/${id}/read`);
};

export const markAllAsRead = () => {
  return api.patch("/read-all");
};

export const deleteNotification = (id) => {
  return api.delete(`/${id}`);
};

export default api;
