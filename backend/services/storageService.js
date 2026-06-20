const path = require("path");
const fs = require("fs");
const { logger } = require("../logger");

/**
 * Upload a file to local uploads directory (replacing Firebase Storage)
 * @param {Object} file - Multer file object with .path and .originalname
 * @param {string} folder - Destination folder in storage (e.g. 'payments', 'team')
 * @returns {string} Public download URL relative path
 */
const uploadToFirebase = async (file, folder = "files") => {
  const ext = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const targetDir = path.join(__dirname, "..", "uploads", folder);

  // Ensure directories exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, fileName);

  // Copy file from temp upload path
  fs.copyFileSync(file.path, targetPath);

  // Clean up local temp file
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  const publicUrl = `/uploads/${folder}/${fileName}`;
  logger.info(`[Storage] Saved locally: ${publicUrl}`);

  return publicUrl;
};

module.exports = { uploadToFirebase };
