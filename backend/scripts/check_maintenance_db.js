require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkMaintenance() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');
    const settings = await db.collection('settings').find({}).toArray();
    console.log('\n--- ALL SETTINGS IN DB ---');
    console.log(JSON.stringify(settings, null, 2));

    // Force update maintenance setting to FALSE
    const res = await db.collection('settings').deleteMany({ id: 'maintenance' });
    console.log('Deleted old maintenance docs:', res);

    const newRes = await db.collection('settings').insertOne({
      id: 'maintenance',
      isActive: false,
      isActiveDev: false,
      message: '',
      updatedAt: new Date().toISOString()
    });
    console.log('Inserted fresh maintenance doc with isActive=false:', newRes);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkMaintenance();
