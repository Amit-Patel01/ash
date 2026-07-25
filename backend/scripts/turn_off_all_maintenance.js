require('dotenv').config();
const { MongoClient } = require('mongodb');

async function turnOffAllMaintenance() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');
    const settingsColl = db.collection('settings');

    const maintenanceDoc = {
      _id: "maintenance",
      id: "maintenance",
      isActive: false,       // OFF for Production / Deployed
      isActiveDev: false,   // OFF for Local Development
      message: "",
      updatedAt: new Date().toISOString()
    };

    const res = await settingsColl.replaceOne(
      { _id: "maintenance" },
      maintenanceDoc,
      { upsert: true }
    );

    console.log('Successfully turned OFF all maintenance mode:', res);

    const verified = await settingsColl.find({ _id: "maintenance" }).toArray();
    console.log('\n--- VERIFIED DOCUMENT IN DB ---');
    console.log(JSON.stringify(verified, null, 2));

  } catch (err) {
    console.error('Error turning off maintenance:', err);
  } finally {
    await client.close();
  }
}

turnOffAllMaintenance();
