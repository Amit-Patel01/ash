require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { connectDB, closeDB } = require("../utils/mongo");
const { ObjectId } = require("mongodb");

const EXPORTS_DIR = path.join(__dirname, "../exports");

// Helper to recursively parse and convert date strings to BSON Date objects
function cleanDocument(doc) {
  if (!doc || typeof doc !== "object") return doc;

  const cleaned = Array.isArray(doc) ? [] : {};
  
  for (const [key, value] of Object.entries(doc)) {
    if (value && typeof value === "object") {
      cleaned[key] = cleanDocument(value);
    } else if (typeof value === "string") {
      // Check if it's an ISO date string
      const isDateKey = /at$/i.test(key) || /date/i.test(key) || key === "timestamp";
      const isIsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
      
      if (isDateKey || isIsoDate) {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          cleaned[key] = parsedDate;
          continue;
        }
      }
      
      cleaned[key] = value;
    } else {
      cleaned[key] = value;
    }
  }

  // Convert 24-char hex strings in _id to proper BSON ObjectId
  if (cleaned._id) {
    if (typeof cleaned._id === "string" && cleaned._id.length === 24 && /^[0-9a-fA-F]{24}$/.test(cleaned._id)) {
      cleaned._id = new ObjectId(cleaned._id);
    } else if (cleaned._id.$oid) {
      cleaned._id = new ObjectId(cleaned._id.$oid);
    }
  }

  return cleaned;
}

async function runMigration() {
  console.log("Starting data migration/import to MongoDB...");
  
  let db;
  try {
    db = await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB. Make sure your URI is correct.", error);
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(EXPORTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith(".json"));
    
    console.log(`Found ${jsonFiles.length} JSON collection files in exports/`);

    for (const file of jsonFiles) {
      const collectionName = path.basename(file, ".json");
      const filePath = path.join(EXPORTS_DIR, file);
      
      console.log(`Processing file: ${file} -> collection: ${collectionName}...`);
      
      const fileData = fs.readFileSync(filePath, "utf8");
      let documents = JSON.parse(fileData);
      
      if (!Array.isArray(documents)) {
        // If it's a single object, wrap it in an array
        documents = [documents];
      }

      if (documents.length === 0) {
        console.log(`Collection ${collectionName} has 0 records. Skipping.`);
        continue;
      }

      const cleanedDocs = documents.map(doc => cleanDocument(doc));

      // Clear existing records in collection
      await db.collection(collectionName).deleteMany({});
      
      // Perform bulk insert
      const result = await db.collection(collectionName).insertMany(cleanedDocs);
      console.log(` Successfully imported ${result.insertedCount} documents into '${collectionName}'`);
    }

    console.log("\n All collections imported successfully!");
  } catch (err) {
    console.error("Migration error occurred:", err);
  } finally {
    await closeDB();
  }
}

runMigration();
