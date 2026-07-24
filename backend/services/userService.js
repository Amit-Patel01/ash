const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { admin } = require("./firebaseService");
const { getDb } = require("../utils/mongo");
const { ObjectId } = require("mongodb");
const { logger } = require("../logger");
const { sendEmail, emailTemplate } = require("./emailService");

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const DEFAULT_SITE_URL = (process.env.FRONTEND_URL || process.env.APP_URL || "https://www.amitsolutionhub.com").replace(/\/+$/, "");
/** Shown when email or phone already belongs to an account (registration or conflict). */
const ACCOUNT_ALREADY_EXISTS_MESSAGE = "Account already exists. Please reset your password.";
const NEW_CUSTOMER_EMAIL_INTRO = `
            <p style="color: #475569; font-size: 15px; line-height: 1.8;">
              Your account has been created. Please reset your password to access your account.
            </p>
          `;
const USER_COLUMN_SQL = `
  u.id,
  u.firebase_uid,
  u.email,
  u.phone,
  u.display_name,
  u.role,
  u.status,
  u.password_hash,
  u.department,
  u.job_title,
  u.employee_id,
  u.join_date,
  u.avatar,
  u.avatar_source,
  u.github,
  u.linkedin,
  u.portfolio,
  u.bio,
  u.experience,
  u.skills_json,
  u.show_on_team,
  u.is_mentor,
  u.location,
  u.cv_file_name,
  u.cv_file_path,
  u.cv_uploaded_at,
  u.created_at,
  u.updated_at
`;

const ACCOUNT_REQUEST_COLUMN_SQL = `
  ar.id,
  ar.request_uid,
  ar.name,
  ar.email,
  ar.phone,
  ar.department,
  ar.requested_role,
  ar.system_role,
  ar.reason,
  ar.status,
  ar.linked_user_id,
  ar.merge_count,
  ar.approved_by_uid,
  ar.approved_by_email,
  ar.approved_at,
  ar.rejected_by_uid,
  ar.rejected_by_email,
  ar.rejected_at,
  ar.cv_file_path,
  ar.created_at,
  ar.updated_at
`;

const RESET_TOKEN_JOIN_SQL = `
  SELECT
    prt.id AS token_id,
    prt.user_id,
    prt.purpose,
    prt.token_hash,
    prt.expires_at,
    prt.used_at,
    prt.request_ip,
    prt.created_at AS token_created_at,
    ${USER_COLUMN_SQL}
  FROM password_reset_tokens prt
  INNER JOIN users u ON u.id = prt.user_id
  WHERE prt.id = ?
  LIMIT 1
`;

const FIRESTORE_USER_COLLECTION = "users";
const FIRESTORE_ACCOUNT_REQUEST_COLLECTION = "accountRequests";
const FIRESTORE_TEAM_COLLECTION = "team";
const FIRESTORE_PASSWORD_RESET_COLLECTION = "passwordResetTokens";
const FIRESTORE_USER_MERGE_AUDIT_COLLECTION = "userMergeAudit";

const createHttpError = (status, message, code = null) => {
  const error = new Error(message);
  error.status = status;
  if (code) {
    error.code = code;
  }
  return error;
};

const useMysql = () => false;

const assertMySqlReady = () => {
  // MySQL is intentionally disabled.
};

const mapFirestoreUser = (doc, { includeSensitive = false } = {}) => {
  if (!doc) return null;

  const user = {
    id: doc._id ? doc._id.toString() : doc.id || "",
    numericId: null,
    uid: doc.uid || doc.firebaseUid || (doc._id ? doc._id.toString() : doc.id || ""),
    firebaseUid: doc.firebaseUid || doc.uid || (doc._id ? doc._id.toString() : doc.id || ""),
    email: normalizeEmail(doc.email || ""),
    phone: normalizePhone(doc.phone || ""),
    displayName: doc.displayName || doc.name || "",
    role: normalizeSystemRole(doc.role || "customer"),
    status: normalizeStatus(doc.status || "active"),
    department: doc.department || "",
    jobTitle: doc.jobTitle || "",
    employeeId: doc.employeeId || "",
    joinDate: doc.joinDate || "",
    avatar: doc.avatar || doc.photoURL || "",
    customImageUrl: doc.customImageUrl || "",
    avatarSource: doc.avatarSource || "",
    github: doc.github || "",
    linkedin: doc.linkedin || "",
    portfolio: doc.portfolio || "",
    bio: doc.bio || "",
    experience: doc.experience || "",
    skills: Array.isArray(doc.skills) ? doc.skills : parseSkills(doc.skills),
    showOnTeam: normalizeBoolean(doc.showOnTeam),
    isMentor: normalizeBoolean(doc.isMentor),
    location: doc.location || "",
    cvFileName: doc.cvFileName || "",
    cvFilePath: doc.cvFilePath || "",
    cvUploadedAt: doc.cvUploadedAt || null,
    isTerminated: Boolean(doc.isTerminated || doc.status === "terminated"),
    previousRole: doc.previousRole || "",
    fireReason: doc.fireReason || "",
    relievingDate: doc.relievingDate || "",
    reinstatementRequested: Boolean(doc.reinstatementRequested),
    reinstatementMessage: doc.reinstatementMessage || "",
    reinstatementRequestedAt: doc.reinstatementRequestedAt || null,
    permissions: (doc.permissions && typeof doc.permissions === 'object' && !Array.isArray(doc.permissions)) ? doc.permissions : {},
    createdAt: doc.createdAt ? toIsoString(doc.createdAt) : null,
    updatedAt: doc.updatedAt ? toIsoString(doc.updatedAt) : null,
  };

  if (includeSensitive) {
    user.passwordHash = doc.passwordHash || null;
  }

  return user;
};

const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();

const normalizePhone = (value = "") => {
  const digits = String(value || "").replace(/\D+/g, "");
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
  }
  return false;
};

const normalizeStatus = (value = "active") => {
  const lowered = String(value || "active").trim().toLowerCase();
  if (lowered === "terminated") return "terminated";
  if (lowered === "inactive") return "inactive";
  return "active";
};

const normalizeSystemRole = (value = "customer") => {
  const normalized = String(value || "customer").trim().toLowerCase();
  if (["admin", "employee", "customer", "student", "user"].includes(normalized)) {
    return normalized;
  }
  return "customer";
};

const toIsoString = (value) => {
  if (!value) return null;
  const normalized = value instanceof Date ? value : new Date(value);
  return Number.isNaN(normalized.getTime()) ? null : normalized.toISOString();
};

const toDateString = (value) => {
  if (!value) return null;
  const normalized = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(normalized.getTime())) return null;
  return normalized.toISOString().slice(0, 10);
};

const parseSkills = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const stringifySkills = (value) => JSON.stringify(parseSkills(value));

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone) => phone.length >= 10 && phone.length <= 15;

const validatePassword = (password) => {
  if (typeof password !== "string" || password.length < 8) {
    throw createHttpError(400, "Password must contain at least 8 characters.", "invalid_password");
  }
};

