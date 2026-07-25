require('dotenv').config();
const { MongoClient } = require('mongodb');

async function findFiredEmployees() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');

    console.log('\n--- 1. TEAM COLLECTION ---');
    const team = await db.collection('team').find({}).toArray();
    team.forEach((t, i) => {
      console.log(`[team ${i+1}] Name: "${t.name}" | Email: "${t.email}" | Role: "${t.role || t.designation}"`);
    });

    console.log('\n--- 2. ACCOUNT REQUESTS (Employees) ---');
    const accReqs = await db.collection('accountRequests').find({}).toArray();
    accReqs.forEach((r, i) => {
      console.log(`[accReq ${i+1}] Name: "${r.name}" | Email: "${r.email}" | Role: "${r.role}" | Status: "${r.status}"`);
    });

    console.log('\n--- 3. REINSTATEMENT REQUESTS ---');
    const reinReqs = await db.collection('reinstatementRequests').find({}).toArray();
    reinReqs.forEach((r, i) => {
      console.log(`[reinstate ${i+1}] Name: "${r.name}" | Email: "${r.email}" | Status: "${r.status}"`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

findFiredEmployees();
