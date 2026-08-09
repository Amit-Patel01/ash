const { MongoClient } = require("mongodb");
const { logger } = require("../logger");

const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/solutionhub";

let client = null;
let dbInstance = null;

const connectDB = async () => {
  if (dbInstance) return dbInstance;
  try {
    client = new MongoClient(uri);
    await client.connect();
    
    // Extract database name from connection string
    let dbName = "solutionhub";
    try {
      const url = new URL(uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://") ? uri : `mongodb://${uri}`);
      dbName = url.pathname.replace(/^\//, "") || "solutionhub";
    } catch (e) {
      // Ignored, default to solutionhub
    }

    dbInstance = client.db(dbName);
    logger.info(`[MongoDB] Connected successfully to database: ${dbName}`);
    return dbInstance;
  } catch (error) {
    logger.error("[MongoDB] Connection failed:", error);
    throw error;
  }
};

const getDb = () => {
  if (!dbInstance) {
    throw new Error("[MongoDB] Database not initialized. Call connectDB first.");
  }
  return dbInstance;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    dbInstance = null;
    client = null;
    logger.info("[MongoDB] Connection closed");
  }
};

module.exports = { connectDB, getDb, closeDB };
