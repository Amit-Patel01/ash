const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const admin = require("firebase-admin");
const { logger } = require("../logger");
const { sendEmail, emailTemplate } = require("./emailService");

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const DEFAULT_SITE_URL = (process.env.APP_URL || "https://www.amitsolutionhub.com").replace(/\/+$/, "");
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

const mapFirestoreUser = (docSnap, { includeSensitive = false } = {}) => {
  if (!docSnap?.exists) return null;
  const data = docSnap.data() || {};

  const user = {
    id: docSnap.id,
    numericId: null,
    uid: docSnap.id,
    firebaseUid: docSnap.id,
    email: normalizeEmail(data.email || ""),
    phone: normalizePhone(data.phone || ""),
    displayName: data.displayName || data.name || "",
    role: normalizeSystemRole(data.role || "customer"),
    status: normalizeStatus(data.status || "active"),
    department: data.department || "",
    jobTitle: data.jobTitle || "",
    employeeId: data.employeeId || "",
    joinDate: data.joinDate || "",
    avatar: data.avatar || data.photoURL || "",
    avatarSource: data.avatarSource || "",
    github: data.github || "",
    linkedin: data.linkedin || "",
    portfolio: data.portfolio || "",
    bio: data.bio || "",
    experience: data.experience || "",
    skills: Array.isArray(data.skills) ? data.skills : parseSkills(data.skills),
    showOnTeam: normalizeBoolean(data.showOnTeam),
    isMentor: normalizeBoolean(data.isMentor),
    location: data.location || "",
    cvFileName: data.cvFileName || "",
    cvFilePath: data.cvFilePath || "",
    cvUploadedAt: data.cvUploadedAt || null,
    createdAt: data.createdAt ? toIsoString(data.createdAt.toDate?.() || data.createdAt) : null,
    updatedAt: data.updatedAt ? toIsoString(data.updatedAt.toDate?.() || data.updatedAt) : null,
  };

  if (includeSensitive) {
    user.passwordHash = data.passwordHash || null;
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

const normalizeStatus = (value = "active") =>
  String(value || "active").trim().toLowerCase() === "inactive" ? "inactive" : "active";

const normalizeSystemRole = (value = "customer") => {
  const normalized = String(value || "customer").trim().toLowerCase();
  if (["admin", "employee", "customer"].includes(normalized)) {
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

const getFirestore = () => admin.firestore();

const syncUserToFirebase = async (user) => {
  if (!user?.firebaseUid) {
    return;
  }

  const firestore = getFirestore();
  const userPayload = buildFirestoreUserPayload(user);

  await firestore.collection(FIRESTORE_USER_COLLECTION).doc(user.firebaseUid).set(userPayload, { merge: true });

  if (user.role === "employee" && user.showOnTeam) {
    await firestore.collection(FIRESTORE_TEAM_COLLECTION).doc(user.firebaseUid).set(buildTeamPayload(user), {
      merge: true,
    });
  } else {
    const teamDoc = firestore.collection(FIRESTORE_TEAM_COLLECTION).doc(user.firebaseUid);
    const teamSnap = await teamDoc.get();
    if (teamSnap.exists) {
      await teamDoc.delete();
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
  const firestore = getFirestore();

  if (user?.firebaseUid) {
    const batch = firestore.batch();
    batch.delete(firestore.collection(FIRESTORE_USER_COLLECTION).doc(user.firebaseUid));
    batch.delete(firestore.collection("status").doc(user.firebaseUid));
    batch.delete(firestore.collection(FIRESTORE_TEAM_COLLECTION).doc(user.firebaseUid));
    await batch.commit();

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
  await getFirestore()
    .collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION)
    .doc(request.requestUid)
    .set(buildFirestoreAccountRequestPayload(request), { merge: true });
};

const deleteAccountRequestFromFirebase = async (requestUid) => {
  if (!requestUid) return;
  await getFirestore().collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).doc(requestUid).delete().catch(() => {});
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
  const firestore = getFirestore();

  if (uid) {
    const snap = await firestore.collection(FIRESTORE_USER_COLLECTION).doc(String(uid)).get();
    return mapFirestoreUser(snap, { includeSensitive });
  }

  const normalizedEmail = email ? normalizeEmail(email) : "";
  const normalizedPhone = phone ? normalizePhone(phone) : "";

  if (normalizedEmail) {
    const snap = await firestore
      .collection(FIRESTORE_USER_COLLECTION)
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();
    if (!snap.empty) return mapFirestoreUser(snap.docs[0], { includeSensitive });
  }

  if (normalizedPhone) {
    const snap = await firestore
      .collection(FIRESTORE_USER_COLLECTION)
      .where("phone", "==", normalizedPhone)
      .limit(1)
      .get();
    if (!snap.empty) return mapFirestoreUser(snap.docs[0], { includeSensitive });
  }

  return null;
};

const listUsersFromFirestore = async (filters = {}) => {
  const firestore = getFirestore();
  let q = firestore.collection(FIRESTORE_USER_COLLECTION);
  if (filters.role) q = q.where("role", "==", normalizeSystemRole(filters.role));
  if (filters.status) q = q.where("status", "==", normalizeStatus(filters.status));

  const snap = await q.limit(500).get();
  return snap.docs.map((doc) => mapFirestoreUser(doc)).filter(Boolean);
};

const listUsersFromSql = async (filters = {}, connection = null) => {
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

const findUserByIdentifier = async (identifier, { includeSensitive = false, connection = null } = {}) => {
  if (!useMysql()) {
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

    const firestore = getFirestore();
    const legacyDocs = [];

    if (normalizedEmail) {
      const snap = await firestore
        .collection(FIRESTORE_USER_COLLECTION)
        .where("email", "==", normalizedEmail)
        .limit(2)
        .get();
      legacyDocs.push(...snap.docs);
    }
    if (normalizedPhone) {
      const snap = await firestore
        .collection(FIRESTORE_USER_COLLECTION)
        .where("phone", "==", normalizedPhone)
        .limit(2)
        .get();
      legacyDocs.push(...snap.docs);
    }

    const legacyConflict = legacyDocs.find((docSnap) => docSnap.id !== excludeFirebaseUid);
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

  const firestore = getFirestore();
  const legacyDocs = [];

  if (normalizedEmail) {
    const snap = await firestore
      .collection(FIRESTORE_USER_COLLECTION)
      .where("email", "==", normalizedEmail)
      .limit(2)
      .get();
    legacyDocs.push(...snap.docs);
  }
  if (normalizedPhone) {
    const snap = await firestore
      .collection(FIRESTORE_USER_COLLECTION)
      .where("phone", "==", normalizedPhone)
      .limit(2)
      .get();
    legacyDocs.push(...snap.docs);
  }

  const legacyConflict = legacyDocs.find((docSnap) => docSnap.id !== excludeFirebaseUid);
  if (legacyConflict) {
    const data = legacyConflict.data() || {};
    return {
      id: null,
      numericId: null,
      uid: legacyConflict.id,
      firebaseUid: legacyConflict.id,
      email: normalizeEmail(data.email || normalizedEmail),
      phone: normalizePhone(data.phone || normalizedPhone),
      displayName: data.displayName || data.name || "Member",
      role: normalizeSystemRole(data.role || "customer"),
      status: normalizeStatus(data.status || "active"),
      department: data.department || "",
      jobTitle: data.jobTitle || data.roleLabel || "",
      employeeId: data.employeeId || "",
      joinDate: data.joinDate || "",
      avatar: data.avatar || data.photoURL || "",
      avatarSource: data.avatarSource || "",
      github: data.github || "",
      linkedin: data.linkedin || "",
      portfolio: data.portfolio || "",
      bio: data.bio || "",
      experience: data.experience || "",
      skills: parseSkills(data.skills),
      showOnTeam: normalizeBoolean(data.showOnTeam),
      isMentor: normalizeBoolean(data.isMentor),
      location: data.location || "",
      cvFileName: data.cvFileName || "",
      cvFilePath: data.cvFilePath || "",
      cvUploadedAt: data.cvUploadedAt || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
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

  const firestore = getFirestore();
  let docSnap = await firestore.collection(FIRESTORE_USER_COLLECTION).doc(normalized).get();

  if (!docSnap.exists && normalized.includes("@")) {
    const byEmail = await firestore
      .collection(FIRESTORE_USER_COLLECTION)
      .where("email", "==", normalizeEmail(normalized))
      .limit(1)
      .get();
    docSnap = byEmail.docs[0] || docSnap;
  }

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data() || {};
  const payload = {
    firebaseUid: docSnap.id,
    displayName: data.displayName || data.name || "Member",
    email: normalizeEmail(data.email),
    phone: normalizePhone(data.phone),
    role: normalizeSystemRole(data.role || "customer"),
    status: normalizeStatus(data.status || "active"),
    department: data.department || "",
    jobTitle: data.jobTitle || "",
    employeeId: data.employeeId || "",
    joinDate: toDateString(data.joinDate || data.createdAt),
    avatar: data.avatar || data.photoURL || "",
    avatarSource: data.avatarSource || "",
    github: data.github || "",
    linkedin: data.linkedin || "",
    portfolio: data.portfolio || "",
    bio: data.bio || "",
    experience: data.experience || "",
    skills: parseSkills(data.skills),
    showOnTeam: normalizeBoolean(data.showOnTeam),
    isMentor: normalizeBoolean(data.isMentor),
    location: data.location || "",
    cvFileName: data.cvFileName || "",
    cvFilePath: data.cvFilePath || "",
    cvUploadedAt: data.cvUploadedAt || null,
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
    const firestore = getFirestore();
    const ref = firestore.collection(FIRESTORE_PASSWORD_RESET_COLLECTION).doc();
    await ref.set({
      userUid: user.firebaseUid || user.uid,
      email: normalizeEmail(user.email),
      purpose,
      tokenHash,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      usedAt: null,
      requestIp: requestIp || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { token: `${ref.id}.${secret}`, expiresAt: expiresAt.toISOString() };
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

  await sendEmail({
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
      const firestore = getFirestore();
      const ref = firestore.collection(FIRESTORE_USER_COLLECTION).doc(authProvision.firebaseUid);
      await ref.set(
        {
          uid: authProvision.firebaseUid,
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
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      const snap = await ref.get();
      createdUser = mapFirestoreUser(snap, { includeSensitive: true });
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
    const firestore = getFirestore();
    const ref = firestore.collection(FIRESTORE_USER_COLLECTION).doc(String(uid));
    await ref.set(
      {
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
        cvFileName: updates.cvFileName ?? existingUser.cvFileName,
        cvFilePath: updates.cvFilePath ?? existingUser.cvFilePath,
        cvUploadedAt: updates.cvUploadedAt ?? existingUser.cvUploadedAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    const snap = await ref.get();
    updatedUser = mapFirestoreUser(snap, { includeSensitive: true });
  }

  await syncUserToFirebase(updatedUser);
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
    const firestore = getFirestore();
    const uid = user.firebaseUid || user.uid;
    if (uid) {
      // best-effort cleanup
      const tokensSnap = await firestore
        .collection(FIRESTORE_PASSWORD_RESET_COLLECTION)
        .where("userUid", "==", uid)
        .limit(200)
        .get();
      await Promise.all(tokensSnap.docs.map((doc) => doc.ref.delete().catch(() => {})));

      const reqSnap = await firestore
        .collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION)
        .where("linkedUserId", "==", uid)
        .limit(200)
        .get();
      await Promise.all(reqSnap.docs.map((doc) => doc.ref.set({ linkedUserId: "" }, { merge: true }).catch(() => {})));

      await firestore.collection(FIRESTORE_USER_COLLECTION).doc(uid).delete().catch(() => {});
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
    const firestore = getFirestore();
    const primaryUid = primaryUser.firebaseUid || primaryUser.uid;
    const duplicateUid = duplicateUser.firebaseUid || duplicateUser.uid;

    const mergedPayload = {
      ...primaryUser,
      phone: primaryUser.phone || duplicateUser.phone,
      department: primaryUser.department || duplicateUser.department,
      jobTitle: primaryUser.jobTitle || duplicateUser.jobTitle,
      employeeId: primaryUser.employeeId || duplicateUser.employeeId,
      joinDate: primaryUser.joinDate || duplicateUser.joinDate,
      avatar: primaryUser.avatar || duplicateUser.avatar,
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

    await firestore.collection(FIRESTORE_USER_COLLECTION).doc(primaryUid).set(
      {
        ...buildFirestoreUserPayload(mergedPayload),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const reqSnap = await firestore
      .collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION)
      .where("linkedUserId", "==", duplicateUid)
      .limit(200)
      .get();
    await Promise.all(reqSnap.docs.map((doc) => doc.ref.set({ linkedUserId: primaryUid }, { merge: true }).catch(() => {})));

    await firestore.collection(FIRESTORE_USER_MERGE_AUDIT_COLLECTION).add({
      survivingUserId: primaryUid,
      mergedUserId: duplicateUid,
      mergedByUid: mergedBy?.uid || null,
      mergedByEmail: mergedBy?.email || null,
      mergeReason: mergeReason || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await firestore.collection(FIRESTORE_USER_COLLECTION).doc(duplicateUid).delete().catch(() => {});
    await removeUserFromFirebase(duplicateUser);

    const refreshedSnap = await firestore.collection(FIRESTORE_USER_COLLECTION).doc(primaryUid).get();
    const refreshed = mapFirestoreUser(refreshedSnap);
    await syncUserToFirebase(refreshed);

    logger.info(
      `[UserManagement] Merged ${duplicateUser.email} into ${refreshed.email}${mergedBy?.email ? ` by ${mergedBy.email}` : ""}`
    );

    return { primaryUser: refreshed, mergedUser: duplicateUser };
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

    if (!name) throw createHttpError(400, "Full name is required.", "display_name_required");
    if (!email || !validateEmail(email)) throw createHttpError(400, "A valid email address is required.", "invalid_email");
    if (!phone || !validatePhone(phone)) throw createHttpError(400, "A valid phone number is required.", "invalid_phone");
    if (!department) throw createHttpError(400, "Department is required.", "department_required");

    const firestore = getFirestore();

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
        status: "approved",
        mergeCount: 1,
        linkedUserId: existingAccount.uid,
        alreadyExists: true,
        approvedAt: new Date().toISOString(),
        rejectedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await firestore.collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).doc(requestUid).set(payload, { merge: true });

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
    const pendingByEmail = await firestore
      .collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION)
      .where("email", "==", email)
      .where("status", "==", "pending")
      .limit(1)
      .get();
    const pendingByPhone = await firestore
      .collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION)
      .where("phone", "==", phone)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    const existingPending = (!pendingByEmail.empty && pendingByEmail.docs[0]) || (!pendingByPhone.empty && pendingByPhone.docs[0]) || null;
    if (existingPending) {
      const doc = existingPending;
      const data = doc.data() || {};
      const next = {
        ...data,
        name,
        department,
        role: requestedRole || data.role || "Employee",
        reason: reason || data.reason || "",
        mergeCount: Number(data.mergeCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      await doc.ref.set(next, { merge: true });
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
      status: "pending",
      mergeCount: 0,
      linkedUserId: "",
      alreadyExists: false,
      approvedAt: null,
      rejectedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await firestore.collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).doc(requestUid).set(payload, { merge: true });

    return { request: payload, merged: false, message: "Your request has been submitted successfully." };
  }

  assertMySqlReady();

  const name = String(input.name || input.displayName || "").trim();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const department = String(input.department || "").trim();
  const requestedRole = String(input.role || input.requestedRole || "Employee").trim();
  const reason = String(input.reason || "").trim();

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
              status = 'approved',
              linked_user_id = ?,
              merge_count = merge_count + 1,
              approved_at = NOW(),
              updated_at = NOW()
            WHERE id = ?
          `,
          [name, department, requestedRole, reason || null, conflict.id ? Number(conflict.id) : null, existingRows[0].id],
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
            status, linked_user_id, merge_count, approved_at
          )
          VALUES (?, ?, ?, ?, ?, ?, 'employee', ?, 'approved', ?, 1, NOW())
        `,
        [requestUid, name, email, phone, department, requestedRole, reason || null, conflict.id ? Number(conflict.id) : null],
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
          merge_count = merge_count + 1,
          updated_at = NOW()
        WHERE id = ?
      `,
      [name, department, requestedRole, reason || null, pendingRows[0].id]
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
        request_uid, name, email, phone, department, requested_role, system_role, reason, status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'employee', ?, 'pending')
    `,
    [requestUid, name, email, phone, department, requestedRole, reason || null]
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
    const firestore = getFirestore();
    const requestId = String(identifier || "").trim();
    const docSnap = await firestore.collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).doc(requestId).get();
    if (!docSnap.exists) throw createHttpError(404, "Account request not found.", "request_not_found");

    const request = { id: docSnap.id, ...(docSnap.data() || {}) };
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
      await docSnap.ref.set(updated, { merge: true });
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
    await docSnap.ref.set(updated, { merge: true });

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
    const firestore = getFirestore();
    const requestId = String(identifier || "").trim();
    const docSnap = await firestore.collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).doc(requestId).get();
    if (!docSnap.exists) throw createHttpError(404, "Account request not found.", "request_not_found");
    const request = { id: docSnap.id, ...(docSnap.data() || {}) };

    const updated = {
      ...request,
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectedByUid: actor?.uid || "",
      rejectedByEmail: actor?.email || "",
      updatedAt: new Date().toISOString(),
    };
    await docSnap.ref.set(updated, { merge: true });
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
    const firestore = getFirestore();
    const requestId = String(identifier || "").trim();
    const docSnap = await firestore.collection(FIRESTORE_ACCOUNT_REQUEST_COLLECTION).doc(requestId).get();
    if (!docSnap.exists) throw createHttpError(404, "Account request not found.", "request_not_found");
    const request = { id: docSnap.id, ...(docSnap.data() || {}) };
    await docSnap.ref.delete();
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

  // Fallback: Direct database search in MySQL for edge cases (case sensitivity, normalization issues)
  if (!user && useMysql()) {
    assertMySqlReady();
    try {
      const rows = await query(
        `SELECT ${USER_COLUMN_SQL} FROM users u WHERE LOWER(u.email) = LOWER(?) LIMIT 1`,
        [normalizedEmail]
      );
      if (rows.length > 0) {
        user = mapUserRow(rows[0], { includeSensitive: true });
      }
    } catch (err) {
      logger.warn("Direct email lookup failed in password reset:", err.message);
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

    const firestore = getFirestore();
    const snap = await firestore.collection(FIRESTORE_PASSWORD_RESET_COLLECTION).doc(tokenId).get();
    if (!snap.exists) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
    const data = snap.data() || {};
    const expiresAt = data.expiresAt?.toDate?.() ? data.expiresAt.toDate() : new Date(data.expiresAt);
    if (data.usedAt || !expiresAt || expiresAt.getTime() < Date.now()) {
      throw createHttpError(400, "This password reset link is invalid or has expired.", "expired_reset_token");
    }
    const ok = await bcrypt.compare(secret, data.tokenHash || "");
    if (!ok) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    return {
      success: true,
      email: normalizeEmail(data.email || ""),
      displayName: data.displayName || "",
      role: data.role || "customer",
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

    const firestore = getFirestore();
    const tokenRef = firestore.collection(FIRESTORE_PASSWORD_RESET_COLLECTION).doc(tokenId);
    const snap = await tokenRef.get();
    if (!snap.exists) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");
    const data = snap.data() || {};
    const expiresAt = data.expiresAt?.toDate?.() ? data.expiresAt.toDate() : new Date(data.expiresAt);
    if (data.usedAt || !expiresAt || expiresAt.getTime() < Date.now()) {
      throw createHttpError(400, "This password reset link is invalid or has expired.", "expired_reset_token");
    }
    const ok = await bcrypt.compare(secret, data.tokenHash || "");
    if (!ok) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    const uid = String(data.userUid || "");
    if (!uid) throw createHttpError(400, "This password reset link is invalid or has expired.", "invalid_reset_token");

    await admin.auth().updateUser(uid, { password: newPassword, disabled: false });

    await tokenRef.set(
      { usedAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    // ensure user is active in firestore
    await firestore.collection(FIRESTORE_USER_COLLECTION).doc(uid).set(
      { status: "active", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    return { success: true, email: normalizeEmail(data.email || "") };
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

  return { success: true, email: verification.email };
};

const getOwnProfile = async (firebaseUid) => {
  const user = await getManagedUser(firebaseUid);
  if (!user) {
    throw createHttpError(404, "User profile not found.", "user_not_found");
  }
  return user;
};

const updateOwnProfile = async (firebaseUid, updates) => {
  const allowedUpdates = {
    displayName: updates.displayName,
    phone: updates.phone,
    avatar: updates.avatar || updates.photoURL,
    avatarSource: updates.avatarSource,
    bio: updates.bio,
    location: updates.location,
    department: updates.department,
    jobTitle: updates.jobTitle,
    experience: updates.experience,
    github: updates.github,
    linkedin: updates.linkedin,
    portfolio: updates.portfolio,
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
  updateOwnProfile,
  uploadEmployeeCv,
  listEmployeeCvRecords,
};