const mapUserRow = (row, { includeSensitive = false } = {}) => {
  if (!row) return null;

  const user = {
    id: String(row.id),
    numericId: Number(row.id),
    uid: row.firebase_uid || String(row.id),
    firebaseUid: row.firebase_uid || null,
    email: row.email,
    phone: row.phone || "",
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    department: row.department || "",
    jobTitle: row.job_title || "",
    employeeId: row.employee_id || "",
    joinDate: row.join_date ? toDateString(row.join_date) : "",
    avatar: row.avatar || "",
    avatarSource: row.avatar_source || "",
    github: row.github || "",
    linkedin: row.linkedin || "",
    portfolio: row.portfolio || "",
    bio: row.bio || "",
    experience: row.experience || "",
    skills: (() => {
      try {
        return row.skills_json ? JSON.parse(row.skills_json) : [];
      } catch {
        return [];
      }
    })(),
    showOnTeam: Boolean(row.show_on_team),
    isMentor: Boolean(row.is_mentor),
    location: row.location || "",
    cvFileName: row.cv_file_name || "",
    cvFilePath: row.cv_file_path || "",
    cvUploadedAt: toIsoString(row.cv_uploaded_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };

  if (includeSensitive) {
    user.passwordHash = row.password_hash || null;
  }

  return user;
};

const mapAccountRequestRow = (row) => ({
  id: String(row.id),
  numericId: Number(row.id),
  requestUid: row.request_uid,
  name: row.name,
  email: row.email,
  phone: row.phone || "",
  department: row.department || "",
  role: row.requested_role || "Employee",
  systemRole: row.system_role,
  reason: row.reason || "",
  status: row.status,
  linkedUserId: row.linked_user_id ? String(row.linked_user_id) : null,
  mergeCount: Number(row.merge_count || 0),
  approvedByUid: row.approved_by_uid || "",
  approvedByEmail: row.approved_by_email || "",
  approvedAt: toIsoString(row.approved_at),
  rejectedByUid: row.rejected_by_uid || "",
  rejectedByEmail: row.rejected_by_email || "",
  rejectedAt: toIsoString(row.rejected_at),
  cvFilePath: row.cv_file_path || "",
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
  alreadyExists: row.status === "approved" && Boolean(row.linked_user_id),
});

const sanitizeManagedUserInput = (input = {}, { requirePhone = false, roleFallback = "customer" } = {}) => {
  const displayName = String(input.displayName || input.name || "").trim();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const role = normalizeSystemRole(input.role || roleFallback);
  const status = normalizeStatus(input.status || "active");
  const department = String(input.department || "").trim();
  const jobTitle = String(input.jobTitle || input.requestedRole || "").trim();

  if (!displayName) {
    throw createHttpError(400, "Full name is required.", "display_name_required");
  }
  if (!email || !validateEmail(email)) {
    throw createHttpError(400, "A valid email address is required.", "invalid_email");
  }
  if (requirePhone && (!phone || !validatePhone(phone))) {
    throw createHttpError(400, "A valid phone number is required.", "invalid_phone");
  }
  if (phone && !validatePhone(phone)) {
    throw createHttpError(400, "A valid phone number is required.", "invalid_phone");
  }

  return {
    displayName,
    email,
    phone,
    role,
    status,
    department,
    jobTitle,
    employeeId: String(input.employeeId || "").trim(),
    joinDate: toDateString(input.joinDate),
    avatar: String(input.avatar || input.photoURL || "").trim(),
    customImageUrl: String(input.customImageUrl || "").trim(),
    avatarSource: String(input.avatarSource || "").trim(),
    github: String(input.github || "").trim(),
    linkedin: String(input.linkedin || "").trim(),
    portfolio: String(input.portfolio || "").trim(),
    bio: String(input.bio || "").trim(),
    experience: String(input.experience || "").trim(),
    skills: parseSkills(input.skills),
    showOnTeam: normalizeBoolean(input.showOnTeam),
    isMentor: normalizeBoolean(input.isMentor),
    location: String(input.location || "").trim(),
    permissions: input.permissions || {},
    isTerminated: Boolean(input.isTerminated || status === "terminated"),
    previousRole: String(input.previousRole || "").trim(),
    fireReason: String(input.fireReason || "").trim(),
    relievingDate: String(input.relievingDate || "").trim(),
    reinstatementRequested: Boolean(input.reinstatementRequested),
    reinstatementMessage: String(input.reinstatementMessage || "").trim(),
    reinstatementRequestedAt: input.reinstatementRequestedAt || null,
  };
};

const buildFirestoreUserPayload = (user) => ({
  uid: user.firebaseUid || user.uid,
  email: user.email,
  phone: user.phone || "",
  displayName: user.displayName,
  role: user.role,
  status: user.status,
  department: user.department || "",
  jobTitle: user.jobTitle || "",
  employeeId: user.employeeId || "",
  joinDate: user.joinDate || "",
  avatar: user.avatar || "",
  customImageUrl: user.customImageUrl || "",
  photoURL: user.avatar || "",
  avatarSource: user.avatarSource || "",
  github: user.github || "",
  linkedin: user.linkedin || "",
  portfolio: user.portfolio || "",
  bio: user.bio || "",
  experience: user.experience || "",
  skills: user.skills || [],
  showOnTeam: Boolean(user.showOnTeam),
  isMentor: Boolean(user.isMentor),
  location: user.location || "",
  permissions: user.permissions || {},
  isTerminated: Boolean(user.isTerminated || user.status === "terminated"),
  previousRole: user.previousRole || "",
  fireReason: user.fireReason || "",
  relievingDate: user.relievingDate || "",
  reinstatementRequested: Boolean(user.reinstatementRequested),
  reinstatementMessage: user.reinstatementMessage || "",
  reinstatementRequestedAt: user.reinstatementRequestedAt || null,
  cvFileName: user.cvFileName || "",
  cvFilePath: user.cvFilePath || "",
  cvUploadedAt: user.cvUploadedAt || null,
  createdAt: user.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const buildTeamPayload = (user) => ({
  name: user.displayName,
  role: user.jobTitle || "Employee",
  department: user.department || "",
  employeeId: user.employeeId || "",
  email: user.email,
  github: user.github || "",
  linkedin: user.linkedin || "",
  portfolio: user.portfolio || "",
  customImageUrl: user.customImageUrl || "",
  avatarSource: user.avatarSource || "",
  isMentor: Boolean(user.isMentor),
  bio: user.bio || "",
  skills: user.skills || [],
  status: user.status === "active" ? "Active" : "Inactive",
  joinDate: user.joinDate || "",
  createdAt: user.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const buildFirestoreAccountRequestPayload = (request) => ({
  name: request.name,
  email: request.email,
  phone: request.phone || "",
  department: request.department || "",
  role: request.role || "Employee",
  reason: request.reason || "",
  status: request.status,
  mergeCount: request.mergeCount || 0,
  linkedUserId: request.linkedUserId || "",
  alreadyExists: Boolean(request.alreadyExists),
  approvedAt: request.approvedAt || null,
  rejectedAt: request.rejectedAt || null,
  createdAt: request.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const buildResetUrl = (token, from = "") => {
  const url = new URL(`${DEFAULT_SITE_URL}/reset-password`);
  url.searchParams.set("token", token);
  if (from) {
    url.searchParams.set("from", from);
  }
  return url.toString();
};

const syncUserToFirebase = async (user) => {
  if (!user?.firebaseUid) {
    return;
  }

  const userPayload = buildFirestoreUserPayload(user);
  const userFilter = { _id: ObjectId.isValid(user.firebaseUid) ? new ObjectId(user.firebaseUid) : user.firebaseUid };

  await getDb().collection(FIRESTORE_USER_COLLECTION).updateOne(userFilter, { $set: userPayload }, { upsert: true });

  if (user.role === "employee" && user.showOnTeam) {
    await getDb().collection(FIRESTORE_TEAM_COLLECTION).updateOne(userFilter, { $set: buildTeamPayload(user) }, { upsert: true });
  } else {
    const teamDoc = await getDb().collection(FIRESTORE_TEAM_COLLECTION).findOne(userFilter);
    if (teamDoc) {
      await getDb().collection(FIRESTORE_TEAM_COLLECTION).deleteOne({ _id: teamDoc._id });
    }
  }

  await admin.auth().setCustomUserClaims(user.firebaseUid, { role: user.role });
  await admin.auth().updateUser(user.firebaseUid, {
    email: user.email,
    displayName: user.displayName,
    disabled: user.status !== "active",
  });
};

const removeUserFromFirebase = async (user) => {
  if (user?.firebaseUid) {
    const uid = user.firebaseUid;
    const filter = { _id: ObjectId.isValid(uid) ? new ObjectId(uid) : uid };
    const mongo = getDb();
    await Promise.all([
      mongo.collection(FIRESTORE_USER_COLLECTION).deleteOne(filter).catch(() => {}),
      mongo.collection("status").deleteOne(filter).catch(() => {}),
      mongo.collection(FIRESTORE_TEAM_COLLECTION).deleteOne(filter).catch(() => {}),
    ]);

    try {
      await admin.auth().deleteUser(user.firebaseUid);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }
  }
};

const syncAccountRequestToFirebase = async (request) => {
  const filter = { _id: ObjectId.isValid(request.requestUid) ? new ObjectId(request.requestUid) : request.requestUid };
  await getDb().collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).updateOne(filter, { $set: buildFirestoreAccountRequestPayload(request) }, { upsert: true });
};

const deleteAccountRequestFromFirebase = async (requestUid) => {
  if (!requestUid) return;
  const filter = { _id: ObjectId.isValid(requestUid) ? new ObjectId(requestUid) : requestUid };
  await getDb().collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).deleteOne(filter).catch(() => {});
};

const selectUserByWhere = async (whereSql, params = [], connection = null, { includeSensitive = false } = {}) => {
  const rows = await query(
    `SELECT ${USER_COLUMN_SQL} FROM users u WHERE ${whereSql} ORDER BY u.id DESC LIMIT 1`,
    params,
    connection
  );
  return rows.length ? mapUserRow(rows[0], { includeSensitive }) : null;
};

const selectFirestoreUserByWhere = async ({ email = "", phone = "", uid = "" } = {}, { includeSensitive = false } = {}) => {
  const users = getDb().collection(FIRESTORE_USER_COLLECTION);

  if (uid) {
    const filter = ObjectId.isValid(uid) ? { _id: new ObjectId(uid) } : { $or: [{ uid }, { firebaseUid: uid }] };
    const doc = await users.findOne(filter);
    return mapFirestoreUser(doc, { includeSensitive });
  }

  const normalizedEmail = email ? normalizeEmail(email) : "";
  const normalizedPhone = phone ? normalizePhone(phone) : "";

  if (normalizedEmail) {
    const doc = await users.findOne({ email: normalizedEmail });
    if (doc) return mapFirestoreUser(doc, { includeSensitive });
  }

  if (normalizedPhone) {
    const doc = await users.findOne({ phone: normalizedPhone });
    if (doc) return mapFirestoreUser(doc, { includeSensitive });
  }

  return null;
};

const listUsersFromFirestore = async (filters = {}) => {
  try {
    const filter = {};
    if (filters.role) filter.role = normalizeSystemRole(filters.role);
    if (filters.status) filter.status = normalizeStatus(filters.status);

    const docs = await getDb().collection(FIRESTORE_USER_COLLECTION).find(filter).limit(500).toArray();
    return docs.map((doc) => mapFirestoreUser(doc)).filter(Boolean);
  } catch (error) {
    console.error('[listUsersFromFirestore] Error:', error);
    return [];
  }
};

const listUsersFromSql = async (filters = {}, connection = null) => {
  // For public team listings, we should ALWAYS allow fetching without auth
  if (!useMysql()) {
    return listUsersFromFirestore(filters);
  }
  const clauses = [];
  const params = [];

  if (filters.role) {
    clauses.push("u.role = ?");
    params.push(normalizeSystemRole(filters.role));
  }
  if (filters.status) {
    clauses.push("u.status = ?");
    params.push(normalizeStatus(filters.status));
  }

  const rows = await query(
    `SELECT ${USER_COLUMN_SQL} FROM users u ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""} ORDER BY u.created_at DESC`,
    params,
    connection
  );

  return rows.map((row) => mapUserRow(row));
};

const sanitizePublicTeamMember = (user) => ({
  id: user.uid || user.firebaseUid || user.id,
  uid: user.uid || user.firebaseUid || "",
  employeeId: user.employeeId || "",
  displayName: user.displayName || "Team Member",
  name: user.displayName || "Team Member",
  email: user.email || "",
  department: user.department || "Core Team",
  jobTitle: user.jobTitle || "Team Member",
  role: user.jobTitle || "Team Member",
  status: "active",
  avatar: user.avatar || "",
  photoURL: user.avatar || "",
  customImageUrl: user.customImageUrl || "",
  avatarSource: user.avatarSource || "",
  github: user.github || "",
  linkedin: user.linkedin || "",
  portfolio: user.portfolio || "",
  cvFilePath: user.cvFilePath || "",
  bio: user.bio || "",
  experience: user.experience || "",
  skills: Array.isArray(user.skills) ? user.skills : [],
  showOnTeam: true,
  isMentor: Boolean(user.isMentor),
  joinDate: user.joinDate || "",
  updatedAt: user.updatedAt || null,
});

const sanitizeChatContact = (user) => ({
  id: user.uid || user.firebaseUid || user.id,
  uid: user.uid || user.firebaseUid || user.id,
  email: user.email || "",
  displayName: user.displayName || user.email || "User",
  name: user.displayName || user.email || "User",
  role: normalizeSystemRole(user.role || "customer"),
  status: normalizeStatus(user.status || "active"),
  department: user.department || "",
  jobTitle: user.jobTitle || "",
  employeeId: user.employeeId || "",
  avatar: user.avatar || "",
  photoURL: user.avatar || "",
  avatarSource: user.avatarSource || "",
  customImageUrl: user.customImageUrl || "",
});

const listChatContacts = async (requestingUser) => {
  const requesterRole = normalizeSystemRole(requestingUser?.role || "customer");
  const users = await listUsersFromSql({ status: "active" });
  const requesterUid = requestingUser?.uid || "";

  return users
    .filter((user) => user.uid !== requesterUid && user.status === "active")
    .filter((user) => {
      const contactRole = normalizeSystemRole(user.role || "customer");
      if (requesterRole === "customer") {
        return contactRole === "admin" || contactRole === "employee";
      }
      return true;
    })
    .map(sanitizeChatContact)
    .sort((left, right) => {
      const roleRank = { admin: 0, employee: 1, customer: 2 };
      const rankDiff = (roleRank[left.role] ?? 9) - (roleRank[right.role] ?? 9);
      if (rankDiff !== 0) return rankDiff;
      return left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base" });
    });
};

const listPublicTeamMembers = async () => {
  try {
    // Fetch from all sources: MongoDB users + Firestore legacy
    const users = await listUsersFromSql({ role: "employee", status: "active" });
    
    // Additionally fetch from MongoDB 'team' collection for public profiles
    const teamDocs = await getDb().collection(FIRESTORE_TEAM_COLLECTION).find({}).toArray();
    const mappedTeamDocs = teamDocs
      .map(doc => ({ id: doc._id.toString(), ...doc }))
      .filter(doc => doc.status === "Active" || doc.status === "active");
    
    // Merge and deduplicate
    const allProfiles = [...users, ...mappedTeamDocs.map(doc => ({
      uid: doc.id,
      firebaseUid: doc.id,
      id: doc.id,
      displayName: doc.name || doc.displayName || "Team Member",
      email: doc.email || "",
      department: doc.department || "Core Team",
      jobTitle: doc.role || "Team Member",
      employeeId: doc.employeeId || "",
      status: "active",
      avatar: doc.customImageUrl || "",
      customImageUrl: doc.customImageUrl || "",
      avatarSource: doc.avatarSource || "",
      github: doc.github || "",
      linkedin: doc.linkedin || "",
      portfolio: doc.portfolio || "",
      cvFilePath: doc.cvFilePath || "",
      bio: doc.bio || "",
      skills: Array.isArray(doc.skills) ? doc.skills : [],
      showOnTeam: true,
      isMentor: Boolean(doc.isMentor),
      joinDate: doc.joinDate || "",
    }))];
    
    // Deduplicate by uid/id
    const uniqueMap = new Map();
    for (const profile of allProfiles) {
      const key = profile.uid || profile.id || profile.email;
      if (!key) continue;
      if (!uniqueMap.has(key) || profile.showOnTeam) {
        uniqueMap.set(key, profile);
      }
    }
    
    return Array.from(uniqueMap.values())
      .filter((user) => user.showOnTeam && user.status === "active")
      .map(sanitizePublicTeamMember)
      .sort((left, right) => {
        const leftId = left.employeeId || "ZZZ";
        const rightId = right.employeeId || "ZZZ";
        return leftId.localeCompare(rightId, undefined, { numeric: true, sensitivity: "base" });
      });
  } catch (error) {
    console.error('[listPublicTeamMembers] Error:', error);
    return [];
  }
};

const findUserInMongo = async (identifier, { includeSensitive = false } = {}) => {
  const mongo = getDb();
  const users = mongo.collection("users");
  const normalized = String(identifier || "").trim();
  if (!normalized) return null;

  let doc = null;
  if (normalized.includes("@")) {
    doc = await users.findOne({ email: normalizeEmail(normalized) });
  } else {
    const phone = normalizePhone(normalized);
    if (phone) {
      doc = await users.findOne({ phone });
    }
    if (!doc) {
      doc = await users.findOne({ $or: [{ uid: normalized }, { firebaseUid: normalized }] });
    }
    if (!doc) {
      const { ObjectId } = require("mongodb");
      try { doc = await users.findOne({ _id: new ObjectId(normalized) }); } catch {}
    }
  }
  if (!doc) return null;

  const user = {
    id: doc._id.toString(),
    uid: doc.uid || doc.firebaseUid || doc._id.toString(),
    firebaseUid: doc.firebaseUid || doc.uid || null,
    email: normalizeEmail(doc.email || ""),
    phone: normalizePhone(doc.phone || ""),
    displayName: doc.displayName || doc.name || "",
    role: normalizeSystemRole(doc.role || "customer"),
    status: normalizeStatus(doc.status || "active"),
    department: doc.department || "",
    jobTitle: doc.jobTitle || "",
    employeeId: doc.employeeId || "",
    joinDate: doc.joinDate || "",
    avatar: doc.avatar || doc.photoURL || "",
    customImageUrl: doc.customImageUrl || "",
    avatarSource: doc.avatarSource || "",
    github: doc.github || "",
    linkedin: doc.linkedin || "",
    portfolio: doc.portfolio || "",
    bio: doc.bio || "",
    experience: doc.experience || "",
    skills: Array.isArray(doc.skills) ? doc.skills : parseSkills(doc.skills),
    showOnTeam: normalizeBoolean(doc.showOnTeam),
    isMentor: normalizeBoolean(doc.isMentor),
    location: doc.location || "",
    permissions: doc.permissions || {},
    cvFileName: doc.cvFileName || "",
    cvFilePath: doc.cvFilePath || "",
    cvUploadedAt: doc.cvUploadedAt || null,
    createdAt: toIsoString(doc.createdAt),
    updatedAt: toIsoString(doc.updatedAt),
  };
  if (includeSensitive) user.passwordHash = doc.passwordHash || null;
  return user;
};

const findUserByIdentifier = async (identifier, { includeSensitive = false, connection = null } = {}) => {
  if (!useMysql()) {
    // Try MongoDB first
    const mongoUser = await findUserInMongo(identifier, { includeSensitive });
    if (mongoUser) return mongoUser;

    // Fallback to Firestore for legacy users
    const normalized = String(identifier || "").trim();
    if (!normalized) return null;

    if (normalized.includes("@")) {
      return selectFirestoreUserByWhere({ email: normalized }, { includeSensitive });
    }

    const phone = normalizePhone(normalized);
    if (phone) {
      const byPhone = await selectFirestoreUserByWhere({ phone }, { includeSensitive });
      if (byPhone) return byPhone;
    }

    return selectFirestoreUserByWhere({ uid: normalized }, { includeSensitive });
  }

  assertMySqlReady();
  const normalized = String(identifier || "").trim();
  if (!normalized) return null;

  if (/^\d+$/.test(normalized)) {
    const user = await selectUserByWhere("u.id = ?", [Number(normalized)], connection, { includeSensitive });
    if (user) return user;
  }

  let user = await selectUserByWhere("u.firebase_uid = ?", [normalized], connection, { includeSensitive });
  if (user) return user;

  if (normalized.includes("@")) {
    user = await selectUserByWhere("u.email = ?", [normalizeEmail(normalized)], connection, { includeSensitive });
    if (user) return user;
  }

  const phone = normalizePhone(normalized);
  if (phone) {
    user = await selectUserByWhere("u.phone = ?", [phone], connection, { includeSensitive });
    if (user) return user;
  }

  return null;
};

const findUserConflict = async ({ email, phone, excludeUserId = null, excludeFirebaseUid = null } = {}) => {
  if (!useMysql()) {
    const normalizedEmail = email ? normalizeEmail(email) : "";
    const normalizedPhone = phone ? normalizePhone(phone) : "";

    const users = getDb().collection(FIRESTORE_USER_COLLECTION);
    const legacyDocs = [];

    if (normalizedEmail) {
      const docs = await users.find({ email: normalizedEmail }).limit(2).toArray();
      legacyDocs.push(...docs);
    }
    if (normalizedPhone) {
      const docs = await users.find({ phone: normalizedPhone }).limit(2).toArray();
      legacyDocs.push(...docs);
    }

    const legacyConflict = legacyDocs.find((d) => (d.firebaseUid || d.uid || d._id.toString()) !== excludeFirebaseUid);
    return legacyConflict ? mapFirestoreUser(legacyConflict) : null;
  }

  assertMySqlReady();

  const normalizedEmail = email ? normalizeEmail(email) : "";
  const normalizedPhone = phone ? normalizePhone(phone) : "";
  const clauses = [];
  const params = [];

  if (normalizedEmail) {
    clauses.push("u.email = ?");
    params.push(normalizedEmail);
  }
  if (normalizedPhone) {
    clauses.push("u.phone = ?");
    params.push(normalizedPhone);
  }

  if (clauses.length) {
    const rows = await query(
      `SELECT ${USER_COLUMN_SQL} FROM users u WHERE (${clauses.join(" OR ")}) ORDER BY u.id DESC`,
      params
    );
    const sqlConflict = rows
      .map((row) => mapUserRow(row))
      .find((user) => user.id !== String(excludeUserId || "") && user.firebaseUid !== excludeFirebaseUid);
    if (sqlConflict) {
      return sqlConflict;
    }
  }

  const usersCollection = getDb().collection(FIRESTORE_USER_COLLECTION);
  const legacyDocs = [];

  if (normalizedEmail) {
    const docs = await usersCollection.find({ email: normalizedEmail }).limit(2).toArray();
    legacyDocs.push(...docs);
  }
  if (normalizedPhone) {
    const docs = await usersCollection.find({ phone: normalizedPhone }).limit(2).toArray();
    legacyDocs.push(...docs);
  }

  const legacyConflict = legacyDocs.find((d) => (d.firebaseUid || d.uid || d._id.toString()) !== excludeFirebaseUid);
  if (legacyConflict) {
    return {
      id: null,
      numericId: null,
      uid: legacyConflict.firebaseUid || legacyConflict.uid || legacyConflict._id.toString(),
      firebaseUid: legacyConflict.firebaseUid || legacyConflict.uid || legacyConflict._id.toString(),
      email: normalizeEmail(legacyConflict.email || normalizedEmail),
      phone: normalizePhone(legacyConflict.phone || normalizedPhone),
      displayName: legacyConflict.displayName || legacyConflict.name || "Member",
      role: normalizeSystemRole(legacyConflict.role || "customer"),
      status: normalizeStatus(legacyConflict.status || "active"),
      department: legacyConflict.department || "",
      jobTitle: legacyConflict.jobTitle || legacyConflict.roleLabel || "",
      employeeId: legacyConflict.employeeId || "",
      joinDate: legacyConflict.joinDate || "",
      avatar: legacyConflict.avatar || legacyConflict.photoURL || "",
      customImageUrl: legacyConflict.customImageUrl || "",
      avatarSource: legacyConflict.avatarSource || "",
      github: legacyConflict.github || "",
      linkedin: legacyConflict.linkedin || "",
      portfolio: legacyConflict.portfolio || "",
      bio: legacyConflict.bio || "",
      experience: legacyConflict.experience || "",
      skills: parseSkills(legacyConflict.skills),
      showOnTeam: normalizeBoolean(legacyConflict.showOnTeam),
      isMentor: normalizeBoolean(legacyConflict.isMentor),
      location: legacyConflict.location || "",
      permissions: legacyConflict.permissions || {},
      cvFileName: legacyConflict.cvFileName || "",
      cvFilePath: legacyConflict.cvFilePath || "",
      cvUploadedAt: legacyConflict.cvUploadedAt || null,
      createdAt: legacyConflict.createdAt || new Date().toISOString(),
      updatedAt: legacyConflict.updatedAt || new Date().toISOString(),
      legacyOnly: true,
    };
  }

  return null;
};

const insertUserRow = async (connection, payload) => {
  const result = await query(
    `
      INSERT INTO users (
        firebase_uid, email, phone, display_name, role, status, password_hash,
        department, job_title, employee_id, join_date, avatar, avatar_source,
        github, linkedin, portfolio, bio, experience, skills_json,
        show_on_team, is_mentor, location, cv_file_name, cv_file_path, cv_uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.firebaseUid || null,
      payload.email,
      payload.phone || null,
      payload.displayName,
      payload.role,
      payload.status,
      payload.passwordHash || null,
      payload.department || null,
      payload.jobTitle || null,
      payload.employeeId || null,
      payload.joinDate || null,
      payload.avatar || null,
      payload.avatarSource || null,
      payload.github || null,
      payload.linkedin || null,
      payload.portfolio || null,
      payload.bio || null,
      payload.experience || null,
      stringifySkills(payload.skills),
      payload.showOnTeam ? 1 : 0,
      payload.isMentor ? 1 : 0,
      payload.location || null,
      payload.cvFileName || null,
      payload.cvFilePath || null,
      payload.cvUploadedAt ? new Date(payload.cvUploadedAt) : null,
    ],
    connection
  );
  return findUserByIdentifier(String(result.insertId), { connection, includeSensitive: true });
};

const updateUserRow = async (connection, userId, payload) => {
  await query(
    `
      UPDATE users
      SET
        firebase_uid = ?,
        email = ?,
        phone = ?,
        display_name = ?,
        role = ?,
        status = ?,
        password_hash = COALESCE(?, password_hash),
        department = ?,
        job_title = ?,
        employee_id = ?,
        join_date = ?,
        avatar = ?,
        avatar_source = ?,
        github = ?,
        linkedin = ?,
        portfolio = ?,
        bio = ?,
        experience = ?,
        skills_json = ?,
        show_on_team = ?,
        is_mentor = ?,
        location = ?,
        cv_file_name = ?,
        cv_file_path = ?,
        cv_uploaded_at = ?
      WHERE id = ?
    `,
    [
      payload.firebaseUid || null,
      payload.email,
      payload.phone || null,
      payload.displayName,
      payload.role,
      payload.status,
      payload.passwordHash || null,
      payload.department || null,
      payload.jobTitle || null,
      payload.employeeId || null,
      payload.joinDate || null,
      payload.avatar || null,
      payload.avatarSource || null,
      payload.github || null,
      payload.linkedin || null,
      payload.portfolio || null,
      payload.bio || null,
      payload.experience || null,
      stringifySkills(payload.skills),
      payload.showOnTeam ? 1 : 0,
      payload.isMentor ? 1 : 0,
      payload.location || null,
      payload.cvFileName || null,
      payload.cvFilePath || null,
      payload.cvUploadedAt ? new Date(payload.cvUploadedAt) : null,
      Number(userId),
    ],
    connection
  );
  return findUserByIdentifier(String(userId), { connection, includeSensitive: true });
};

const materializeLegacyUser = async (identifier) => {
  assertMySqlReady();
  const normalized = String(identifier || "").trim();
  if (!normalized) return null;

  const users = getDb().collection(FIRESTORE_USER_COLLECTION);
  let doc = await users.findOne(
    ObjectId.isValid(normalized) ? { _id: new ObjectId(normalized) } : { $or: [{ uid: normalized }, { firebaseUid: normalized }] }
  );

  if (!doc && normalized.includes("@")) {
    doc = await users.findOne({ email: normalizeEmail(normalized) });
  }

  if (!doc) {
    return null;
  }

  const payload = {
    firebaseUid: doc.firebaseUid || doc.uid || doc._id.toString(),
    displayName: doc.displayName || doc.name || "Member",
    email: normalizeEmail(doc.email),
    phone: normalizePhone(doc.phone),
    role: normalizeSystemRole(doc.role || "customer"),
    status: normalizeStatus(doc.status || "active"),
    department: doc.department || "",
    jobTitle: doc.jobTitle || "",
    employeeId: doc.employeeId || "",
    joinDate: toDateString(doc.joinDate || doc.createdAt),
    avatar: doc.avatar || doc.photoURL || "",
    customImageUrl: doc.customImageUrl || "",
    avatarSource: doc.avatarSource || "",
    github: doc.github || "",
    linkedin: doc.linkedin || "",
    portfolio: doc.portfolio || "",
    bio: doc.bio || "",
    experience: doc.experience || "",
    skills: parseSkills(doc.skills),
    showOnTeam: normalizeBoolean(doc.showOnTeam),
    isMentor: normalizeBoolean(doc.isMentor),
    location: doc.location || "",
    cvFileName: doc.cvFileName || "",
    cvFilePath: doc.cvFilePath || "",
    cvUploadedAt: doc.cvUploadedAt || null,
  };

  const existingConflict = await findUserConflict({
    email: payload.email,
    phone: payload.phone,
    excludeFirebaseUid: payload.firebaseUid,
  });

  if (existingConflict?.id) {
    return existingConflict;
  }

  return withTransaction(async (connection) => insertUserRow(connection, payload));
};

const getManagedUser = async (identifier, options = {}) => {
  let user = await findUserByIdentifier(identifier, options);
  if (user) return user;

  user = await materializeLegacyUser(identifier);
  return user || null;
};

const createResetTokenRecord = async (user, purpose, requestIp = "", connection = null) => {
  const secret = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(secret, 12);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  if (!useMysql()) {
    // Use MongoDB for token storage (migrated from Firestore)
    const mongo = getDb();
    const collection = mongo.collection(FIRESTORE_PASSWORD_RESET_COLLECTION);
    const doc = {
      userId: user.uid || user._id || user.id || null,
      userUid: user.firebaseUid || user.uid || null,
      email: normalizeEmail(user.email),
      purpose,
      tokenHash,
      expiresAt,
      usedAt: null,
      requestIp: requestIp || null,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(doc);
    return { token: `${result.insertedId.toString()}.${secret}`, expiresAt: expiresAt.toISOString() };
  }

  await query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND purpose = ? AND used_at IS NULL",
    [Number(user.numericId), purpose],
    connection
  );

  const result = await query(
    "INSERT INTO password_reset_tokens (user_id, purpose, token_hash, expires_at, request_ip) VALUES (?, ?, ?, ?, ?)",
    [Number(user.numericId), purpose, tokenHash, expiresAt, requestIp || null],
    connection
  );

  return { token: `${result.insertId}.${secret}`, expiresAt: expiresAt.toISOString() };
};

const buildResetEmailMarkup = ({ title, greetingName, bodyHtml, ctaLabel, resetLink, supportMessage }) =>
  emailTemplate(
    title,
    `
      <p>Hello <strong>${greetingName}</strong>,</p>
      ${bodyHtml}
      <div style="margin: 28px 0; padding: 18px; background: #eff6ff; border-radius: 14px; border: 1px solid #bfdbfe;">
        <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.7;">
          This secure link expires in 60 minutes. If you did not request this action, you can ignore this email.
        </p>
      </div>
      ${supportMessage ? `<p style="color: #475569; font-size: 14px; line-height: 1.7;">${supportMessage}</p>` : ""}
    `,
    ctaLabel,
    resetLink
  );

const sendResetEmail = async (user, { purpose = "reset_password", from = "", requestIp = "", intro = null } = {}) => {
  const tokenRecord = await createResetTokenRecord(user, purpose, requestIp);
  const resetLink = buildResetUrl(tokenRecord.token, from);
  
  console.log("\n------------------------------------------------------------");
  console.log(`[DEVELOPMENT] PASSWORD RESET LINK for ${user.email}:`);
  console.log(resetLink);
  console.log("------------------------------------------------------------\n");

  const title =
    purpose === "activate_account" ? "Complete Your SolutionHub Account Setup" : "Reset Your SolutionHub Password";
  const greetingName = user.displayName || "Member";
  const bodyHtml =
    intro ||
    `
      <p style="color: #475569; font-size: 15px; line-height: 1.8;">
        We received a request to update the password for your SolutionHub account linked to <strong>${user.email}</strong>.
      </p>
    `;

  const emailResult = await sendEmail({
    to: user.email,
    subject: title,
    html: buildResetEmailMarkup({
      title,
      greetingName,
      bodyHtml,
      ctaLabel: purpose === "activate_account" ? "Set Password" : "Reset Password",
      resetLink,
      supportMessage: "If you need help, please reply to this message and our team will assist you.",
    }),
  });

  if (!emailResult.success) {
    console.error("Failed to send reset email:", emailResult.error);
    throw createHttpError(500, "Unable to send the password reset email. Please try again later or contact support.");
  }

  return {
    resetLink,
    expiresAt: tokenRecord.expiresAt,
  };
};

const createFirebaseAuthUser = async (payload) => {
  // Firebase Auth requires a password at creation; it is never shared with the user.
  // Account access is established only through the token-based email reset flow.
  const randomSecret = crypto.randomBytes(24).toString("base64url");
  const passwordHash = await bcrypt.hash(randomSecret, 12);

  const firebaseUser = await admin.auth().createUser({
    email: payload.email,
    password: randomSecret,
    displayName: payload.displayName,
    disabled: payload.status !== "active",
  });

  await admin.auth().setCustomUserClaims(firebaseUser.uid, { role: payload.role });

  return {
    firebaseUid: firebaseUser.uid,
    passwordHash,
  };
};

const createManagedUser = async (input, { sendActivationEmail = true, activationFrom = "", requestIp = "", createdBy = null } = {}) => {
  const payload = sanitizeManagedUserInput(input, {
    requirePhone: true,
    roleFallback: input.role || "customer",
  });

  const conflict = await findUserConflict({ email: payload.email, phone: payload.phone });
  if (conflict) {
    const error = createHttpError(409, ACCOUNT_ALREADY_EXISTS_MESSAGE, "account_exists");
    error.existingUser = conflict;
    throw error;
  }

  let firebaseUser = null;
  let createdUser = null;

  try {
    const authProvision = await createFirebaseAuthUser(payload);
    firebaseUser = { uid: authProvision.firebaseUid };

    if (useMysql()) {
      createdUser = await withTransaction(async (connection) =>
        insertUserRow(connection, {
          ...payload,
          firebaseUid: authProvision.firebaseUid,
          passwordHash: authProvision.passwordHash,
        })
      );
    } else {
      const uid = authProvision.firebaseUid;
      const filter = { _id: ObjectId.isValid(uid) ? new ObjectId(uid) : uid };
      const userDoc = {
        uid,
        email: payload.email,
        phone: payload.phone || "",
        displayName: payload.displayName,
        role: payload.role,
        status: payload.status,
        department: payload.department || "",
        jobTitle: payload.jobTitle || "",
        employeeId: payload.employeeId || "",
        joinDate: payload.joinDate || "",
        avatar: payload.avatar || "",
        customImageUrl: payload.customImageUrl || "",
        photoURL: payload.avatar || "",
        avatarSource: payload.avatarSource || "",
        github: payload.github || "",
        linkedin: payload.linkedin || "",
        portfolio: payload.portfolio || "",
        bio: payload.bio || "",
        experience: payload.experience || "",
        skills: payload.skills || [],
        showOnTeam: Boolean(payload.showOnTeam),
        isMentor: Boolean(payload.isMentor),
        location: payload.location || "",
        cvFileName: payload.cvFileName || "",
        cvFilePath: payload.cvFilePath || "",
        cvUploadedAt: payload.cvUploadedAt || null,
        passwordHash: authProvision.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mongo = getDb();
      await mongo.collection(FIRESTORE_USER_COLLECTION).updateOne(filter, { $set: userDoc }, { upsert: true });
      const saved = await mongo.collection(FIRESTORE_USER_COLLECTION).findOne(filter);
      createdUser = mapFirestoreUser(saved, { includeSensitive: true });
    }

    await syncUserToFirebase(createdUser);

    if (sendActivationEmail) {
      const intro =
        payload.role === "customer"
          ? NEW_CUSTOMER_EMAIL_INTRO
          : `
            <p style="color: #475569; font-size: 15px; line-height: 1.8;">
              Your SolutionHub account has been created. Please reset your password to access your account.
            </p>
          `;

      await sendResetEmail(createdUser, {
        purpose: "activate_account",
        from: activationFrom,
        requestIp,
        intro,
      });
    }

    logger.info(
      `[UserManagement] Created ${createdUser.role} account for ${createdUser.email}${createdBy?.email ? ` by ${createdBy.email}` : ""}`
    );

    return createdUser;
  } catch (error) {
    if (firebaseUser?.uid) {
      await admin.auth().deleteUser(firebaseUser.uid).catch((cleanupError) => {
        logger.error(`[UserManagement] Failed to roll back Firebase user ${firebaseUser.uid}: ${cleanupError.message}`);
      });
    }
    throw error;
  }
};

const updateManagedUser = async (identifier, updates, { updatedBy = null } = {}) => {
  const existingUser = await getManagedUser(identifier, { includeSensitive: true });
  if (!existingUser) {
    throw createHttpError(404, "User not found.", "user_not_found");
  }

  const merged = sanitizeManagedUserInput(
    {
      ...existingUser,
      ...updates,
      email: updates.email ?? existingUser.email,
      phone: updates.phone ?? existingUser.phone,
      displayName: updates.displayName ?? updates.name ?? existingUser.displayName,
      role: updates.role ?? existingUser.role,
      status: updates.status ?? existingUser.status,
      employeeId: updates.employeeId ?? existingUser.employeeId,
      joinDate: updates.joinDate ?? existingUser.joinDate,
      avatar: updates.avatar ?? updates.photoURL ?? existingUser.avatar,
      customImageUrl: updates.customImageUrl ?? existingUser.customImageUrl,
      skills: updates.skills ?? existingUser.skills,
      showOnTeam: updates.showOnTeam ?? existingUser.showOnTeam,
      isMentor: updates.isMentor ?? existingUser.isMentor,
      location: updates.location ?? existingUser.location,
    },
    { requirePhone: false, roleFallback: existingUser.role }
  );

  const conflict = await findUserConflict({
    email: merged.email,
    phone: merged.phone,
    excludeUserId: existingUser.id,
    excludeFirebaseUid: existingUser.firebaseUid,
  });

  if (conflict) {
    const error = createHttpError(409, ACCOUNT_ALREADY_EXISTS_MESSAGE, "account_exists");
    error.existingUser = conflict;
    throw error;
  }

  let updatedUser = null;
  if (useMysql()) {
    updatedUser = await withTransaction(async (connection) =>
      updateUserRow(connection, existingUser.numericId, {
        ...existingUser,
        ...merged,
        firebaseUid: existingUser.firebaseUid,
        passwordHash: null,
        cvFileName: updates.cvFileName ?? existingUser.cvFileName,
        cvFilePath: updates.cvFilePath ?? existingUser.cvFilePath,
        cvUploadedAt: updates.cvUploadedAt ?? existingUser.cvUploadedAt,
      })
    );
  } else {
    const uid = existingUser.firebaseUid || existingUser.uid || identifier;
    // Update MongoDB (primary DB)
    try {
      const mongo = getDb();
      const mongoUpdate = {
        email: merged.email,
        phone: merged.phone || "",
        displayName: merged.displayName,
        role: merged.role,
        status: merged.status,
        department: merged.department || "",
        jobTitle: merged.jobTitle || "",
        employeeId: merged.employeeId || "",
        joinDate: merged.joinDate || "",
        avatar: merged.avatar || "",
        customImageUrl: merged.customImageUrl || "",
        avatarSource: merged.avatarSource || "",
        github: merged.github || "",
        linkedin: merged.linkedin || "",
        portfolio: merged.portfolio || "",
        bio: merged.bio || "",
        experience: merged.experience || "",
        skills: merged.skills || [],
        showOnTeam: Boolean(merged.showOnTeam),
        isMentor: Boolean(merged.isMentor),
        location: merged.location || "",
        permissions: merged.permissions || {},
        isTerminated: Boolean(merged.isTerminated || merged.status === "terminated"),
        previousRole: merged.previousRole || updates.previousRole || existingUser.previousRole || "",
        fireReason: merged.fireReason || updates.fireReason || existingUser.fireReason || "",
        relievingDate: merged.relievingDate || updates.relievingDate || existingUser.relievingDate || "",
        reinstatementRequested: Boolean(merged.reinstatementRequested ?? updates.reinstatementRequested ?? existingUser.reinstatementRequested),
        reinstatementMessage: merged.reinstatementMessage || updates.reinstatementMessage || existingUser.reinstatementMessage || "",
        reinstatementRequestedAt: merged.reinstatementRequestedAt || updates.reinstatementRequestedAt || existingUser.reinstatementRequestedAt || null,
        updatedAt: new Date().toISOString(),
      };
      if (existingUser.firebaseUid) mongoUpdate.firebaseUid = existingUser.firebaseUid;
      const filter = uid ? { $or: [{ uid }, { email: merged.email }] } : { email: merged.email };
      await mongo.collection("users").updateOne(filter, { $set: mongoUpdate }, { upsert: true });
      const mongoUser = await mongo.collection("users").findOne(filter);
      if (mongoUser) {
        updatedUser = {
          id: mongoUser._id.toString(),
          uid: mongoUser.uid || mongoUser.firebaseUid || mongoUser._id.toString(),
          firebaseUid: mongoUser.firebaseUid || null,
          ...mongoUpdate,
        };
      }
    } catch (mongoErr) {
      logger.warn(`[updateManagedUser] MongoDB update failed, trying alternative query: ${mongoErr.message}`);
      // Fallback: try direct _id or uid lookup
      const filter2 = ObjectId.isValid(uid) ? { _id: new ObjectId(uid) } : { $or: [{ uid }, { firebaseUid: uid }, { email: merged.email }] };
      await getDb().collection(FIRESTORE_USER_COLLECTION).updateOne(filter2,
        { $set: {
            email: merged.email,
            phone: merged.phone || "",
            displayName: merged.displayName,
            role: merged.role,
            status: merged.status,
            department: merged.department || "",
            jobTitle: merged.jobTitle || "",
            employeeId: merged.employeeId || "",
            joinDate: merged.joinDate || "",
            avatar: merged.avatar || "",
            customImageUrl: merged.customImageUrl || "",
            photoURL: merged.avatar || "",
            avatarSource: merged.avatarSource || "",
            github: merged.github || "",
            linkedin: merged.linkedin || "",
            portfolio: merged.portfolio || "",
            bio: merged.bio || "",
            experience: merged.experience || "",
            skills: merged.skills || [],
            showOnTeam: Boolean(merged.showOnTeam),
            isMentor: Boolean(merged.isMentor),
            location: merged.location || "",
            permissions: merged.permissions || {},
            cvFileName: updates.cvFileName ?? existingUser.cvFileName,
            cvFilePath: updates.cvFilePath ?? existingUser.cvFilePath,
            cvUploadedAt: updates.cvUploadedAt ?? existingUser.cvUploadedAt,
            updatedAt: new Date(),
          }
        },
        { upsert: true }
      );
      const saved = await getDb().collection(FIRESTORE_USER_COLLECTION).findOne(filter2);
      updatedUser = mapFirestoreUser(saved, { includeSensitive: true });
    }
  }

  try {
    await syncUserToFirebase(updatedUser);
  } catch (syncErr) {
    logger.warn(`[updateManagedUser] Firebase sync skipped: ${syncErr.message}`);
  }

  if (existingUser.role !== 'admin' && merged.role === 'admin' && updatedUser.email) {
    try {
      const subject = 'Admin Access Granted';
      const html = `
        <div style="font-family: Arial, sans-serif; color: #1f2937;">
          <p>Hi ${updatedUser.displayName || updatedUser.email},</p>
          <p>Your account has been upgraded with <strong>admin access</strong> at Amit Solution Hub.</p>
          <p>You can now sign in to the admin dashboard using your existing email credentials.</p>
          <p>If you need help signing in, please reply to this message or contact support.</p>
          <p style="margin-top: 24px;">Best regards,<br/>Amit Solution Hub Team</p>
        </div>
      `;
      const result = await sendEmail({
        to: updatedUser.email,
        subject,
        html,
      });
      if (!result.success) {
        logger.warn(`[UserManagement] Admin promotion email failed for ${updatedUser.email}: ${result.error}`);
      }
    } catch (emailError) {
      logger.warn(`[UserManagement] Failed to send admin promotion email to ${updatedUser.email}: ${emailError?.message || emailError}`);
    }
  }

  logger.info(`[UserManagement] Updated ${updatedUser.email}${updatedBy?.email ? ` by ${updatedBy.email}` : ""}`);
  return updatedUser;
};

const deleteManagedUser = async (identifier, { deletedBy = null } = {}) => {
  const user = await getManagedUser(identifier, { includeSensitive: true });
  if (!user) {
    throw createHttpError(404, "User not found.", "user_not_found");
  }

  if (useMysql()) {
    await withTransaction(async (connection) => {
      await query("DELETE FROM password_reset_tokens WHERE user_id = ?", [user.numericId], connection);
      await query("DELETE FROM account_requests WHERE linked_user_id = ?", [user.numericId], connection);
      await query("DELETE FROM users WHERE id = ?", [user.numericId], connection);
    });
  } else {
    const uid = user.firebaseUid || user.uid;
    if (uid) {
      const mongo = getDb();
      // best-effort cleanup
      await mongo.collection(FIRESTORE_PASSWORD_RESET_COLLECTION).deleteMany({ userUid: uid }).catch(() => {});
      await mongo.collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).updateMany({ linkedUserId: uid }, { $set: { linkedUserId: "" } }).catch(() => {});
      const filter = ObjectId.isValid(uid) ? { _id: new ObjectId(uid) } : { $or: [{ uid }, { firebaseUid: uid }] };
      await mongo.collection(FIRESTORE_USER_COLLECTION).deleteOne(filter).catch(() => {});
    }
  }

  await removeUserFromFirebase(user);

  logger.info(`[UserManagement] Deleted ${user.email}${deletedBy?.email ? ` by ${deletedBy.email}` : ""}`);
  return user;
};

const mergeManagedUsers = async ({ primaryIdentifier, duplicateIdentifier, mergeReason = "", mergedBy = null } = {}) => {
  const primaryUser = await getManagedUser(primaryIdentifier, { includeSensitive: true });
  const duplicateUser = await getManagedUser(duplicateIdentifier, { includeSensitive: true });

  if (!primaryUser || !duplicateUser) {
    throw createHttpError(404, "Both accounts must exist before they can be merged.", "merge_target_missing");
  }
  if (primaryUser.id === duplicateUser.id) {
    throw createHttpError(400, "Choose two different accounts to merge.", "merge_same_account");
  }

  if (!useMysql()) {
    const primaryUid = primaryUser.firebaseUid || primaryUser.uid;
    const duplicateUid = duplicateUser.firebaseUid || duplicateUser.uid;
    const mongo = getDb();
    const usersCol = mongo.collection(FIRESTORE_USER_COLLECTION);

    const mergedPayload = {
      ...primaryUser,
      phone: primaryUser.phone || duplicateUser.phone,
      department: primaryUser.department || duplicateUser.department,
      jobTitle: primaryUser.jobTitle || duplicateUser.jobTitle,
      employeeId: primaryUser.employeeId || duplicateUser.employeeId,
      joinDate: primaryUser.joinDate || duplicateUser.joinDate,
      avatar: primaryUser.avatar || duplicateUser.avatar,
      customImageUrl: primaryUser.customImageUrl || duplicateUser.customImageUrl,
      avatarSource: primaryUser.avatarSource || duplicateUser.avatarSource,
      github: primaryUser.github || duplicateUser.github,
      linkedin: primaryUser.linkedin || duplicateUser.linkedin,
      portfolio: primaryUser.portfolio || duplicateUser.portfolio,
      bio: primaryUser.bio || duplicateUser.bio,
      experience: primaryUser.experience || duplicateUser.experience,
      skills: primaryUser.skills?.length ? primaryUser.skills : duplicateUser.skills,
      showOnTeam: primaryUser.showOnTeam || duplicateUser.showOnTeam,
      isMentor: primaryUser.isMentor || duplicateUser.isMentor,
      location: primaryUser.location || duplicateUser.location,
      cvFileName: primaryUser.cvFileName || duplicateUser.cvFileName,
      cvFilePath: primaryUser.cvFilePath || duplicateUser.cvFilePath,
      cvUploadedAt: primaryUser.cvUploadedAt || duplicateUser.cvUploadedAt,
    };

    const primaryFilter = ObjectId.isValid(primaryUid) ? { _id: new ObjectId(primaryUid) } : { $or: [{ uid: primaryUid }, { firebaseUid: primaryUid }] };
    await usersCol.updateOne(primaryFilter,
      {
        $set: {
          ...buildFirestoreUserPayload(mergedPayload),
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );

    await mongo.collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).updateMany(
      { linkedUserId: duplicateUid },
      { $set: { linkedUserId: primaryUid } }
    ).catch(() => {});

    await mongo.collection(FIRESTORE_USER_MERGE_AUDIT_COLLECTION).insertOne({
      survivingUserId: primaryUid,
      mergedUserId: duplicateUid,
      mergedByUid: mergedBy?.uid || null,
      mergedByEmail: mergedBy?.email || null,
      mergeReason: mergeReason || null,
      createdAt: new Date(),
    });

    const duplicateFilter = ObjectId.isValid(duplicateUid) ? { _id: new ObjectId(duplicateUid) } : { $or: [{ uid: duplicateUid }, { firebaseUid: duplicateUid }] };
    await usersCol.deleteOne(duplicateFilter).catch(() => {});
    await removeUserFromFirebase(duplicateUser);

    const refreshed = await usersCol.findOne(primaryFilter);
    const refreshedUser = mapFirestoreUser(refreshed);
    await syncUserToFirebase(refreshedUser);

    logger.info(
      `[UserManagement] Merged ${duplicateUser.email} into ${refreshedUser.email}${mergedBy?.email ? ` by ${mergedBy.email}` : ""}`
    );

    return { primaryUser: refreshedUser, mergedUser: duplicateUser };
  }

  assertMySqlReady();
  const mergedPayload = {
    ...primaryUser,
    phone: primaryUser.phone || duplicateUser.phone,
    department: primaryUser.department || duplicateUser.department,
    jobTitle: primaryUser.jobTitle || duplicateUser.jobTitle,
    employeeId: primaryUser.employeeId || duplicateUser.employeeId,
    joinDate: primaryUser.joinDate || duplicateUser.joinDate,
    avatar: primaryUser.avatar || duplicateUser.avatar,
    customImageUrl: primaryUser.customImageUrl || duplicateUser.customImageUrl,
    avatarSource: primaryUser.avatarSource || duplicateUser.avatarSource,
    github: primaryUser.github || duplicateUser.github,
    linkedin: primaryUser.linkedin || duplicateUser.linkedin,
    portfolio: primaryUser.portfolio || duplicateUser.portfolio,
    bio: primaryUser.bio || duplicateUser.bio,
    experience: primaryUser.experience || duplicateUser.experience,
    skills: primaryUser.skills?.length ? primaryUser.skills : duplicateUser.skills,
    showOnTeam: primaryUser.showOnTeam || duplicateUser.showOnTeam,
    isMentor: primaryUser.isMentor || duplicateUser.isMentor,
    location: primaryUser.location || duplicateUser.location,
    cvFileName: primaryUser.cvFileName || duplicateUser.cvFileName,
    cvFilePath: primaryUser.cvFilePath || duplicateUser.cvFilePath,
    cvUploadedAt: primaryUser.cvUploadedAt || duplicateUser.cvUploadedAt,
  };

  const mergedPrimary = await withTransaction(async (connection) => {
    const updatedPrimary = await updateUserRow(connection, primaryUser.numericId, {
      ...primaryUser,
      ...mergedPayload,
      passwordHash: null,
    });

    await query(
      "UPDATE account_requests SET linked_user_id = ? WHERE linked_user_id = ?",
      [updatedPrimary.numericId, duplicateUser.numericId],
      connection
    );
    await query("DELETE FROM password_reset_tokens WHERE user_id = ?", [duplicateUser.numericId], connection);
    await query(
      `
        INSERT INTO user_merge_audit (surviving_user_id, merged_user_id, merged_by_uid, merged_by_email, merge_reason)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        updatedPrimary.numericId,
        duplicateUser.numericId,
        mergedBy?.uid || null,
        mergedBy?.email || null,
        mergeReason || null,
      ],
      connection
    );
    await query("DELETE FROM users WHERE id = ?", [duplicateUser.numericId], connection);
    return updatedPrimary;
  });

  await syncUserToFirebase(mergedPrimary);
  await removeUserFromFirebase(duplicateUser);

  logger.info(
    `[UserManagement] Merged ${duplicateUser.email} into ${mergedPrimary.email}${mergedBy?.email ? ` by ${mergedBy.email}` : ""}`
  );

  return {
    primaryUser: mergedPrimary,
    mergedUser: duplicateUser,
  };
};

const createAccountRequest = async (input, { requestIp = "" } = {}) => {
  if (!useMysql()) {
    const name = String(input.name || input.displayName || "").trim();
    const email = normalizeEmail(input.email);
    const phone = normalizePhone(input.phone);
    const department = String(input.department || "").trim();
    const requestedRole = String(input.role || input.requestedRole || "Employee").trim();
    const reason = String(input.reason || "").trim();
    const cvFilePath = String(input.cvFilePath || "").trim();

    if (!name) throw createHttpError(400, "Full name is required.", "display_name_required");
    if (!email || !validateEmail(email)) throw createHttpError(400, "A valid email address is required.", "invalid_email");
    if (!phone || !validatePhone(phone)) throw createHttpError(400, "A valid phone number is required.", "invalid_phone");
    if (!department) throw createHttpError(400, "Department is required.", "department_required");
    if (!cvFilePath) throw createHttpError(400, "Google Drive Resume link is required.", "cv_required");

    const reqCol = getDb().collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION);

    const existingAccount = await findUserConflict({ email, phone });
    if (existingAccount) {
      const requestUid = crypto.randomUUID();
      const payload = {
        requestUid,
        name,
        email,
        phone,
        department,
        role: requestedRole || "Employee",
        reason: reason || "",
        cvFilePath,
        status: "approved",
        mergeCount: 1,
        linkedUserId: existingAccount.uid,
        alreadyExists: true,
        approvedAt: new Date().toISOString(),
        rejectedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const filter = { _id: ObjectId.isValid(requestUid) ? new ObjectId(requestUid) : requestUid };
      await reqCol.updateOne(filter, { $set: payload }, { upsert: true });

      await sendResetEmail(existingAccount, {
        purpose: "reset_password",
        from: "employee",
        requestIp,
        intro: `
          <p style="color: #475569; font-size: 15px; line-height: 1.8;">
            An employee account request was submitted for your email address. Your account already exists, so we prepared a secure password reset link for you.
          </p>
        `,
      }).catch((error) => {
        logger.error(`[UserManagement] Failed to send duplicate-account reset email to ${existingAccount.email}: ${error.message}`);
      });

      return {
        request: payload,
        alreadyExists: true,
        merged: false,
        message: ACCOUNT_ALREADY_EXISTS_MESSAGE,
      };
    }

    // Merge into existing pending request (by email OR phone)
    const pendingByEmail = await reqCol.find({ email, status: "pending" }).limit(1).toArray();
    const pendingByPhone = await reqCol.find({ phone, status: "pending" }).limit(1).toArray();

    const existingPending = pendingByEmail[0] || pendingByPhone[0] || null;
    if (existingPending) {
      const next = {
        ...existingPending,
        name,
        department,
        role: requestedRole || existingPending.role || "Employee",
        reason: reason || existingPending.reason || "",
        cvFilePath: cvFilePath || existingPending.cvFilePath || "",
        mergeCount: Number(existingPending.mergeCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      delete next._id;
      await reqCol.updateOne({ _id: existingPending._id }, { $set: next });
      return {
        request: next,
        merged: true,
        message: "Your request is already pending review. We updated it with your latest information.",
      };
    }

    const requestUid = crypto.randomUUID();
    const payload = {
      requestUid,
      name,
      email,
      phone,
      department,
      role: requestedRole || "Employee",
      reason: reason || "",
      cvFilePath,
      status: "pending",
      mergeCount: 0,
      linkedUserId: "",
      alreadyExists: false,
      approvedAt: null,
      rejectedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const filter2 = { _id: ObjectId.isValid(requestUid) ? new ObjectId(requestUid) : requestUid };
    await reqCol.updateOne(filter2, { $set: payload }, { upsert: true });

    return { request: payload, merged: false, message: "Your request has been submitted successfully." };
  }

  assertMySqlReady();

  const name = String(input.name || input.displayName || "").trim();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const department = String(input.department || "").trim();
  const requestedRole = String(input.role || input.requestedRole || "Employee").trim();
  const reason = String(input.reason || "").trim();
  const cvFilePath = String(input.cvFilePath || "").trim();

  if (!name) {
    throw createHttpError(400, "Full name is required.", "display_name_required");
  }
  if (!email || !validateEmail(email)) {
    throw createHttpError(400, "A valid email address is required.", "invalid_email");
  }
  if (!phone || !validatePhone(phone)) {
    throw createHttpError(400, "A valid phone number is required.", "invalid_phone");
  }
  if (!department) {
    throw createHttpError(400, "Department is required.", "department_required");
  }
  if (!cvFilePath) {
    throw createHttpError(400, "Google Drive Resume link is required.", "cv_required");
  }

  const conflict = await findUserConflict({ email, phone });
  if (conflict) {
    const linkedRequest = await withTransaction(async (connection) => {
      const existingRows = await query(
        `SELECT ${ACCOUNT_REQUEST_COLUMN_SQL} FROM account_requests ar WHERE ar.email = ? OR ar.phone = ? ORDER BY ar.id DESC LIMIT 1`,
        [email, phone],
        connection
      );

      if (existingRows.length) {
        await query(
          `
            UPDATE account_requests
            SET
              name = ?,
              department = ?,
              requested_role = ?,
              reason = ?,
              cv_file_path = ?,
              status = 'approved',
              linked_user_id = ?,
              merge_count = merge_count + 1,
              approved_at = NOW(),
              updated_at = NOW()
            WHERE id = ?
          `,
          [name, department, requestedRole, reason || null, cvFilePath, conflict.id ? Number(conflict.id) : null, existingRows[0].id],
          connection
        );
        const updatedRows = await query(
          `SELECT ${ACCOUNT_REQUEST_COLUMN_SQL} FROM account_requests ar WHERE ar.id = ? LIMIT 1`,
          [existingRows[0].id],
          connection
        );
        return mapAccountRequestRow(updatedRows[0]);
      }

      const requestUid = crypto.randomUUID();
      const inserted = await query(
        `
          INSERT INTO account_requests (
            request_uid, name, email, phone, department, requested_role, system_role, reason,
            cv_file_path, status, linked_user_id, merge_count, approved_at
          )
          VALUES (?, ?, ?, ?, ?, ?, 'employee', ?, ?, 'approved', ?, 1, NOW())
        `,
        [requestUid, name, email, phone, department, requestedRole, reason || null, cvFilePath, conflict.id ? Number(conflict.id) : null],
        connection
      );
      const rows = await query(
        `SELECT ${ACCOUNT_REQUEST_COLUMN_SQL} FROM account_requests ar WHERE ar.id = ? LIMIT 1`,
        [inserted.insertId],
        connection
      );
      return mapAccountRequestRow(rows[0]);
    });

    await syncAccountRequestToFirebase(linkedRequest);
    if (conflict.id) {
      await sendResetEmail(conflict, {
        purpose: "reset_password",
        from: "employee",
        requestIp,
        intro: `
          <p style="color: #475569; font-size: 15px; line-height: 1.8;">
            An employee account request was submitted for your email address. Your account already exists, so we prepared a secure password reset link for you.
          </p>
        `,
      }).catch((error) => {
        logger.error(`[UserManagement] Failed to send duplicate-account reset email to ${conflict.email}: ${error.message}`);
      });
    }

    return {
      request: linkedRequest,
      alreadyExists: true,
      message: ACCOUNT_ALREADY_EXISTS_MESSAGE,
    };
  }

  const pendingRows = await query(
    `SELECT ${ACCOUNT_REQUEST_COLUMN_SQL} FROM account_requests ar WHERE (ar.email = ? OR ar.phone = ?) AND ar.status = 'pending' ORDER BY ar.id DESC LIMIT 1`,
    [email, phone]
  );

  if (pendingRows.length) {
    await query(
      `
        UPDATE account_requests
        SET
          name = ?,
          department = ?,
          requested_role = ?,
          reason = ?,
          cv_file_path = ?,
          merge_count = merge_count + 1,
          updated_at = NOW()
        WHERE id = ?
      `,
      [name, department, requestedRole, reason || null, cvFilePath, pendingRows[0].id]
    );
    const mergedRows = await query(
      `SELECT ${ACCOUNT_REQUEST_COLUMN_SQL} FROM account_requests ar WHERE ar.id = ? LIMIT 1`,
      [pendingRows[0].id]
    );
    const mergedRequest = mapAccountRequestRow(mergedRows[0]);
    await syncAccountRequestToFirebase(mergedRequest);
    return {
      request: mergedRequest,
      merged: true,
      message: "Your request is already pending review. We updated it with your latest information.",
    };
  }

  const requestUid = crypto.randomUUID();
  const inserted = await query(
    `
      INSERT INTO account_requests (
        request_uid, name, email, phone, department, requested_role, system_role, reason, cv_file_path, status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'employee', ?, ?, 'pending')
    `,
    [requestUid, name, email, phone, department, requestedRole, reason || null, cvFilePath]
  );
  const rows = await query(
    `SELECT ${ACCOUNT_REQUEST_COLUMN_SQL} FROM account_requests ar WHERE ar.id = ? LIMIT 1`,
    [inserted.insertId]
  );
  const request = mapAccountRequestRow(rows[0]);
  await syncAccountRequestToFirebase(request);

  return {
    request,
    merged: false,
    message: "Your request has been submitted successfully.",
  };
};

const getAccountRequest = async (identifier) => {
  assertMySqlReady();
  const normalized = String(identifier || "").trim();
  if (!normalized) return null;

  const rows = await query(
    `SELECT ${ACCOUNT_REQUEST_COLUMN_SQL} FROM account_requests ar WHERE ${/^\d+$/.test(normalized) ? "ar.id = ?" : "ar.request_uid = ?"} LIMIT 1`,
    [/^\d+$/.test(normalized) ? Number(normalized) : normalized]
  );
  return rows.length ? mapAccountRequestRow(rows[0]) : null;
};

const approveAccountRequest = async (identifier, actor = null) => {
  if (!useMysql()) {
    const requestId = String(identifier || "").trim();
    const reqCol = getDb().collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION);
    const filter = ObjectId.isValid(requestId) ? { _id: new ObjectId(requestId) } : { requestUid: requestId };
    const doc = await reqCol.findOne(filter);
    if (!doc) throw createHttpError(404, "Account request not found.", "request_not_found");

    const request = { id: doc._id.toString(), ...doc };
    if (request.status === "approved" && request.linkedUserId) {
      return { success: true, alreadyExists: true, request };
    }

    const existingAccount = await findUserConflict({ email: request.email, phone: request.phone });
    if (existingAccount) {
      const updated = {
        ...request,
        status: "approved",
        linkedUserId: existingAccount.uid,
        approvedAt: new Date().toISOString(),
        approvedByUid: actor?.uid || "",
        approvedByEmail: actor?.email || "",
        updatedAt: new Date().toISOString(),
      };
      delete updated._id;
      delete updated.id;
      await reqCol.updateOne({ _id: doc._id }, { $set: updated });
      await sendResetEmail(existingAccount, { purpose: "reset_password", from: "employee" }).catch(() => {});
      return { success: true, alreadyExists: true, request: updated, user: existingAccount };
    }

    const createdUser = await createManagedUser(
      {
        displayName: request.name,
        email: request.email,
        phone: request.phone,
        department: request.department,
        jobTitle: request.role,
        role: "employee",
        status: "active",
        showOnTeam: false,
        cvFilePath: request.cvFilePath || "",
      },
      {
        sendActivationEmail: true,
        activationFrom: "employee",
        createdBy: actor,
      }
    );

    const updated = {
      ...request,
      status: "approved",
      linkedUserId: createdUser.uid,
      approvedAt: new Date().toISOString(),
      approvedByUid: actor?.uid || "",
      approvedByEmail: actor?.email || "",
      updatedAt: new Date().toISOString(),
    };
    delete updated._id;
    delete updated.id;
    await reqCol.updateOne({ _id: doc._id }, { $set: updated });

    return { success: true, alreadyExists: false, request: updated, user: createdUser };
  }

  assertMySqlReady();
  const request = await getAccountRequest(identifier);
  if (!request) {
    throw createHttpError(404, "Account request not found.", "request_not_found");
  }
  if (request.status === "approved" && request.linkedUserId) {
    return {
      success: true,
      alreadyExists: true,
      request,
    };
  }

  const existingAccount = await findUserConflict({ email: request.email, phone: request.phone });
  if (existingAccount) {
    await query(
      `
        UPDATE account_requests
        SET
          status = 'approved',
          linked_user_id = ?,
          approved_at = NOW(),
          approved_by_uid = ?,
          approved_by_email = ?,
          updated_at = NOW()
        WHERE id = ?
      `,
      [existingAccount.id ? Number(existingAccount.id) : null, actor?.uid || null, actor?.email || null, Number(request.id)]
    );

    const updatedRequest = await getAccountRequest(request.id);
    await syncAccountRequestToFirebase(updatedRequest);

    if (existingAccount.id) {
      await sendResetEmail(existingAccount, {
        purpose: "reset_password",
        from: "employee",
        intro: `
          <p style="color: #475569; font-size: 15px; line-height: 1.8;">
            Your account request has been matched with an existing SolutionHub account. Please reset your password to access your workspace.
          </p>
        `,
      }).catch((error) => {
        logger.error(`[UserManagement] Failed to send existing-account reset email to ${existingAccount.email}: ${error.message}`);
      });
    }

    return {
      success: true,
      alreadyExists: true,
      request: updatedRequest,
      user: existingAccount,
    };
  }

  const createdUser = await createManagedUser(
    {
      displayName: request.name,
      email: request.email,
      phone: request.phone,
      department: request.department,
      jobTitle: request.role,
      role: "employee",
      status: "active",
      showOnTeam: false,
      cvFilePath: request.cvFilePath || "",
    },
    {
      sendActivationEmail: true,
      activationFrom: "employee",
      createdBy: actor,
    }
  );

  await query(
    `
      UPDATE account_requests
      SET
        status = 'approved',
        linked_user_id = ?,
        approved_at = NOW(),
        approved_by_uid = ?,
        approved_by_email = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [Number(createdUser.id), actor?.uid || null, actor?.email || null, Number(request.id)]
  );

  const updatedRequest = await getAccountRequest(request.id);
  await syncAccountRequestToFirebase(updatedRequest);

  return {
    success: true,
    alreadyExists: false,
    request: updatedRequest,
    user: createdUser,
  };
};

const rejectAccountRequest = async (identifier, actor = null) => {
  if (!useMysql()) {
    const requestId = String(identifier || "").trim();
    const reqCol = getDb().collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION);
    const filter = ObjectId.isValid(requestId) ? { _id: new ObjectId(requestId) } : { requestUid: requestId };
    const doc = await reqCol.findOne(filter);
    if (!doc) throw createHttpError(404, "Account request not found.", "request_not_found");
    const request = { id: doc._id.toString(), ...doc };

    const updated = {
      ...request,
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectedByUid: actor?.uid || "",
      rejectedByEmail: actor?.email || "",
      updatedAt: new Date().toISOString(),
    };
    delete updated._id;
    delete updated.id;
    await reqCol.updateOne({ _id: doc._id }, { $set: updated });
    return updated;
  }

  assertMySqlReady();
  const request = await getAccountRequest(identifier);
  if (!request) {
    throw createHttpError(404, "Account request not found.", "request_not_found");
  }

  await query(
    `
      UPDATE account_requests
      SET
        status = 'rejected',
        rejected_at = NOW(),
        rejected_by_uid = ?,
        rejected_by_email = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [actor?.uid || null, actor?.email || null, Number(request.id)]
  );

  const updatedRequest = await getAccountRequest(request.id);
  await syncAccountRequestToFirebase(updatedRequest);
  return updatedRequest;
};

const deleteAccountRequest = async (identifier) => {
  if (!useMysql()) {
    const requestId = String(identifier || "").trim();
    const reqCol = getDb().collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION);
    const filter = ObjectId.isValid(requestId) ? { _id: new ObjectId(requestId) } : { requestUid: requestId };
    const doc = await reqCol.findOne(filter);
    if (!doc) throw createHttpError(404, "Account request not found.", "request_not_found");
    const request = { id: doc._id.toString(), ...doc };
    await reqCol.deleteOne({ _id: doc._id });
    return request;
  }

  assertMySqlReady();
  const request = await getAccountRequest(identifier);
  if (!request) {
    throw createHttpError(404, "Account request not found.", "request_not_found");
  }

  await query("DELETE FROM account_requests WHERE id = ?", [Number(request.id)]);
  await deleteAccountRequestFromFirebase(request.requestUid);
  return request;
};

const requestPasswordReset = async ({ email, from = "", requestIp = "" } = {}) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !validateEmail(normalizedEmail)) {
    throw createHttpError(400, "A valid email address is required.", "invalid_email");
  }

  let user = await findUserByIdentifier(normalizedEmail, { includeSensitive: true });
  if (!user && useMysql()) {
    user = await materializeLegacyUser(normalizedEmail);
  }

  // Direct MongoDB fallback (case-insensitive)
  if (!user) {
    try {
      const mongo = getDb();
      const doc = await mongo.collection("users").findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
      if (doc) {
        user = {
          id: doc._id.toString(),
          uid: doc.uid || doc.firebaseUid || doc._id.toString(),
          firebaseUid: doc.firebaseUid || doc.uid || null,
          email: normalizeEmail(doc.email || ""),
          displayName: doc.displayName || doc.name || "",
          role: normalizeSystemRole(doc.role || "customer"),
          status: normalizeStatus(doc.status || "active"),
          passwordHash: doc.passwordHash || null,
        };
      }
    } catch (err) {
      logger.warn("Direct MongoDB email lookup failed in password reset:", err.message);
    }
  }

  if (!user) {
    throw createHttpError(404, "No account found with this email.", "user_not_found");
  }

  const result = await sendResetEmail(user, {
    purpose: "reset_password",
    from,
    requestIp,
  });

  return {
    success: true,
    email: normalizedEmail,
    expiresAt: result.expiresAt,
  };
};

const verifyResetToken = async (token) => {
  if (!useMysql()) {
    const normalizedToken = String(token || "").trim();
    const [tokenId, secret] = normalizedToken.split(".");
    if (!tokenId || !secret) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    const mongo = getDb();
    let doc = null;
    try {
      const _id = new ObjectId(tokenId);
      doc = await mongo.collection(FIRESTORE_PASSWORD_RESET_COLLECTION).findOne({ _id });
    } catch (err) {
      // invalid id or not found
      throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
    }

    if (!doc) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
    const expiresAt = doc.expiresAt instanceof Date ? doc.expiresAt : new Date(doc.expiresAt);
    if (doc.usedAt || !expiresAt || expiresAt.getTime() < Date.now()) {
      throw createHttpError(400, "This password reset link is invalid or has expired.", "expired_reset_token");
    }
    const ok = await bcrypt.compare(secret, doc.tokenHash || "");
    if (!ok) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    return {
      success: true,
      email: normalizeEmail(doc.email || ""),
      displayName: doc.displayName || "",
      role: doc.role || "customer",
      expiresAt: toIsoString(expiresAt),
    };
  }

  assertMySqlReady();
  const normalizedToken = String(token || "").trim();
  const [tokenIdRaw, secret] = normalizedToken.split(".");

  if (!/^\d+$/.test(tokenIdRaw || "") || !secret) {
    throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
  }

  const rows = await query(RESET_TOKEN_JOIN_SQL, [Number(tokenIdRaw)]);
  if (!rows.length) {
    throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
  }

  const tokenRow = rows[0];
  if (tokenRow.used_at || new Date(tokenRow.expires_at).getTime() < Date.now()) {
    throw createHttpError(400, "This password reset link is invalid or has expired.", "expired_reset_token");
  }

  const isMatch = await bcrypt.compare(secret, tokenRow.token_hash);
  if (!isMatch) {
    throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
  }

  return {
    success: true,
    email: tokenRow.email,
    displayName: tokenRow.display_name,
    role: tokenRow.role,
    expiresAt: toIsoString(tokenRow.expires_at),
  };
};

const completePasswordReset = async ({ token, newPassword } = {}) => {
  validatePassword(newPassword);

  const normalizedToken = String(token || "").trim();

  if (!useMysql()) {
    const [tokenId, secret] = normalizedToken.split(".");
    if (!tokenId || !secret) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    const mongo = getDb();
    let doc = null;
    try {
      const _id = new ObjectId(tokenId);
      doc = await mongo.collection(FIRESTORE_PASSWORD_RESET_COLLECTION).findOne({ _id });
    } catch (err) {
      throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
    }
    if (!doc) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
    const expiresAt = doc.expiresAt instanceof Date ? doc.expiresAt : new Date(doc.expiresAt);
    if (doc.usedAt || !expiresAt || expiresAt.getTime() < Date.now()) {
      throw createHttpError(400, "This password reset link is invalid or has expired.", "expired_reset_token");
    }
    const ok = await bcrypt.compare(secret, doc.tokenHash || "");
    if (!ok) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    // Update user's passwordHash in MongoDB users collection
    const userId = doc.userId || doc.userUid || null;
    if (!userId) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const usersCollection = mongo.collection("users");
    const normalizedDocEmail = normalizeEmail(doc.email || "");

    // Try all possible identifiers in order
    let matched = 0;
    // 1. by _id (ObjectId)
    try {
      const upd = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { passwordHash, loginAttempts: 0, status: "active", updatedAt: new Date() } });
      matched = upd.matchedCount;
    } catch {}
    // 2. by uid / firebaseUid
    if (!matched) {
      const upd = await usersCollection.updateOne({ $or: [{ uid: userId }, { firebaseUid: userId }] }, { $set: { passwordHash, loginAttempts: 0, status: "active", updatedAt: new Date() } });
      matched = upd.matchedCount;
    }
    // 3. by email (most reliable fallback)
    if (!matched && normalizedDocEmail) {
      await usersCollection.updateOne({ email: normalizedDocEmail }, { $set: { passwordHash, loginAttempts: 0, status: "active", updatedAt: new Date() } });
    }

    // mark token used
    await mongo.collection(FIRESTORE_PASSWORD_RESET_COLLECTION).updateOne({ _id: new ObjectId(tokenId) }, { $set: { usedAt: new Date(), updatedAt: new Date() } });

    // If Firebase user still exists, attempt to sync password there too (best-effort)
    if (admin && doc.userUid) {
      try {
        await admin.auth().updateUser(String(doc.userUid), { password: newPassword, disabled: false });
      } catch (e) {
        // ignore errors here
      }
    }

    return { success: true, email: normalizeEmail(doc.email || "") };
  }

  assertMySqlReady();
  const [tokenIdRaw] = normalizedToken.split(".");
  const verification = await verifyResetToken(normalizedToken);
  const rows = await query(RESET_TOKEN_JOIN_SQL, [Number(tokenIdRaw)]);
  const tokenRow = rows[0];
  const user = mapUserRow(tokenRow, { includeSensitive: true });
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await withTransaction(async (connection) => {
    await query(
      "UPDATE users SET password_hash = ?, status = 'active' WHERE id = ?",
      [passwordHash, Number(user.id)],
      connection
    );
    await query("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?", [Number(tokenIdRaw)], connection);
  });

  if (user.firebaseUid) {
    await admin.auth().updateUser(user.firebaseUid, {
      password: newPassword,
      disabled: false,
    });
  }

  const refreshedUser = await getManagedUser(user.id, { includeSensitive: true });
  await syncUserToFirebase(refreshedUser);

  // Reset loginAttempts in MongoDB
  try {
    const mongo = getDb();
    if (mongo) {
      await mongo.collection("users").updateOne(
        { email: normalizeEmail(user.email || "") },
        { $set: { loginAttempts: 0 } }
      );
    }
  } catch (err) {
    console.error("Failed to reset MongoDB loginAttempts in MySQL mode:", err);
  }

  return { success: true, email: verification.email };
};

