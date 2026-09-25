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

// ── Shared ACL constants ──
const PUBLIC_COLLECTIONS = [
  "projects",
  "categories",
  "services",
  "employees",
  "team",
  "tradingCourses",
  "courses",
  "courseCategories",
  "tradingCurriculum",
  "sessions",
  "tradingSessions",
  "settings",
  "tradingSettings",
  "certificates",
  "testimonials",
  "internshipCategories"
];

const PRIVATE_COLLECTION_OWNER_FIELD = {
  orders: "userId",
  enrollments: "userId",
  payments: "userId",
  custom_requests: "userId",
  sellRequests: "userId"
};

const ADMIN_ONLY_WRITE_COLLECTIONS = [
  "categories", "services", "tradingCourses", "courses", "courseCategories",
  "tradingSettings", "settings", "testimonials", "internshipCategories", "receipts"
];

// Dynamic XML Sitemap for Google Search Console & SEO
router.get("/sitemap.xml", async (req, res) => {
  try {
    const db = getDb();
    const [projects, courses] = await Promise.all([
      db.collection("projects").find({}, { projection: { slug: 1, updatedAt: 1 } }).toArray().catch(() => []),
      db.collection("courses").find({}, { projection: { slug: 1, id: 1, updatedAt: 1 } }).toArray().catch(() => [])
    ]);

    const baseUrl = "https://ashnexasystems.com";
    const staticPages = ["", "/about", "/projects", "/courses", "/services", "/contact", "/custom-project", "/infrastructure", "/help", "/verify"];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticPages.forEach(page => {
      xml += `  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    projects.forEach(p => {
      if (p.slug) {
        xml += `  <url>\n    <loc>${baseUrl}/projects/${p.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }
    });

    courses.forEach(c => {
      const slug = c.slug || c.id;
      if (slug) {
        xml += `  <url>\n    <loc>${baseUrl}/courses/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    logger.error("Sitemap generation error: " + err.message);
    res.status(500).send("Error generating sitemap");
  }
});

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
      "team",
      "tradingCourses",
      "courses",
      "courseCategories",
      "tradingCurriculum",
      "sessions",
      "tradingSessions",
      "settings",
      "tradingSettings",
      "certificates",
      "testimonials",
      "internshipCategories"
    ];

    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    
    if (!isPublic && !req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token required for this collection"
      });
    }

    const isEmployeeOrAdmin = req.user && ["admin", "employee"].includes(req.user.role);
    let filter = {};
    
    // Define private collections and their owner fields
    const privateCollections = PRIVATE_COLLECTION_OWNER_FIELD;

    if (req.user && !isEmployeeOrAdmin) {
      if (privateCollections[collection]) {
        const ownerField = privateCollections[collection];
        filter[ownerField] = req.user.uid;
      } else if (collection === "receipts") {
        const cleanedEmail = req.user.email ? req.user.email.trim() : "";
        filter.customerEmail = { $regex: new RegExp(`^${cleanedEmail}$`, 'i') };
      }
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

    res.json({ success: true, documents: formattedDocs, items: formattedDocs });
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
      return res.status(200).json({ success: true, document: null, message: "Document not found" });
    }

    const publicCollections = [
      "projects",
      "categories",
      "services",
      "employees",
      "team",
      "tradingCourses",
      "courses",
      "courseCategories",
      "tradingCurriculum",
      "sessions",
      "tradingSessions",
      "settings",
      "tradingSettings",
      "certificates",
      "testimonials",
      "internshipCategories"
    ];

    const isPublic = PUBLIC_COLLECTIONS.includes(collection);
    
    if (!isPublic && !req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token required for this collection"
      });
    }

    // Security check
    const isEmployeeOrAdmin = req.user && ["admin", "employee"].includes(req.user.role);
    const privateCollections = PRIVATE_COLLECTION_OWNER_FIELD;

    if (req.user && !isEmployeeOrAdmin) {
      if (privateCollections[collection]) {
        const ownerField = privateCollections[collection];
        if (doc[ownerField] !== req.user.uid) {
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
      } else if (collection === "receipts") {
        const docEmail = (doc.customerEmail || "").trim().toLowerCase();
        const userEmail = (req.user.email || "").trim().toLowerCase();
        if (docEmail !== userEmail) {
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
      }
    }

    res.json({
      success: true,
      document: {
        id: doc._id.toString(),
        ...doc,
        _id: doc._id.toString()
      },
      id: doc._id.toString(),
      _id: doc._id.toString(),
      ...doc
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
    const adminOnlyCollections = ADMIN_ONLY_WRITE_COLLECTIONS;
    
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
        const privateCollections = ["projects", "orders", "enrollments", "payments", "custom_requests", "sellRequests"];
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
    const adminOnlyCollections = ADMIN_ONLY_WRITE_COLLECTIONS;

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
        payments: "userId",
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
