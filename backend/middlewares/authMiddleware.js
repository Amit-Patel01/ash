const admin = require("firebase-admin");
const { logger } = require("../logger");

/**
 * Verify Firebase ID Token from Authorization header
 * Attaches decoded token to req.user
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Missing or invalid Authorization header",
    });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, role (custom claim), ... }
    next();
  } catch (err) {
    logger.warn(`[Auth] Token verification failed: ${err.message}`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

/**
 * Optional auth — attaches user if token present, doesn't block if absent
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    req.user = await admin.auth().verifyIdToken(token);
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { verifyFirebaseToken, optionalAuth };
