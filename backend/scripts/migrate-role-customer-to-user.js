/**
 * Migration: role "customer" → "user" in MongoDB Atlas
 * 
 * - Sirf "customer" role wale users update honge
 * - "employee", "admin", "mentor", "student" unchanged rahenge
 * - Dono collections update honge: users + accountRequests (agar koi ho)
 * 
 * Run: node scripts/migrate-role-customer-to-user.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { MongoClient } = require('mongodb')

const ATLAS_URI = process.env.MONGODB_URI_ATLAS
const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solutionhub'

async function migrate(uri, label) {
  console.log(`\n🔗 Connecting to ${label}...`)
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()

    console.log(`✅ Connected to DB: ${db.databaseName}`)

    // ── 1. users collection ──────────────────────────────────────────────────
    const usersCol = db.collection('users')

    // Pehle count karo kitne update honge
    const toUpdateCount = await usersCol.countDocuments({ role: 'customer' })
    console.log(`\n📊 [users] Found ${toUpdateCount} documents with role "customer"`)

    if (toUpdateCount > 0) {
      // Preview: kaun kaun update hoga
      const preview = await usersCol
        .find({ role: 'customer' }, { projection: { _id: 1, email: 1, displayName: 1, role: 1 } })
        .limit(20)
        .toArray()

      console.log('\n👥 Users to be updated (max 20 shown):')
      preview.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} | ${u.displayName || 'N/A'} | role: ${u.role}`)
      })

      // Update karo
      const result = await usersCol.updateMany(
        { role: 'customer' },
        {
          $set: {
            role: 'user',
            updatedAt: new Date()
          }
        }
      )

      console.log(`\n✅ [users] Updated: ${result.modifiedCount} documents  (role: "customer" → "user")`)
    } else {
      console.log('   ℹ️  No "customer" role users found — nothing to update.')
    }

    // ── 2. accountRequests collection (agar koi pending requests hain) ────────
    const arCol = db.collection('accountRequests')
    const arCount = await arCol.countDocuments({ role: 'customer' })

    if (arCount > 0) {
      const arResult = await arCol.updateMany(
        { role: 'customer' },
        { $set: { role: 'user', updatedAt: new Date() } }
      )
      console.log(`✅ [accountRequests] Updated: ${arResult.modifiedCount} documents`)
    } else {
      console.log('   ℹ️  [accountRequests] No "customer" role entries found.')
    }

    // ── 3. passwordResetTokens collection (role field agar stored ho) ─────────
    const prtCol = db.collection('passwordResetTokens')
    const prtCount = await prtCol.countDocuments({ role: 'customer' })
    if (prtCount > 0) {
      const prtResult = await prtCol.updateMany(
        { role: 'customer' },
        { $set: { role: 'user' } }
      )
      console.log(`✅ [passwordResetTokens] Updated: ${prtResult.modifiedCount} documents`)
    }

    // ── Final verify ────────────────────────────────────────────────────────
    const remaining = await usersCol.countDocuments({ role: 'customer' })
    const newUserCount = await usersCol.countDocuments({ role: 'user' })
    console.log(`\n📈 Final Status in [${label}]:`)
    console.log(`   role "customer" remaining : ${remaining}`)
    console.log(`   role "user"     total now : ${newUserCount}`)

  } catch (err) {
    console.error(`❌ Error on ${label}:`, err.message)
  } finally {
    await client.close()
    console.log(`🔌 Disconnected from ${label}\n`)
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  MIGRATION: role "customer" → "user"')
  console.log('  Employee / Admin / Mentor roles UNCHANGED')
  console.log('═══════════════════════════════════════════════════')

  // Atlas
  if (ATLAS_URI) {
    await migrate(ATLAS_URI, 'MongoDB ATLAS')
  } else {
    console.warn('⚠️  MONGODB_URI_ATLAS not set in .env — skipping Atlas.')
  }

  // Local (agar local DB bhi use ho raha ho)
  const localUri = process.env.MONGODB_URI
  if (localUri) {
    await migrate(localUri, 'MongoDB LOCAL')
  } else {
    console.log('ℹ️  MONGODB_URI not set — skipping local DB.')
  }

  console.log('\n🎉 Migration complete!')
}

main().catch(console.error)
