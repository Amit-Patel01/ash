require('dotenv').config();
const { MongoClient } = require('mongodb');

async function disableMaintenance() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');
    const settingsColl = db.collection('settings');

    const result = await settingsColl.updateOne(
      { id: 'maintenance' },
      { $set: { id: 'maintenance', isActive: false, isActiveDev: false, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    console.log('Maintenance mode disabled in database:', result);
  } catch (err) {
    console.error('Error disabling maintenance:', err);
  } finally {
    await client.close();
  }
}

disableMaintenance();
