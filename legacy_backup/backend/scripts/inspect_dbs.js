const { MongoClient } = require("mongodb");
require("dotenv").config({ path: __dirname + "/../.env" });

const sourceUri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
const targetUri = "mongodb+srv://Amitsolution_db:djJVMdx8nzY6mcZB@amitsolutionhub.t8phtbl.mongodb.net/solutionhub";

async function inspect() {
  console.log("--- SOURCE DB ---");
  console.log("URI:", sourceUri ? sourceUri.replace(/:[^:@]+@/, ":****@") : "Not defined");
  const sourceClient = new MongoClient(sourceUri);
  try {
    await sourceClient.connect();
    const sourceDb = sourceClient.db("solutionhub");
    const cols = await sourceDb.listCollections().toArray();
    console.log(`Source DB connected. ${cols.length} collections found:`);
    for (const c of cols) {
      const count = await sourceDb.collection(c.name).countDocuments();
      console.log(`  - ${c.name}: ${count} documents`);
    }
  } catch (err) {
    console.error("Source DB error:", err.message);
  } finally {
    await sourceClient.close();
  }

  console.log("\n--- TARGET DB ---");
  console.log("URI:", targetUri.replace(/:[^:@]+@/, ":****@"));
  const targetClient = new MongoClient(targetUri);
  try {
    await targetClient.connect();
    const targetDb = targetClient.db("solutionhub");
    const cols = await targetDb.listCollections().toArray();
    console.log(`Target DB connected! ${cols.length} collections currently exist:`);
    for (const c of cols) {
      const count = await targetDb.collection(c.name).countDocuments();
      console.log(`  - ${c.name}: ${count} documents`);
    }
  } catch (err) {
    console.error("Target DB error:", err.message);
  } finally {
    await targetClient.close();
  }
}

inspect();
