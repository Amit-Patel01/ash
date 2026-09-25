const jwt = require("jsonwebtoken");
const { getDb } = require("../utils/mongo");
const { logger } = require("../logger");

const ADMIN_EMAILS = [
  (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
  "support@Ashnexa Systems.com",
  "amitpatel07029@gmail.com"
].filter(Boolean);

const enrichDecodedUser = async (decoded) => {
  let profileData = null;

  if (decoded?.uid || decoded?.email) {
    try {
      const db = getDb();
      profileData = await db.collection("users").findOne({
        $or: [
          ...(decoded.uid ? [{ uid: decoded.uid }] : []),
          ...(decoded.email ? [{ email: decoded.email.trim().toLowerCase() }] : [])
        ]
      });
    } catch (error) {
      logger.warn(`[Auth] Failed to load profile for ${decoded.uid || decoded.email}: ${error.message}`);
    }
  }

  const userEmail = (decoded?.email || profileData?.email || "").trim().toLowerCase();
  const role = ADMIN_EMAILS.includes(userEmail)
    ? "admin"
    : (profileData?.role || decoded?.role || null);

  return {
    ...decoded,
    ...profileData,
    uid: decoded?.uid || profileData?.uid || profileData?._id?.toString(),
    email: decoded?.email || profileData?.email,
    role,
    employeeId: profileData?.employeeId || decoded?.employeeId || null,
    permissions: profileData?.permissions || decoded?.permissions || {},
  };
};

/**
 * Verify JWT Token from Authorization header (named verifyFirebaseToken for compatibility)
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await enrichDecodedUser(decoded);

    // Single-device active session enforcement
    if (decoded.sessionId && (!user?.currentSessionId || decoded.sessionId !== user.currentSessionId)) {
      logger.warn(`[Auth] Single-device session mismatch for ${decoded.email}. Logging out old session.`);
      return res.status(401).json({
        success: false,
        code: "SESSION_EXPIRED_SINGLE_DEVICE",
        message: "Your account was logged in from another device. For security, this session has been logged out."
      });
    }

    req.user = user;
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await enrichDecodedUser(decoded);
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { verifyFirebaseToken, optionalAuth };
