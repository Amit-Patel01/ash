const { MongoClient } = require("mongodb");
require("dotenv").config({ path: __dirname + "/../.env" });

const sourceUri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
const targetUri = "mongodb+srv://Amitsolution_db:djJVMdx8nzY6mcZB@Ashnexa Systems.t8phtbl.mongodb.net/solutionhub?tls=true&tlsAllowInvalidCertificates=true";

async function migrate() {
  console.log("=== STARTING MONGODB DATABASE MIGRATION ===");
  console.log("Source URI:", sourceUri ? sourceUri.replace(/:[^:@]+@/, ":****@") : "Not defined");
  console.log("Target URI:", targetUri.replace(/:[^:@]+@/, ":****@"));

  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    await sourceClient.connect();
    await targetClient.connect();
    console.log("✅ Successfully connected to both Source and Target databases.");

    const sourceDb = sourceClient.db("solutionhub");
    const targetDb = targetClient.db("solutionhub");

    const sourceCollections = await sourceDb.listCollections().toArray();
    console.log(`\nFound ${sourceCollections.length} collections in source DB.`);

    let totalDocsMigrated = 0;
    let summary = [];

    for (const colInfo of sourceCollections) {
      const colName = colInfo.name;
      // Skip system collections
      if (colName.startsWith("system.")) continue;

      console.log(`\nMigrating collection: '${colName}'...`);
      const sourceCol = sourceDb.collection(colName);
      const targetCol = targetDb.collection(colName);

      const docs = await sourceCol.find({}).toArray();
      const count = docs.length;

      if (count > 0) {
        // Clear target collection first to avoid key conflicts on fresh migration
        await targetCol.deleteMany({});
        const insertResult = await targetCol.insertMany(docs);
        console.log(`  -> Inserted ${insertResult.insertedCount} / ${count} documents.`);
        totalDocsMigrated += insertResult.insertedCount;
      } else {
        console.log(`  -> Collection is empty (0 documents).`);
      }

      // Copy indexes if any custom indexes exist
      try {
        const indexes = await sourceCol.indexes();
        for (const idx of indexes) {
          if (idx.name === "_id_") continue; // skip default _id index
          delete idx.v;
          delete idx.ns;
          const { key, name, ...options } = idx;
          await targetCol.createIndex(key, { ...options, name });
          console.log(`  -> Recreated index: ${name}`);
        }
      } catch (idxErr) {
        console.warn(`  -> Warning copying indexes for ${colName}:`, idxErr.message);
      }

      const targetCount = await targetCol.countDocuments();
      const match = count === targetCount;
      console.log(`  -> Status: ${match ? "✅ MATCH" : "❌ MISMATCH"} (Source: ${count}, Target: ${targetCount})`);

      summary.push({
        collection: colName,
        sourceCount: count,
        targetCount: targetCount,
        status: match ? "OK" : "FAILED"
      });
    }

    console.log("\n================ MIGRATION SUMMARY ================");
    console.table(summary);
    console.log(`Total documents migrated: ${totalDocsMigrated}`);
    console.log("==================================================");

  } catch (err) {
    console.error("❌ Migration failed with error:", err);
    process.exit(1);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();
