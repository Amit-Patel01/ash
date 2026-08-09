const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGODB_URI_ATLAS;
const NEW_PASSWORD = 'Admin@123';

MongoClient.connect(uri).then(async client => {
  const db = client.db('solutionhub');
  
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(NEW_PASSWORD, salt);
  
  const result = await db.collection('users').updateOne(
    { role: 'admin' },
    { $set: { passwordHash: hash, status: 'active' } }
  );
  
  console.log('Update result:', result.matchedCount, 'matched,', result.modifiedCount, 'modified');
  
  // Verify
  const adminUser = await db.collection('users').findOne({ role: 'admin' });
  const verify = await bcrypt.compare(NEW_PASSWORD, adminUser.passwordHash);
  console.log('Password verification:', verify ? 'SUCCESS ✓' : 'FAILED ✗');
  console.log('Admin email:', adminUser.email);
  console.log('Admin status:', adminUser.status);
  
  await client.close();
  console.log('Done! Admin login is now fixed.');
  console.log('Login with: Email:', adminUser.email, '| Password:', NEW_PASSWORD);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
