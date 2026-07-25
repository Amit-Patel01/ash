require('dotenv').config();
const { MongoClient } = require('mongodb');

async function inspectAll() {
  const uri = process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('solutionhub');

    console.log('\n--- ALL USERS IN DB ---');
    const users = await db.collection('users').find({}).toArray();
    users.forEach((u, i) => {
      console.log(`[users ${i+1}] ${u.displayName || u.name || 'N/A'} <${u.email}> (Role: ${u.role})`);
    });

    console.log('\n--- ACCOUNT REQUESTS ---');
    const accReqs = await db.collection('accountRequests').find({}).toArray();
    accReqs.forEach((r, i) => {
      console.log(`[accReq ${i+1}] ${r.name || 'N/A'} <${r.email}> (Status: ${r.status}, Role: ${r.role})`);
    });

    console.log('\n--- REINSTATEMENT REQUESTS ---');
    const reinReqs = await db.collection('reinstatementRequests').find({}).toArray();
    reinReqs.forEach((r, i) => {
      console.log(`[reinstate ${i+1}] ${r.name || 'N/A'} <${r.email}> (Status: ${r.status})`);
    });

    console.log('\n--- TEAM COLLECTION ---');
    const team = await db.collection('team').find({}).toArray();
    team.forEach((t, i) => {
      console.log(`[team ${i+1}] ${t.name} <${t.email}> (Role: ${t.role || t.designation})`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

inspectAll();