const getOwnProfile = async (firebaseUid) => {
  const user = await getManagedUser(firebaseUid);
  if (!user) {
    throw createHttpError(404, "User profile not found.", "user_not_found");
  }
  return user;
};

const changeOwnEmail = async (firebaseUid, nextEmail) => {
  const normalizedEmail = normalizeEmail(nextEmail);
  if (!normalizedEmail || !validateEmail(normalizedEmail)) {
    throw createHttpError(400, "A valid email address is required.", "invalid_email");
  }

  return updateManagedUser(firebaseUid, {
    email: normalizedEmail,
  });
};

const updateOwnProfile = async (firebaseUid, updates) => {
  const allowedUpdates = {
    displayName: updates.displayName,
    phone: updates.phone,
    avatar: updates.avatar || updates.photoURL,
    customImageUrl: updates.customImageUrl,
    avatarSource: updates.avatarSource,
    bio: updates.bio,
    location: updates.location,
    department: updates.department,
    jobTitle: updates.jobTitle,
    experience: updates.experience,
    github: updates.github,
    linkedin: updates.linkedin,
    portfolio: updates.portfolio,
    showOnTeam: updates.showOnTeam,
    cvFilePath: updates.cvFilePath,
  };

  return updateManagedUser(firebaseUid, allowedUpdates);
};

