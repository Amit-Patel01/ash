const admin = require("firebase-admin");

/**
 * Get Firestore db instance
 */
const db = () => admin.firestore();

/**
 * Save a trading payment record
 */
const savePayment = async (paymentId, data) => {
  await db().collection("tradingPayments").doc(paymentId).set({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Create a new enrollment record
 */
const createEnrollment = async (data) => {
  const ref = db().collection("tradingEnrollments").doc();
  await ref.set({
    ...data,
    enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
};

/**
 * Get active enrollments for a course
 */
const getEnrollmentsByCourse = async (courseId) => {
  const snap = await db()
    .collection("tradingEnrollments")
    .where("courseId", "==", courseId)
    .where("status", "==", "active")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get a session by ID
 */
const getSession = async (sessionId) => {
  const snap = await db().collection("tradingSessions").doc(sessionId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Update a session
 */
const updateSession = async (sessionId, data) => {
  await db()
    .collection("tradingSessions")
    .doc(sessionId)
    .update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * Get sessions by date that haven't sent reminders
 */
const getSessionsForReminder = async (dateStr) => {
  const snap = await db()
    .collection("tradingSessions")
    .where("date", "==", dateStr)
    .get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((session) => session.reminderSent !== true);
};

/**
 * Get all active enrolled user emails (deduped)
 */
const getActiveEnrolledEmails = async () => {
  const snap = await db()
    .collection("tradingEnrollments")
    .where("status", "==", "active")
    .get();
  const emails = snap.docs.map((d) => d.data().userEmail).filter(Boolean);
  return [...new Set(emails)];
};

/**
 * Get all active enrollments for generic courses
 */
const getActiveCourseEnrollments = async () => {
  const snap = await db()
    .collection("enrollments")
    .where("status", "==", "active")
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get generic courses that have at least one plan-level meeting configured
 */
const getCoursesWithPlanMeetings = async () => {
  const snap = await db().collection("courses").get();

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(
      (course) =>
        Array.isArray(course.plans) &&
        course.plans.some(
          (plan) => plan && (plan.meetingStartsAt || plan.meetingLink)
        )
    );
};

/**
 * Update the full plans array for a generic course
 */
const updateCoursePlans = async (courseId, plans) => {
  await db()
    .collection("courses")
    .doc(courseId)
    .update({
      plans,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * Certificate helpers
 */
const getCertificateByUserAndCourse = async (userId, courseName) => {
  const snap = await db()
    .collection("certificates")
    .where("userId", "==", userId)
    .where("courseName", "==", courseName)
    .get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

const addCertificate = async (data) => {
  const ref = await db().collection("certificates").add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
};

const getCertificateById = async (certDocId) => {
  const snap = await db().collection("certificates").doc(certDocId).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
};

const updateCertificate = async (certDocId, data) => {
  await db()
    .collection("certificates")
    .doc(certDocId)
    .update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
};

const getCertificateByPublicId = async (certId) => {
  const snap = await db()
    .collection("certificates")
    .where("certificate_id", "==", certId)
    .where("status", "==", "approved")
    .get();
  return snap.empty ? null : snap.docs[0].data();
};

const findCertificateByPublicId = async (certId) => {
  const snap = await db()
    .collection("certificates")
    .where("certificate_id", "==", certId)
    .limit(1)
    .get();

  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

const createCertificateRecord = async (data) => {
  const ref = await db().collection("certificates").add({
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return ref.id;
};

const deleteCertificate = async (certDocId) => {
  await db().collection("certificates").doc(certDocId).delete();
};

module.exports = {
  db,
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
