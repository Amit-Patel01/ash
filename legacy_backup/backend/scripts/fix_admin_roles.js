const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/../.env' });

const ATLAS_URI = process.env.MONGODB_URI_ATLAS;
const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solutionhub';

const ADMIN_EMAILS = [
  'support@amitsolutionhub.com',
  'amitpatel07029@gmail.com',
  'admin@company.com'
];

async function fixDb(uri, label) {
  if (!uri) return;
  console.log(`\n🔗 Connecting to ${label}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const usersCol = db.collection('users');

    for (const email of ADMIN_EMAILS) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await usersCol.findOne({ email: normalizedEmail });

      if (existing) {
        const updateResult = await usersCol.updateOne(
          { _id: existing._id },
          {
            $set: {
              role: 'admin',
              status: 'active',
              updatedAt: new Date()
            }
          }
        );
        console.log(`✅ Updated ${normalizedEmail} to role "admin":`, updateResult.modifiedCount ? 'MODIFIED' : 'ALREADY ADMIN');
      } else {
        console.log(`⚠️ User not found for ${normalizedEmail} in ${label}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error fixing ${label}:`, err.message);
  } finally {
    await client.close();
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  FIXING ADMIN USER ROLES IN DATABASE');
  console.log('═══════════════════════════════════════════════════');

  if (ATLAS_URI) await fixDb(ATLAS_URI, 'MongoDB ATLAS');
  if (LOCAL_URI) await fixDb(LOCAL_URI, 'MongoDB LOCAL');

  console.log('\n🎉 Admin user role update complete!');
}

main().catch(console.error);