const uploadEmployeeCv = async (firebaseUid, file) => {
  if (!file) {
    throw createHttpError(400, "A CV file is required.", "cv_required");
  }

  const user = await getManagedUser(firebaseUid, { includeSensitive: true });
  if (!user) {
    throw createHttpError(404, "Employee profile not found.", "user_not_found");
  }
  if (user.role !== "employee" && user.role !== "admin") {
    throw createHttpError(403, "Only employee profiles can upload a CV.", "invalid_role");
  }

  // Verify the file was actually saved to disk
  if (!file.path || !fs.existsSync(file.path)) {
    throw createHttpError(500, "CV file upload failed - file not saved to disk.", "file_save_failed");
  }

  const relativePath = `/uploads/cv/${path.basename(file.filename)}`;
  return updateManagedUser(firebaseUid, {
    cvFileName: file.originalname,
    cvFilePath: relativePath,
    cvUploadedAt: new Date().toISOString(),
  });
};

const listEmployeeCvRecords = async () => {
  const users = await listUsersFromSql({ role: "employee" });
  return users
    .filter((user) => user.cvFilePath)
    .map((user) => ({
      id: user.id,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      employeeId: user.employeeId,
      cvFileName: user.cvFileName,
      cvFilePath: user.cvFilePath,
      cvUploadedAt: user.cvUploadedAt,
    }));
};

module.exports = {
  createHttpError,
  normalizeEmail,
  normalizePhone,
  validatePassword,
  listUsersFromSql,
  listChatContacts,
  listPublicTeamMembers,
  getManagedUser,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  mergeManagedUsers,
  createAccountRequest,
  getAccountRequest,
  approveAccountRequest,
  rejectAccountRequest,
  deleteAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  getOwnProfile,
  changeOwnEmail,
  updateOwnProfile,
  uploadEmployeeCv,
  listEmployeeCvRecords,
};
