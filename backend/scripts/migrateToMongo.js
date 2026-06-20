require("dotenv").config();
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

/**
 * ─── CONFIGURATION ──────────────────────────────────────────────────────────
 */
const EXPORTS_DIR = path.join(__dirname, "..", "exports");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/solutionhub";

// Extract database name from connection string
const getDbName = (uri) => {
  try {
    // Handle standard mongodb URIs
    const cleanUri = uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://") ? uri : `mongodb://${uri}`;
    const url = new URL(cleanUri);
    return url.pathname.replace(/^\//, "") || "solutionhub";
  } catch (error) {
    return "solutionhub";
  }
};

const DB_NAME = getDbName(MONGODB_URI);

// Regular expression to match ISO 8601 Date strings (e.g., 2026-04-15T09:26:52.888Z)
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

/**
 * ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────
 */

/**
 * Recursively clean and transform documents:
 * - Converts ISO date strings to native JavaScript Date objects
 * - Maps firestore document IDs (_id) correctly
 */
const transformDocument = (doc) => {
  if (doc === null || doc === undefined) return doc;

  // If it's an ISO date string, convert it to a Date object
  if (typeof doc === "string" && ISO_DATE_REGEX.test(doc)) {
    return new Date(doc);
  }

  // If it's an array, recursively transform each element
  if (Array.isArray(doc)) {
    return doc.map(transformDocument);
  }

  // If it's an object, recursively transform its keys and values
  if (typeof doc === "object") {
    const transformed = {};
    for (const [key, value] of Object.entries(doc)) {
      transformed[key] = transformDocument(value);
    }
    return transformed;
  }

  return doc;
};

/**
 * ─── MAIN EXECUTION ─────────────────────────────────────────────────────────
 */
const runMigration = async () => {
  console.log("🚀 Starting MongoDB Migration...");
  console.log(`Connecting to: ${MONGODB_URI}`);
  console.log(`Target Database: ${DB_NAME}\n`);

  if (!fs.existsSync(EXPORTS_DIR)) {
    console.error(`❌ Exports directory not found at: ${EXPORTS_DIR}`);
    console.error("Please export Firebase data first or make sure backend/exports/ exists.");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("🔌 Connected successfully to MongoDB server.");
    const db = client.db(DB_NAME);

    // List all json files in the exports folder
    const files = fs.readdirSync(EXPORTS_DIR).filter(file => file.endsWith(".json"));
    console.log(`Found ${files.length} collections to import.\n`);

    if (files.length === 0) {
      console.warn("⚠️ No JSON export files found. Nothing to import.");
      return;
    }

    for (const file of files) {
      const collectionName = path.basename(file, ".json");
      const filePath = path.join(EXPORTS_DIR, file);

      console.log(`📦 Importing: ${file} into collection: ${collectionName}...`);

      const fileContent = fs.readFileSync(filePath, "utf8");
      let documents = [];

      try {
        documents = JSON.parse(fileContent);
      } catch (err) {
        console.error(`❌ Error parsing JSON from file: ${file}`, err.message);
        continue;
      }

      if (!Array.isArray(documents)) {
        console.warn(`⚠️ File ${file} does not contain a JSON array of documents. Skipping.`);
        continue;
      }

      if (documents.length === 0) {
        console.log(`ℹ️ Collection ${collectionName} is empty. Skipping.`);
        continue;
      }

      // Drop/Clear the existing collection
      const collection = db.collection(collectionName);
      await collection.deleteMany({});

      // Transform data (convert dates, references, etc.)
      const transformedDocs = documents.map(doc => transformDocument(doc));

      // Insert documents in bulk
      const result = await collection.insertMany(transformedDocs);
      console.log(`✅ Saved ${result.insertedCount} documents to collection: ${collectionName}\n`);
    }

    console.log("✨ MongoDB Migration complete! All data successfully transferred.");
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
  } finally {
    await client.close();
    process.exit();
  }
};

runMigration();
