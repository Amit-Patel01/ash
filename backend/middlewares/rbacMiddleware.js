const { logger } = require("../logger");

/**
 * RBAC Middleware Factory (Permissive Mode)
 * 
 * Currently LOGS unauthorized attempts but does NOT block them.
 * To enable enforcement, remove the `// PERMISSIVE:` comment lines and uncomment the return.
 * 
 * @param  {...string} roles - Allowed roles e.g. requireRole('admin', 'instructor')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || req.user?.customClaims?.role;

    if (!userRole || !roles.includes(userRole)) {
      logger.warn(
        `[RBAC] Access attempt by role='${userRole || "none"}' to route requiring [${roles.join(", ")}] — USER: ${req.user?.email || "anonymous"}`
      );

      // PERMISSIVE MODE: Log and continue. Remove below and uncomment return to enforce.
      // return res.status(403).json({
      //   success: false,
      //   message: `Access denied. Required role: ${roles.join(' or ')}`,
      // });
    }

    next();
  };
};

/**
 * Admin-only guard (shorthand)
 */
const adminOnly = requireRole("admin");

/**
 * Admin or Instructor guard (shorthand)
 */
const instructorOrAdmin = requireRole("admin", "instructor");

module.exports = { requireRole, adminOnly, instructorOrAdmin };
