const admin = require("firebase-admin");
const { logger } = require("../logger");

/**
 * Set a custom role claim on a Firebase user
 * @param {string} uid - Firebase user UID
 * @param {string} role - 'admin' | 'instructor' | 'employee' | 'customer'
 */
const setUserRole = async (uid, role) => {
  await admin.auth().setCustomUserClaims(uid, { role });
  logger.info(`[RBAC] Role '${role}' set for user ${uid}`);
};

/**
 * Get the role of a Firebase user from custom claims
 * @param {string} uid - Firebase user UID
 * @returns {string|null} Role string or null
 */
const getUserRole = async (uid) => {
  const user = await admin.auth().getUser(uid);
  return user.customClaims?.role || null;
};

/**
 * Assign roles to a list of UIDs (batch)
 * @param {Array<{uid: string, role: string}>} assignments
 */
const batchSetRoles = async (assignments) => {
  await Promise.all(assignments.map(({ uid, role }) => setUserRole(uid, role)));
};

module.exports = { setUserRole, getUserRole, batchSetRoles };
