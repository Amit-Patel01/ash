const { getDb } = require("../utils/mongo");
const { logger } = require("../logger");

/**
 * Set user role in MongoDB users collection
 * @param {string} uid - User ID
 * @param {string} role - 'admin' | 'employee' | 'customer'
 */
const setUserRole = async (uid, role) => {
  const db = getDb();
  await db.collection("users").updateOne(
    { $or: [{ _id: uid }, { uid: uid }] },
    { $set: { role } }
  );
  logger.info(`[RBAC] Role '${role}' set for user ${uid}`);
};

/**
 * Get user role from MongoDB users collection
 * @param {string} uid - User ID
 * @returns {string|null} Role string or null
 */
const getUserRole = async (uid) => {
  const db = getDb();
  const user = await db.collection("users").findOne({
    $or: [{ _id: uid }, { uid: uid }]
  });
  return user?.role || null;
};

/**
 * Assign roles to a list of UIDs (batch)
 * @param {Array<{uid: string, role: string}>} assignments
 */
const batchSetRoles = async (assignments) => {
  await Promise.all(assignments.map(({ uid, role }) => setUserRole(uid, role)));
};

module.exports = { setUserRole, getUserRole, batchSetRoles };
