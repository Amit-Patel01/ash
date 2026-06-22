const { getDb } = require("../utils/mongo");
const { ObjectId } = require("mongodb");

// ─── MINIMAL ADMIN STUBS (for backward compat in userService) ────────────────

const admin = {
  auth() {
    return {
      async createUser(data) {
        const db = getDb();
        const { uid } = await db.collection("users").insertOne({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { uid: uid?.toString() || `user_${Date.now()}` };
      },
      async setCustomUserClaims(uid, claims) {
        const db = getDb();
        await db.collection("users").updateOne(
          { $or: [{ _id: ObjectId.isValid(uid) ? new ObjectId(uid) : uid }, { uid }] },
          { $set: { role: claims.role } }
        );
      },
      async updateUser(uid, data) {
        const db = getDb();
        const updates = {};
        if (data.password) {
          const bcrypt = require("bcryptjs");
          updates.passwordHash = await bcrypt.hash(data.password, 12);
        }
        if (data.email) updates.email = data.email;
        if (data.displayName) updates.displayName = data.displayName;
        if (data.disabled !== undefined) {
          updates.status = data.disabled ? "inactive" : "active";
        }
        if (Object.keys(updates).length > 0) {
          await db.collection("users").updateOne(
            { $or: [{ _id: ObjectId.isValid(uid) ? new ObjectId(uid) : uid }, { uid }] },
            { $set: updates }
          );
        }
      },
      async deleteUser(uid) {
        const db = getDb();
        await db.collection("users").deleteOne({
          $or: [{ _id: ObjectId.isValid(uid) ? new ObjectId(uid) : uid }, { uid }],
        });
      },
    };
  },
  firestore: {
    FieldValue: {
      serverTimestamp() {
        return new Date();
      },
      increment(amount) {
        return { _methodName: "FieldValue.increment", operand: amount };
      },
    },
    Timestamp: {
      fromDate(date) {
        return date;
      },
    },
  },
};

// ─── NATIVE MONGO HELPERS ───────────────────────────────────────────────────

const getMongoQueryId = (id) => {
  try {
    return new ObjectId(id);
  } catch (e) {
    return id;
  }
};

const savePayment = async (paymentId, data) => {
  const db = getDb();
  await db.collection("tradingPayments").updateOne(
    { _id: getMongoQueryId(paymentId) },
    {
      $set: {
        ...data,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
};

const createEnrollment = async (data) => {
  const db = getDb();
  const result = await db.collection("tradingEnrollments").insertOne({
    ...data,
    enrolledAt: new Date(),
    createdAt: new Date(),
  });
  return result.insertedId.toString();
};

const getEnrollmentsByCourse = async (courseId) => {
  const db = getDb();
  const docs = await db
    .collection("tradingEnrollments")
    .find({ courseId, status: "active" })
    .toArray();
  return docs.map((d) => ({ id: d._id.toString(), ...d }));
};

const getSession = async (sessionId) => {
  const db = getDb();
  const doc = await db.collection("tradingSessions").findOne({ _id: getMongoQueryId(sessionId) });
  return doc ? { id: doc._id.toString(), ...doc } : null;
};

const updateSession = async (sessionId, data) => {
  const db = getDb();
  await db.collection("tradingSessions").updateOne(
    { _id: getMongoQueryId(sessionId) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );
};

const getSessionsForReminder = async (dateStr) => {
  const db = getDb();
  const docs = await db
    .collection("tradingSessions")
    .find({ date: dateStr, reminderSent: { $ne: true } })
    .toArray();
  return docs.map((d) => ({ id: d._id.toString(), ...d }));
};

const getActiveEnrolledEmails = async () => {
  const db = getDb();
  const docs = await db.collection("tradingEnrollments").find({ status: "active" }).toArray();
  const emails = docs.map((d) => d.userEmail).filter(Boolean);
  return [...new Set(emails)];
};

const getActiveCourseEnrollments = async () => {
  const db = getDb();
  const docs = await db.collection("enrollments").find({ status: "active" }).toArray();
  return docs.map((d) => ({ id: d._id.toString(), ...d }));
};

const getCoursesWithPlanMeetings = async () => {
  const db = getDb();
  const docs = await db.collection("courses").find().toArray();
  return docs
    .map((d) => ({ id: d._id.toString(), ...d }))
    .filter(
      (course) =>
        Array.isArray(course.plans) &&
        course.plans.some((plan) => plan && (plan.meetingStartsAt || plan.meetingLink))
    );
};

const updateCoursePlans = async (courseId, plans) => {
  const db = getDb();
  await db.collection("courses").updateOne(
    { _id: getMongoQueryId(courseId) },
    {
      $set: {
        plans,
        updatedAt: new Date(),
      },
    }
  );
};

const getCertificateByUserAndCourse = async (userId, courseName) => {
  const db = getDb();
  const doc = await db.collection("certificates").findOne({ userId, courseName });
  return doc ? { id: doc._id.toString(), ...doc } : null;
};

const addCertificate = async (data) => {
  const db = getDb();
  const result = await db.collection("certificates").insertOne({
    ...data,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
};

const getCertificateById = async (certDocId) => {
  const db = getDb();
  const doc = await db.collection("certificates").findOne({ _id: getMongoQueryId(certDocId) });
  return doc ? { id: doc._id.toString(), ...doc } : null;
};

const updateCertificate = async (certDocId, data) => {
  const db = getDb();
  await db.collection("certificates").updateOne(
    { _id: getMongoQueryId(certDocId) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );
};

const getCertificateByPublicId = async (certId) => {
  const db = getDb();
  const doc = await db
    .collection("certificates")
    .findOne({ certificate_id: certId, status: "approved" });
  return doc ? { id: doc._id.toString(), ...doc } : doc;
};

const findCertificateByPublicId = async (certId) => {
  const db = getDb();
  const doc = await db.collection("certificates").findOne({ certificate_id: certId });
  return doc ? { id: doc._id.toString(), ...doc } : null;
};

const createCertificateRecord = async (data) => {
  return addCertificate(data);
};

const deleteCertificate = async (certDocId) => {
  const db = getDb();
  await db.collection("certificates").deleteOne({ _id: getMongoQueryId(certDocId) });
};

module.exports = {
  admin,
  savePayment,
  createEnrollment,
  getEnrollmentsByCourse,
  getSession,
  updateSession,
  getSessionsForReminder,
  getActiveEnrolledEmails,
  getActiveCourseEnrollments,
  getCoursesWithPlanMeetings,
  updateCoursePlans,
  getCertificateByUserAndCourse,
  addCertificate,
  getCertificateById,
  updateCertificate,
  getCertificateByPublicId,
  findCertificateByPublicId,
  createCertificateRecord,
  deleteCertificate,
};
