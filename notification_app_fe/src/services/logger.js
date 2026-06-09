/**
 * Frontend Logging Service
 *
 * Reusable Log function that sends logs to the Test Server via API.
 * This is the ONLY logging mechanism used in the frontend (no console.log).
 *
 * Usage: Log(stack, level, package, message)
 *
 * Stack: "frontend"
 * Level: "debug" | "info" | "warn" | "error" | "fatal"
 * Package (frontend): "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils"
 */

const LOG_API_URL =
  process.env.REACT_APP_LOG_API_URL ||
  "http://4.224.186.213/evaluation-service/logs";
const AUTH_URL =
  process.env.REACT_APP_LOG_AUTH_URL ||
  "http://4.224.186.213/evaluation-service/auth";

const AUTH_BODY = {
  email: process.env.REACT_APP_LOG_EMAIL || "",
  name: process.env.REACT_APP_LOG_NAME || "",
  rollNo: process.env.REACT_APP_LOG_ROLL_NO || "",
  accessCode: process.env.REACT_APP_LOG_ACCESS_CODE || "",
  clientID: process.env.REACT_APP_LOG_CLIENT_ID || "",
  clientSecret: process.env.REACT_APP_LOG_CLIENT_SECRET || "",
};

// Token cache to minimize auth calls
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Retrieves a valid auth token, caching for 12 minutes.
 * @returns {Promise<string|null>}
 */
async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(AUTH_BODY),
    });
    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = now + 12 * 60 * 1000;
    return cachedToken;
  } catch (err) {
    return null;
  }
}

/**
 * Sends a structured log to the Test Server.
 *
 * @param {string} stack - "frontend"
 * @param {string} level - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg - Package name from the allowed list
 * @param {string} message - Descriptive log message
 * @returns {Promise<void>}
 */
async function Log(stack, level, pkg, message) {
  const logPayload = { stack, level, package: pkg, message };

  try {
    const token = await getToken();
    if (!token) return;

    await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(logPayload),
    });
  } catch (err) {
    // Silent fail to prevent UI disruption
  }
}

export default Log;
