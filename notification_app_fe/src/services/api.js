import axios from "axios";
import Log from "./logger";

/**
 * API Service
 * Handles authentication and notification fetching from the evaluation service.
 */

const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
const NOTIFICATIONS_URL = "http://4.224.186.213/evaluation-service/notifications";

const AUTH_BODY = {
  email: process.env.REACT_APP_LOG_EMAIL || "",
  name: process.env.REACT_APP_LOG_NAME || "",
  rollNo: process.env.REACT_APP_LOG_ROLL_NO || "",
  accessCode: process.env.REACT_APP_LOG_ACCESS_CODE || "",
  clientID: process.env.REACT_APP_LOG_CLIENT_ID || "",
  clientSecret: process.env.REACT_APP_LOG_CLIENT_SECRET || "",
};

let cachedToken = null;
let tokenExpiry = 0;

/** Get auth token with caching */
async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  try {
    const res = await axios.post(AUTH_URL, AUTH_BODY);
    cachedToken = res.data.access_token;
    tokenExpiry = now + 12 * 60 * 1000;
    Log("frontend", "info", "auth", "Auth token refreshed");
    return cachedToken;
  } catch (err) {
    Log("frontend", "error", "auth", `Token fetch failed: ${err.message}`);
    return null;
  }
}

/** Fetch notifications with optional query params */
export async function fetchNotifications(params = {}) {
  const token = await getToken();
  if (!token) return [];

  try {
    const queryParts = [];
    if (params.type) queryParts.push(`notification_type=${params.type}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    if (params.page) queryParts.push(`page=${params.page}`);

    const queryStr = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const url = `${NOTIFICATIONS_URL}${queryStr}`;

    Log("frontend", "info", "api", `Fetching: ${url}`);
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    Log("frontend", "info", "api", `Received ${res.data.notifications.length} notifications`);
    return res.data.notifications || [];
  } catch (err) {
    Log("frontend", "error", "api", `Fetch failed: ${err.message}`);
    return [];
  }
}
