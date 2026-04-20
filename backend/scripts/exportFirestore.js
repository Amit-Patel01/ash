const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

/**
 * ─── CONFIGURATION ──────────────────────────────────────────────────────────
 */
const EXPORT_DIR = path.join(__dirname, "..", "exports");
const CREDENTIALS_PATH = path.join(__dirname, "..", "credentials.json");

/**
 * Initialize Firebase
 */
if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error("Error: credentials.json not found in backend directory.");
  process.exit(1);
}

const serviceAccount = require(CREDENTIALS_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────
 */

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Recursively convert Firestore data to plain JSON
 * - Handles Timestamps
 * - Handles DocumentReferences
 */
const transformData = (data) => {
  if (!data) return data;

  if (data instanceof admin.firestore.Timestamp) {
    return data.toDate().toISOString();
  }

  if (data instanceof admin.firestore.DocumentReference) {
    return `ref:${data.path}`;
  }

  if (Array.isArray(data)) {
    return data.map(transformData);
  }

  if (typeof data === "object") {
    const transformed = {};
    for (const [key, value] of Object.entries(data)) {
      transformed[key] = transformData(value);
    }
    return transformed;
  }

  return data;
};

/**
 * Recursively fetch a collection and its sub-collections
 */
const exportCollection = async (collectionRef) => {
  const documents = [];
  const snapshot = await collectionRef.get();

  for (const doc of snapshot.docs) {
    const data = transformData(doc.data());
    const docExport = {
      _id: doc.id,
      ...data,
      _subCollections: {},
    };

    // Check for sub-collections
    const subCollections = await doc.ref.listCollections();
    for (const subCol of subCollections) {
      docExport._subCollections[subCol.id] = await exportCollection(subCol);
    }

    documents.push(docExport);
  }

  return documents;
};

/**
 * ─── MAIN EXECUTION ─────────────────────────────────────────────────────────
 */
const runExport = async () => {
  console.log("🚀 Starting Firestore Export...");
  
  try {
    const rootCollections = await db.listCollections();
    console.log(`Found ${rootCollections.length} root collections.\n`);

    for (const collection of rootCollections) {
      const colId = collection.id;
      console.log(`📦 Exporting collection: ${colId}...`);
      
      const data = await exportCollection(collection);
      const filePath = path.join(EXPORT_DIR, `${colId}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Saved ${data.length} documents to ${colId}.json`);
    }

    console.log("\n✨ Export complete! Your files are in the 'backend/exports' directory.");
  } catch (error) {
    console.error("\n❌ Export failed:", error.message);
  } finally {
    process.exit();
  }
};

runExport();
