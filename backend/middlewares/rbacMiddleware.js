const { logger } = require("../logger");

/**
 * RBAC Middleware Factory
 *
 * @param  {...string} roles - Allowed roles e.g. requireRole('admin', 'instructor')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = roles.flat().filter(Boolean);
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn(
        `[RBAC] Access denied for role='${userRole || "none"}' on route requiring [${allowedRoles.join(", ")}] — USER: ${req.user?.email || "anonymous"}`
      );

      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

/**
 * Admin-only guard (shorthand)
 */
const adminOnly = requireRole("admin");

/**
 * Admin or employee/mentor guard (shorthand)
 */
const employeeOrAdmin = requireRole("admin", "employee", "mentor", "instructor");
const instructorOrAdmin = employeeOrAdmin;

module.exports = { requireRole, adminOnly, employeeOrAdmin, instructorOrAdmin };
