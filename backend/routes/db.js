const express = require("express");
const router = express.Router();
const { getDb } = require("../utils/mongo");
const { verifyFirebaseToken, optionalAuth } = require("../middlewares/authMiddleware");
const { ObjectId } = require("mongodb");
const { logger } = require("../logger");

const getQueryId = (id) => {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
};

// Dynamic CRUD route - GET list
router.get("/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const db = getDb();
    
    const publicCollections = [
      "projects",
      "categories",
      "services",
      "employees",
      "tradingCourses",
      "courses",
      "courseCategories",
      "tradingCurriculum",
      "tradingSessions",
      "settings",
      "tradingSettings",
      "certificates",
      "testimonials"
    ];

    const isPublic = publicCollections.includes(collection);
    
    if (!isPublic && !req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token required for this collection"
      });
    }

    const isEmployeeOrAdmin = req.user && ["admin", "employee"].includes(req.user.role);
    let filter = {};
    
    // Define private collections and their owner fields
    const privateCollections = {
      orders: "userId",
      enrollments: "userId",
      tradingEnrollments: "userId",
      tradingPayments: "userId",
      custom_requests: "userId",
      sellRequests: "userId"
    };

    if (req.user && !isEmployeeOrAdmin && privateCollections[collection]) {
      const ownerField = privateCollections[collection];
      filter[ownerField] = req.user.uid;
    }

    // Special case for notifications: filter by recipientId or recipientEmployeeId
    if (collection === "notifications" && req.user) {
      if (!isEmployeeOrAdmin) {
        filter.recipientId = req.user.uid;
      } else {
        filter.$or = [
          { recipientId: req.user.uid },
          { recipientEmployeeId: req.user.employeeId }
        ];
      }
    }

    // Parse query params if any (e.g. status)
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "limit" && key !== "sort" && key !== "order" && key !== "orderBy") {
        filter[key] = value === "true" ? true : value === "false" ? false : value;
      }
    }

    let cursor = db.collection(collection).find(filter);

    // Apply sorting
    const sortField = req.query.orderBy || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    cursor = cursor.sort({ [sortField]: sortOrder });

    // Apply limit
    if (req.query.limit) {
      cursor = cursor.limit(parseInt(req.query.limit, 10));
    }

    const docs = await cursor.toArray();

    // Map _id to id for frontend compatibility
    const formattedDocs = docs.map(d => ({
      id: d._id.toString(),
      ...d,
      _id: d._id.toString()
    }));

    res.json({ success: true, documents: formattedDocs });
  } catch (error) {
    logger.error(`Error fetching collection ${req.params.collection}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single document
router.get("/:collection/:id", optionalAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = getDb();

    const doc = await db.collection(collection).findOne({
      $or: [
        { _id: getQueryId(id) },
        { uid: id },
        { id: id }
      ]
    });
    
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const publicCollections = [
      "projects",
      "categories",
      "services",
      "employees",
      "tradingCourses",
      "courses",
      "courseCategories",
      "tradingCurriculum",
      "tradingSessions",
      "settings",
      "tradingSettings",
      "certificates",
      "testimonials"
    ];

    const isPublic = publicCollections.includes(collection);
    
    if (!isPublic && !req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token required for this collection"
      });
    }

    // Security check
    const isEmployeeOrAdmin = req.user && ["admin", "employee"].includes(req.user.role);
    const privateCollections = {
      orders: "userId",
      enrollments: "userId",
      tradingEnrollments: "userId",
      tradingPayments: "userId",
      custom_requests: "userId",
      sellRequests: "userId"
    };

    if (req.user && !isEmployeeOrAdmin && privateCollections[collection]) {
      const ownerField = privateCollections[collection];
      if (doc[ownerField] !== req.user.uid) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    res.json({
      success: true,
      document: {
        id: doc._id.toString(),
        ...doc,
        _id: doc._id.toString()
      }
    });
  } catch (error) {
    logger.error(`Error fetching document ${req.params.id} from ${req.params.collection}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create document
router.post("/:collection", optionalAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const db = getDb();
    
    const guestWriteCollections = [
      "messages",
      "custom_requests",
      "sellRequests",
      "accountRequests"
    ];

    const isGuestWriteAllowed = guestWriteCollections.includes(collection);

    if (!isGuestWriteAllowed && !req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token required for this action"
      });
    }

    // Security check for writing
    const isEmployeeOrAdmin = req.user && ["admin", "employee"].includes(req.user.role);
    const adminOnlyCollections = ["categories", "services", "tradingCourses", "courses", "courseCategories", "tradingSettings", "settings", "testimonials"];
    
    if (adminOnlyCollections.includes(collection) && !isEmployeeOrAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin only" });
    }

    const payload = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If customer
    if (req.user) {
      if (!isEmployeeOrAdmin) {
        const privateCollections = ["projects", "orders", "enrollments", "tradingEnrollments", "custom_requests", "sellRequests"];
        if (privateCollections.includes(collection)) {
          payload.userId = req.user.uid;
        }
      }
    }

    // Handle custom ID (e.g. settings/maintenance)
    if (req.body.id) {
      payload._id = req.body.id;
    }

    const result = await db.collection(collection).insertOne(payload);
    res.json({
      success: true,
      id: result.insertedId.toString(),
      document: {
        id: result.insertedId.toString(),
        ...payload,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    logger.error(`Error creating document in ${req.params.collection}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH update document
router.patch("/:collection/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = getDb();

    // Security check
    const isEmployeeOrAdmin = ["admin", "employee"].includes(req.user.role);
    const adminOnlyCollections = ["categories", "services", "tradingCourses", "courses", "courseCategories", "tradingSettings", "settings", "testimonials"];

    if (adminOnlyCollections.includes(collection) && !isEmployeeOrAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admin only" });
    }

    const existingDoc = await db.collection(collection).findOne({
      $or: [
        { _id: getQueryId(id) },
        { uid: id },
        { id: id }
      ]
    });

    if (!existingDoc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    if (!isEmployeeOrAdmin) {
      const privateCollections = {
        projects: "userId",
        orders: "userId",
        enrollments: "userId",
        tradingEnrollments: "userId",
        tradingPayments: "userId",
        custom_requests: "userId",
        sellRequests: "userId"
      };
      if (privateCollections[collection]) {
        const ownerField = privateCollections[collection];
        if (existingDoc[ownerField] !== req.user.uid) {
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
      }
    }

    const updates = {
      ...req.body,
      updatedAt: new Date()
    };

    // Strip immutable fields
    delete updates._id;
    delete updates.id;

    await db.collection(collection).updateOne(
      { _id: existingDoc._id },
      { $set: updates }
    );

    res.json({
      success: true,
      document: {
        id: existingDoc._id.toString(),
        ...existingDoc,
        ...updates,
        _id: existingDoc._id.toString()
      }
    });
  } catch (error) {
    logger.error(`Error updating document ${req.params.id} in ${req.params.collection}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE document
router.delete("/:collection/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const db = getDb();

    // Security check
    const isEmployeeOrAdmin = ["admin", "employee"].includes(req.user.role);
    if (!isEmployeeOrAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Employee/Admin only" });
    }

    const doc = await db.collection(collection).findOne({
      $or: [
        { _id: getQueryId(id) },
        { uid: id },
        { id: id }
      ]
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    await db.collection(collection).deleteOne({ _id: doc._id });
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting document ${req.params.id} from ${req.params.collection}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
