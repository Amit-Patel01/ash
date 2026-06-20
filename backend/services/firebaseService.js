const { getDb } = require("../utils/mongo");
const { ObjectId } = require("mongodb");
const crypto = require("crypto");

// ─── FIRESTORE MOCK ADAPTER FOR MONGO ────────────────────────────────────────

class DocRef {
  constructor(collection, id) {
    this.collectionName = collection;
    this.id = id;
  }

  getQueryId() {
    try {
      return new ObjectId(this.id);
    } catch (e) {
      return this.id;
    }
  }

  async get() {
    const db = getDb();
    const doc = await db.collection(this.collectionName).findOne({
      $or: [
        { _id: this.getQueryId() },
        { uid: this.id },
        { id: this.id }
      ]
    });
    return {
      exists: !!doc,
      id: this.id,
      data: () => doc ? { ...doc, id: doc._id.toString() } : null
    };
  }

  async set(data, options = {}) {
    const db = getDb();
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;

    if (options.merge) {
      await db.collection(this.collectionName).updateOne(
        { _id: this.getQueryId() },
        { $set: cleanData },
        { upsert: true }
      );
    } else {
      await db.collection(this.collectionName).replaceOne(
        { _id: this.getQueryId() },
        cleanData,
        { upsert: true }
      );
    }
  }

  async update(data) {
    const db = getDb();
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;

    // Handle Firestore FieldValue increment or delete
    const setUpdates = {};
    const incUpdates = {};

    for (const [key, val] of Object.entries(cleanData)) {
      if (val && typeof val === "object" && val._methodName === "FieldValue.increment") {
        incUpdates[key] = val.operand;
      } else {
        setUpdates[key] = val;
      }
    }

    const mongoUpdate = {};
    if (Object.keys(setUpdates).length) mongoUpdate.$set = setUpdates;
    if (Object.keys(incUpdates).length) mongoUpdate.$inc = incUpdates;

    await db.collection(this.collectionName).updateOne(
      { _id: this.getQueryId() },
      mongoUpdate
    );
  }

  async delete() {
    const db = getDb();
    await db.collection(this.collectionName).deleteOne({ _id: this.getQueryId() });
  }

  collection(subName) {
    if (subName === "messages") {
      return new SubMessagesQueryMock(this.collectionName, this.id);
    }
    return new QueryMock(`${this.collectionName}_${subName}`);
  }
}

class QueryMock {
  constructor(collection) {
    this.collectionName = collection;
    this.filters = {};
    this.limitCount = null;
    this.sortOptions = {};
  }

  where(field, op, value) {
    if (op === "==") {
      this.filters[field] = value;
    } else if (op === "array-contains") {
      this.filters[field] = value;
    } else if (op === "!=") {
      this.filters[field] = { $ne: value };
    }
    return this;
  }

  limit(n) {
    this.limitCount = n;
    return this;
  }

  orderBy(field, dir) {
    this.sortOptions[field] = dir === "desc" ? -1 : 1;
    return this;
  }

  doc(id) {
    return new DocRef(this.collectionName, id || crypto.randomBytes(12).toString("hex"));
  }

  async add(data) {
    const db = getDb();
    const result = await db.collection(this.collectionName).insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return new DocRef(this.collectionName, result.insertedId.toString());
  }

  async get() {
    const db = getDb();
    let cursor = db.collection(this.collectionName).find(this.filters);
    if (Object.keys(this.sortOptions).length) {
      cursor = cursor.sort(this.sortOptions);
    }
    if (this.limitCount) {
      cursor = cursor.limit(this.limitCount);
    }
    const docs = await cursor.toArray();
    return {
      empty: docs.length === 0,
      size: docs.length,
      docs: docs.map(d => ({
        id: d._id.toString(),
        ref: new DocRef(this.collectionName, d._id.toString()),
        data: () => ({ ...d, id: d._id.toString() })
      }))
    };
  }
}

class SubMessagesQueryMock {
  constructor(parentCollection, parentId) {
    this.parentCollection = parentCollection;
    this.parentId = parentId;
    this.filters = [];
    this.sortOptions = {};
  }

  where(field, op, value) {
    this.filters.push({ field, op, value });
    return this;
  }

  orderBy(field, dir) {
    this.sortOptions[field] = dir;
    return this;
  }

  doc(messageId) {
    return new SubMessageDocRef(this.parentCollection, this.parentId, messageId || `msg_${Date.now()}`);
  }

  async get() {
    const db = getDb();
    let qId;
    try {
      qId = new ObjectId(this.parentId);
    } catch {
      qId = this.parentId;
    }
    const parentDoc = await db.collection(this.parentCollection).findOne({ _id: qId });
    let messages = parentDoc?._subCollections?.messages || [];
    
    // Apply filters
    for (const filter of this.filters) {
      const { field, op, value } = filter;
      if (op === "==") {
        messages = messages.filter(m => m[field] === value);
      } else if (op === "!=") {
        messages = messages.filter(m => m[field] !== value);
      } else if (op === "array-contains") {
        messages = messages.filter(m => Array.isArray(m[field]) && m[field].includes(value));
      }
    }

    // Sort in memory if requested
    if (this.sortOptions.timestamp) {
      messages.sort((a, b) => {
        const diff = new Date(a.timestamp) - new Date(b.timestamp);
        return this.sortOptions.timestamp === "desc" ? -diff : diff;
      });
    }

    return {
      empty: messages.length === 0,
      size: messages.length,
      docs: messages.map(m => ({
        id: m.id,
        ref: new SubMessageDocRef(this.parentCollection, this.parentId, m.id),
        data: () => m
      }))
    };
  }
}

