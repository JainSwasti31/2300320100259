const axios = require("axios");

/**
 * Logging Middleware - Reusable Package
 *
 * A reusable logging function that makes an API call to the Test Server
 * each time it is called. Captures the full lifecycle of application events.
 *
 * @param {string} stack - The stack trace or origin context (e.g., "NotificationController.create")
 * @param {string} level - The log level: "info", "warn", "error", "debug"
 * @param {string} package - The package/module name where the log originates (e.g., "notification_app_be")
 * @param {string} message - A descriptive message about what is happening at this point
 */

// Configure the Test Server URL (can be overridden via environment variable)
const TEST_SERVER_URL =
  process.env.LOG_SERVER_URL || "http://localhost:8000/logs";

async function Log(stack, level, pkg, message) {
  const logPayload = {
    stack,
    level,
    package: pkg,
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    await axios.post(TEST_SERVER_URL, logPayload);
  } catch (err) {
    // Fallback: print to console if the Test Server is unreachable
    console.error(
      `[LOG DELIVERY FAILED] ${logPayload.timestamp} | ${level.toUpperCase()} | [${pkg}] ${stack} - ${message}`
    );
    console.error(`  Reason: ${err.message}`);
  }

  // Always print to local console for immediate visibility
  console.log(
    `[${logPayload.timestamp}] ${level.toUpperCase()} | [${pkg}] ${stack} - ${message}`
  );
}

module.exports = Log;
