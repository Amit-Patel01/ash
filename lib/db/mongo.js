import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/solutionhub";

let client;
let clientPromise;

if (!process.env.MONGODB_URI_ATLAS && !process.env.MONGODB_URI) {
  console.warn("Please add your Mongo URI to .env.local");
}

function getDatabaseName(connectionString) {
  try {
    // Extract database name from connection string like mongodb+srv://user:pass@host/dbname?query
    const match = connectionString.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?#]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {
    // fallback
  }
  return "solutionhub";
}

const dbName = getDatabaseName(uri);

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
