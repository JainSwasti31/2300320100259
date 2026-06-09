const axios = require("axios");

/**
 * Logging Middleware - Reusable Package
 *
 * A reusable logging function that makes an API call to the Test Server
 * each time it is called. This replaces all console.log and built-in loggers.
 *
 * Usage: Log(stack, level, package, message)
 *
 * @param {string} stack - "backend" or "frontend"
 * @param {string} level - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg - Package name (lowercase):
 *   Backend only: "cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"
 *   Frontend only: "api", "component", "hook", "page", "state", "style"
 *   Both: "auth", "config", "middleware", "utils"
 * @param {string} message - Descriptive message about what is happening
 */

// Configuration - loaded from environment variables
const LOG_API_URL =
  process.env.LOG_API_URL || "http://4.224.186.213/evaluation-service/logs";
const AUTH_URL =
  process.env.LOG_AUTH_URL || "http://4.224.186.213/evaluation-service/auth";

// Auth credentials from environment variables
const AUTH_BODY = {
  email: process.env.LOG_EMAIL || "",
  name: process.env.LOG_NAME || "",
  rollNo: process.env.LOG_ROLL_NO || "",
  accessCode: process.env.LOG_ACCESS_CODE || "",
  clientID: process.env.LOG_CLIENT_ID || "",
  clientSecret: process.env.LOG_CLIENT_SECRET || "",
};

// Token cache to minimize auth API calls
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Retrieves a valid authentication token from the Test Server.
 * Implements token caching with a 12-minute TTL for efficiency.
 * @returns {Promise<string|null>} The access token or null if auth fails
 */
async function getToken() {
  const now = Date.now();

  // Return cached token if still valid
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(AUTH_URL, AUTH_BODY);
    cachedToken = response.data.access_token;
    tokenExpiry = now + 12 * 60 * 1000;
    return cachedToken;
  } catch (err) {
    // Silent fail - cannot use Log here (circular dependency)
    return null;
  }
}

/**
 * Sends a structured log entry to the Test Server via POST request.
 *
 * @param {string} stack - Application layer: "backend" or "frontend"
 * @param {string} level - Severity: "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg - Module/package name (must be from the allowed list)
 * @param {string} message - Human-readable description of the event
 * @returns {Promise<void>}
 */
async function Log(stack, level, pkg, message) {
  const logPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const token = await getToken();
    if (!token) {
      return;
    }

    await axios.post(LOG_API_URL, logPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    // Silent fail to avoid infinite loops
  }
}

module.exports = Log;
