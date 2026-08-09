require('dotenv').config();
const { MongoClient } = require('mongodb');

async function fixMaintenance() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');
    const settingsColl = db.collection('settings');

    // Delete all maintenance records
    const del1 = await settingsColl.deleteMany({ _id: "maintenance" });
    const del2 = await settingsColl.deleteMany({ id: "maintenance" });
    console.log(`Deleted old records: _id=maintenance (${del1.deletedCount}), id=maintenance (${del2.deletedCount})`);

    // Insert clean record with _id: "maintenance" and id: "maintenance"
    const insertRes = await settingsColl.insertOne({
      _id: "maintenance",
      id: "maintenance",
      isActive: false,
      isActiveDev: false,
      message: "",
      updatedAt: new Date().toISOString()
    });
    console.log('Inserted clean maintenance setting:', insertRes);

    // Verify
    const updatedDocs = await settingsColl.find({}).toArray();
    console.log('\n--- VERIFIED SETTINGS IN DB ---');
    console.log(JSON.stringify(updatedDocs, null, 2));

  } catch (err) {
    console.error('Error fixing maintenance:', err);
  } finally {
    await client.close();
  }
}

fixMaintenance();
