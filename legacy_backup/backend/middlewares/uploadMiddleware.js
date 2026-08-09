const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const makeStorage = (folder, prefix = "") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(uploadsDir, folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

const imageFilter = (req, file, cb) => {
  const ext = /\.(jpeg|jpg|png|webp)$/i.test(path.extname(file.originalname));
  const mime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  cb(ext && mime ? null : new Error("Only JPG, PNG, and WebP images are allowed"), ext && mime);
};

// Configured uploaders
const uploadPayment = multer({ 
  storage: makeStorage("payments"), 
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: imageFilter 
});

const uploadTeam = multer({ 
  storage: makeStorage("team", "team-"), 
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: imageFilter 
});

const uploadProject = multer({ 
  storage: makeStorage("projects", "project-"), 
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: imageFilter 
});

const uploadBroadcast = multer({ 
  storage: makeStorage("broadcasts", "broadcast-"), 
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: imageFilter 
});

const uploadCertificateAsset = multer({
  storage: makeStorage("certificates", "cert-asset-"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadChat = multer({
  storage: makeStorage("chat", "chat-"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = /\.(jpeg|jpg|png|webp|gif)$/i.test(path.extname(file.originalname));
    const mime = [...ALLOWED_MIME_TYPES, "image/gif"].includes(file.mimetype);
    cb(ext && mime ? null : new Error("Only JPG, PNG, GIF, and WebP images are allowed"), ext && mime);
  },
});

module.exports = {
  uploadPayment,
  uploadTeam,
  uploadProject,
  uploadBroadcast,
  uploadCertificateAsset,
  uploadChat,
  ALLOWED_MIME_TYPES,
  imageFilter
};
