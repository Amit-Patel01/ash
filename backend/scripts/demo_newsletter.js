/**
 * Demo Newsletter Test — send morning or evening edition right now
 * Usage: node demo_newsletter.js morning  OR  node demo_newsletter.js evening
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const session = process.argv[2] === 'morning' ? 'morning' : 'evening';

async function main() {
  const { connectDB } = require('../utils/mongo');
  await connectDB();
  const { runDailyNewsletter } = require('../services/aiAgents/scheduledTasks');
  console.log(`\n📬 Sending ${session === 'morning' ? '🌅 Morning' : '🌙 Evening'} Newsletter demo NOW...\n`);
  await runDailyNewsletter(session);
  console.log('\n✅ Done! Check inbox.');
  process.exit(0);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
