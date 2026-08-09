require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { connectDB, closeDB } = require("../utils/mongo");

// Collections confirmed NOT used in any backend route/service
const UNUSED_COLLECTIONS = [
  "users_auth",          // No reference in any service/route
  "employeePermissions", // No reference found
  "custom_requests",     // No reference found
  "sellRequests",        // Only in generic db.js admin route
  "tradingCourses",      // Only in generic db.js admin route
  "tradingCurriculum",   // Only in generic db.js admin route
  "tradingSettings",     // Only in generic db.js admin route
  "courseCategories",    // Only in generic db.js admin route
  "messages",            // Standalone - messages are subcollection inside chats
];

const EXPORTS_DIR = path.join(__dirname, "../exports");

async function cleanup() {
  console.log("🧹 Starting cleanup of unused collections...\n");

  let db;
  try {
    db = await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }

  try {
    for (const colName of UNUSED_COLLECTIONS) {
      // Drop from MongoDB
      try {
        const collections = await db.listCollections({ name: colName }).toArray();
        if (collections.length > 0) {
          await db.collection(colName).drop();
          console.log(`✅ Dropped MongoDB collection: '${colName}'`);
        } else {
          console.log(`⚠️  Collection '${colName}' not found in DB (skipped)`);
        }
      } catch (err) {
        console.log(`⚠️  Could not drop '${colName}': ${err.message}`);
      }

      // Delete export file
      const filePath = path.join(EXPORTS_DIR, `${colName}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted export file: exports/${colName}.json`);
      } else {
        console.log(`⚠️  Export file not found: exports/${colName}.json (skipped)`);
      }
    }

    console.log("\n✅ Cleanup complete!");
    console.log(`\nRemoved ${UNUSED_COLLECTIONS.length} unused collections.`);
  } catch (err) {
    console.error("Cleanup error:", err);
  } finally {
    await closeDB();
  }
}

cleanup();
