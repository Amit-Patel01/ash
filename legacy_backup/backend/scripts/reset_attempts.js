const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI_ATLAS;

MongoClient.connect(uri).then(async client => {
  const db = client.db('solutionhub');
  
  // Reset loginAttempts to 0 for all users
  const result = await db.collection('users').updateMany(
    {},
    { $set: { loginAttempts: 0 } }
  );
  
  console.log('Update result:', result.matchedCount, 'matched,', result.modifiedCount, 'modified');
  
  await client.close();
  console.log('Done! All users loginAttempts have been reset to 0.');
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
