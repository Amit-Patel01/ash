require('dotenv').config();
const { MongoClient } = require('mongodb');

async function inspectTeam() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');

    const team = await db.collection('team').find({}).toArray();
    console.log(`\n=== TEAM COLLECTION (${team.length} records) ===`);
    team.forEach((t, i) => {
      console.log(`[${i+1}] Name: "${t.name}" | Email: "${t.email}" | Role: "${t.role || t.designation}"`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

inspectTeam();
