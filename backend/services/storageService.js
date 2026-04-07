const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const { logger } = require("../logger");

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - Multer file object with .path and .originalname
 * @param {string} folder - Destination folder in storage (e.g. 'payments', 'team')
 * @returns {string} Public download URL
 */
const uploadToFirebase = async (file, folder = "uploads") => {
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!storageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET is not configured in .env");
  }

  const bucket = admin.storage().bucket(storageBucket);
  const ext = path.extname(file.originalname);
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  await bucket.upload(file.path, {
    destination: fileName,
    metadata: {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  // Make public and get URL
  const fileRef = bucket.file(fileName);
  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${storageBucket}/${fileName}`;

  // Clean up local temp file
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  logger.info(`[Storage] Uploaded: ${fileName}`);
  return publicUrl;
};

module.exports = { uploadToFirebase };
