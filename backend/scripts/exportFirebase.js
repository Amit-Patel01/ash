const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

/**
 * ─── CONFIGURATION ──────────────────────────────────────────────────────────
 */
const EXPORT_DIR = path.join(__dirname, "..", "exports");
const CREDENTIALS_PATH = path.join(__dirname, "..", "credentials.json");

/**
 * Initialize Firebase
 */
if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error("\n❌ Error: credentials.json not found in backend directory.");
  console.error("Please download your Firebase Service Account private key JSON from Firebase Console:");
  console.error("Project Settings -> Service accounts -> Generate new private key");
  console.error("and save it to: " + CREDENTIALS_PATH);
  process.exit(1);
}

const serviceAccount = require(CREDENTIALS_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Ensure export directory exists
 */
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────
 */

/**
 * Recursively convert Firestore data to plain JSON
 * - Handles Timestamps
 * - Handles DocumentReferences
 */
const transformData = (data) => {
  if (!data) return data;

  if (data instanceof admin.firestore.Timestamp) {
    return data.toDate().toISOString();
  }

  if (data instanceof admin.firestore.DocumentReference) {
    return `ref:${data.path}`;
  }

  if (Array.isArray(data)) {
    return data.map(transformData);
  }

  if (typeof data === "object") {
    const transformed = {};
    for (const [key, value] of Object.entries(data)) {
      transformed[key] = transformData(value);
    }
    return transformed;
  }

  return data;
};

/**
 * Recursively fetch a collection and its sub-collections
 */
const exportCollection = async (collectionRef) => {
  const documents = [];
  const snapshot = await collectionRef.get();

  for (const doc of snapshot.docs) {
    const data = transformData(doc.data());
    const docExport = {
      _id: doc.id,
      ...data,
      _subCollections: {},
    };

    // Check for sub-collections
    const subCollections = await doc.ref.listCollections();
    for (const subCol of subCollections) {
      docExport._subCollections[subCol.id] = await exportCollection(subCol);
    }

    documents.push(docExport);
  }

  return documents;
};

/**
 * Fetch and export all Firebase Auth users
 */
const exportAuthUsers = async () => {
  console.log("👥 Exporting Firebase Auth users...");
  const users = [];
  let nextPageToken;
  
  try {
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      for (const userRecord of listUsersResult.users) {
        users.push({
          uid: userRecord.uid,
          email: userRecord.email || null,
          emailVerified: userRecord.emailVerified || false,
          displayName: userRecord.displayName || null,
          photoURL: userRecord.photoURL || null,
          phoneNumber: userRecord.phoneNumber || null,
          disabled: userRecord.disabled || false,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            lastRefreshTime: userRecord.metadata.lastRefreshTime || null,
          },
          customClaims: userRecord.customClaims || {},
          providerData: (userRecord.providerData || []).map(provider => ({
            providerId: provider.providerId,
            uid: provider.uid,
            displayName: provider.displayName || null,
            email: provider.email || null,
            phoneNumber: provider.phoneNumber || null,
            photoURL: provider.photoURL || null,
          })),
          passwordHash: userRecord.passwordHash || null,
          passwordSalt: userRecord.passwordSalt || null,
        });
      }
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    const filePath = path.join(EXPORT_DIR, "users_auth.json");
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    console.log(`✅ Saved ${users.length} Firebase Auth users to users_auth.json`);
  } catch (error) {
    console.error("❌ Failed to export Firebase Auth users:", error.message);
  }
};

/**
 * ─── MAIN EXECUTION ─────────────────────────────────────────────────────────
 */
const runExport = async () => {
  console.log("🚀 Starting Full Firebase Export (Firestore + Auth)...");
  console.log(`Project ID: ${serviceAccount.project_id}\n`);
  
  try {
    // 1. Export Firestore Collections
    const rootCollections = await db.listCollections();
    console.log(`Found ${rootCollections.length} root Firestore collections.\n`);

    for (const collection of rootCollections) {
      const colId = collection.id;
      console.log(`📦 Exporting collection: ${colId}...`);
      
      const data = await exportCollection(collection);
      const filePath = path.join(EXPORT_DIR, `${colId}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Saved ${data.length} documents to ${colId}.json`);
    }

    console.log("");

    // 2. Export Auth Users
    await exportAuthUsers();

    console.log("\n✨ Export complete! Your files are in the 'backend/exports' directory.");
  } catch (error) {
    console.error("\n❌ Export failed:", error.message);
  } finally {
    process.exit();
  }
};

runExport();
