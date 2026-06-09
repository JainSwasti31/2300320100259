const jwt = require("jsonwebtoken");
const Log = require("../../logging_middleware");

const PKG = "notification_app_be";

/**
 * Authentication Middleware
 * Verifies the JWT token from the Authorization header.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    Log(
      "AuthMiddleware",
      "warn",
      PKG,
      `Unauthorized request to ${req.method} ${req.originalUrl} - missing or malformed Authorization header`
    );
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token is missing or invalid.",
      },
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    Log(
      "AuthMiddleware",
      "debug",
      PKG,
      `Authenticated user=${decoded.userId} (${decoded.email}) for ${req.method} ${req.originalUrl}`
    );
    next();
  } catch (err) {
    Log(
      "AuthMiddleware",
      "warn",
      PKG,
      `Invalid token for ${req.method} ${req.originalUrl}: ${err.message}`
    );
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token is missing or invalid.",
      },
    });
  }
};

module.exports = authMiddleware;
