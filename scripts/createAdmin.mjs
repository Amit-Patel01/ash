/**
 * Admin Account Creator — Ashnexa Systems
 * Run: node scripts/createAdmin.mjs
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb://127.0.0.1:27017/ashnexasystems';

const ADMIN = {
  displayName: 'Admin',
  email: 'admin@ashnexasystems.com',
  password: 'Ashnexa@2026',
  role: 'admin',
};

async function createAdmin() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to local MongoDB');

    const db = client.db('ashnexasystems');
    const users = db.collection('users');

    // Check if admin already exists
    const existing = await users.findOne({ email: ADMIN.email });
    if (existing) {
      console.log(`⚠️  Admin already exists: ${ADMIN.email}`);
      console.log(`   Role: ${existing.role}`);
      
      // Update role to admin if not already
      if (existing.role !== 'admin') {
        await users.updateOne({ email: ADMIN.email }, { $set: { role: 'admin' } });
        console.log('✅ Role updated to admin');
      }
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN.password, 12);

    // Create admin document
    const adminDoc = {
      displayName: ADMIN.displayName,
      email: ADMIN.email,
      password: hashedPassword,
      role: 'admin',
      provider: 'local',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(adminDoc);
    console.log('\n🎉 Admin account created successfully!');
    console.log('─────────────────────────────────');
    console.log(`   Email    : ${ADMIN.email}`);
    console.log(`   Password : ${ADMIN.password}`);
    console.log(`   Role     : admin`);
    console.log(`   ID       : ${result.insertedId}`);
    console.log('─────────────────────────────────');
    console.log('\n👉 Now login at: http://localhost:3000/login\n');

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('\n❌ MongoDB local nahi chal raha!');
      console.error('   MongoDB start karo pehle:');
      console.error('   mongod --dbpath C:/data/db\n');
    } else {
      console.error('❌ Error:', err.message);
    }
  } finally {
    await client.close();
  }
}

createAdmin();