class SubMessageDocRef {
  constructor(parentCollection, parentId, messageId) {
    this.parentCollection = parentCollection;
    this.parentId = parentId;
    this.messageId = messageId;
  }

  getQueryId() {
    try {
      return new ObjectId(this.parentId);
    } catch (e) {
      return this.parentId;
    }
  }

  async set(data) {
    const db = getDb();
    const parentDoc = await db.collection(this.parentCollection).findOne({ _id: this.getQueryId() });
    let messages = parentDoc?._subCollections?.messages || [];
    
    const index = messages.findIndex(m => m.id === this.messageId);
    if (index >= 0) {
      messages[index] = { ...messages[index], ...data, id: this.messageId };
    } else {
      messages.push({ id: this.messageId, ...data });
    }

    await db.collection(this.parentCollection).updateOne(
      { _id: this.getQueryId() },
      { $set: { "_subCollections.messages": messages } }
    );
  }

  async delete() {
    const db = getDb();
    const parentDoc = await db.collection(this.parentCollection).findOne({ _id: this.getQueryId() });
    let messages = parentDoc?._subCollections?.messages || [];
    messages = messages.filter(m => m.id !== this.messageId);
    await db.collection(this.parentCollection).updateOne(
      { _id: this.getQueryId() },
      { $set: { "_subCollections.messages": messages } }
    );
  }
}

class FirestoreMock {
  collection(name) {
    return new QueryMock(name);
  }

  batch() {
    const tasks = [];
    return {
      update(docRef, data) {
        tasks.push(() => docRef.update(data));
      },
      delete(docRef) {
        tasks.push(() => docRef.delete());
      },
      async commit() {
        for (const task of tasks) {
          await task();
        }
      }
    };
  }
}

const db = () => new FirestoreMock();

// Stub admin claims and options
const adminMock = {
  auth() {
    return {
      async createUser(data) {
        return { uid: `user_${crypto.randomBytes(12).toString("hex")}` };
      },
      async setCustomUserClaims(uid, claims) {
        const db = getDb();
        await db.collection("users").updateOne(
          { $or: [{ _id: uid }, { uid }] },
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
            { $or: [{ _id: uid }, { uid }] },
            { $set: updates }
          );
        }
      },
      async deleteUser(uid) {
        const db = getDb();
        await db.collection("users").deleteOne({
          $or: [{ _id: uid }, { uid }]
        });
      }
    };
  },
  firestore: {
    FieldValue: {
      serverTimestamp() {
        return new Date();
      },
      increment(amount) {
        return { _methodName: "FieldValue.increment", operand: amount };
      }
    },
    Timestamp: {
      fromDate(date) {
        return date;
      }
    }
  }
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
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
};

const createEnrollment = async (data) => {
  const db = getDb();
  const result = await db.collection("tradingEnrollments").insertOne({
    ...data,
    enrolledAt: new Date(),
    createdAt: new Date()
  });
  return result.insertedId.toString();
};

const getEnrollmentsByCourse = async (courseId) => {
  const db = getDb();
  const docs = await db.collection("tradingEnrollments")
    .find({ courseId, status: "active" })
    .toArray();
  return docs.map(d => ({ id: d._id.toString(), ...d }));
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
        updatedAt: new Date()
      }
    }
  );
};

const getSessionsForReminder = async (dateStr) => {
  const db = getDb();
  const docs = await db.collection("tradingSessions")
    .find({ date: dateStr, reminderSent: { $ne: true } })
    .toArray();
  return docs.map(d => ({ id: d._id.toString(), ...d }));
};

const getActiveEnrolledEmails = async () => {
  const db = getDb();
  const docs = await db.collection("tradingEnrollments")
    .find({ status: "active" })
    .toArray();
  const emails = docs.map((d) => d.userEmail).filter(Boolean);
  return [...new Set(emails)];
};

const getActiveCourseEnrollments = async () => {
  const db = getDb();
  const docs = await db.collection("enrollments")
    .find({ status: "active" })
    .toArray();
  return docs.map(d => ({ id: d._id.toString(), ...d }));
};

const getCoursesWithPlanMeetings = async () => {
  const db = getDb();
  const docs = await db.collection("courses").find().toArray();
  return docs
    .map(d => ({ id: d._id.toString(), ...d }))
    .filter(
      (course) =>
        Array.isArray(course.plans) &&
        course.plans.some(
          (plan) => plan && (plan.meetingStartsAt || plan.meetingLink)
        )
    );
};

const updateCoursePlans = async (courseId, plans) => {
  const db = getDb();
  await db.collection("courses").updateOne(
    { _id: getMongoQueryId(courseId) },
    {
      $set: {
        plans,
        updatedAt: new Date()
      }
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
    createdAt: new Date()
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
        updatedAt: new Date()
      }
    }
  );
};

const getCertificateByPublicId = async (certId) => {
  const db = getDb();
  const doc = await db.collection("certificates").findOne({ certificate_id: certId, status: "approved" });
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
  db,
  admin: adminMock,
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
