require('dotenv').config();
const { MongoClient } = require('mongodb');

async function setMaintenanceProdOnDevOff() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');
    const settingsColl = db.collection('settings');

    const maintenanceDoc = {
      _id: "maintenance",
      id: "maintenance",
      isActive: true,       // ON for Deployed / Production
      isActiveDev: false,   // OFF for Local Development
      message: "Website Under Maintenance\n\nWe are currently performing scheduled maintenance and improvements to enhance your experience.\n\nThe website will be available again shortly.\n\nThank you for your patience and understanding.\n\n— Team Ashnexa Systems",
      updatedAt: new Date().toISOString()
    };

    const res = await settingsColl.replaceOne(
      { _id: "maintenance" },
      maintenanceDoc,
      { upsert: true }
    );

    console.log('Successfully set Maintenance: Deployed=ON (isActive: true), Local Dev=OFF (isActiveDev: false):', res);

    const verified = await settingsColl.find({ _id: "maintenance" }).toArray();
    console.log('\n--- VERIFIED DOCUMENT IN DB ---');
    console.log(JSON.stringify(verified, null, 2));

  } catch (err) {
    console.error('Error setting maintenance:', err);
  } finally {
    await client.close();
  }
}

setMaintenanceProdOnDevOff();
