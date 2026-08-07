require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { MongoClient } = require('mongodb');

async function setMaintenanceDomainRestricted() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in environment');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');
    const settingsColl = db.collection('settings');

    const maintenanceDoc = {
      _id: "maintenance",
      id: "maintenance",
      isActive: true,               // Enable maintenance check
      isActiveDev: false,           // OFF for local dev
      onlyAllowedDomain: true,      // ONLY www.amitsolutionhub.com can run live app
      allowedDomains: ["www.amitsolutionhub.com", "amitsolutionhub.com"],
      message: "Website Under Maintenance\n\nWe are currently performing scheduled maintenance and updates to enhance system performance. Access is restricted to our primary domain www.amitsolutionhub.com.\n\nThank you for your understanding.\n\n— Team Amit Solution Hub",
      updatedAt: new Date().toISOString()
    };

    const res = await settingsColl.replaceOne(
      { _id: "maintenance" },
      maintenanceDoc,
      { upsert: true }
    );

    console.log('Successfully updated Maintenance setting in MongoDB:', res);

    const verified = await settingsColl.find({ _id: "maintenance" }).toArray();
    console.log('\n--- VERIFIED DB SETTING ---');
    console.log(JSON.stringify(verified, null, 2));

  } catch (err) {
    console.error('Error setting maintenance mode in MongoDB:', err);
  } finally {
    await client.close();
  }
}

setMaintenanceDomainRestricted();
