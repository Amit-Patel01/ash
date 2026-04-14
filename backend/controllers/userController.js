const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  getOwnProfile,
  updateOwnProfile,
  uploadEmployeeCv,
  requestPasswordReset,
  createHttpError,
} = require("../services/userService");
const { logger } = require("../logger");

const CV_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "cv");
if (!fs.existsSync(CV_UPLOAD_DIR)) {
  fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true });
}

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CV_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, safeName);
  },
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = /\.(pdf|doc|docx)$/i.test(path.extname(file.originalname));
    const allowedMimeType = allowedMimeTypes.includes(file.mimetype);
    cb(allowedExtensions && allowedMimeType ? null : new Error("Only PDF, DOC, and DOCX files are allowed."), allowedExtensions && allowedMimeType);
  },
});

const handleError = (res, error, fallbackMessage) => {
  logger.error(error);
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || fallbackMessage,
    code: error.code || "internal_error",
  });
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await getOwnProfile(req.user.uid);
    return res.json({ success: true, profile });
  } catch (error) {
    return handleError(res, error, "Unable to load the profile.");
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const profile = await updateOwnProfile(req.user.uid, req.body || {});
    return res.json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    return handleError(res, error, "Unable to update the profile.");
  }
};

const sendMyPasswordReset = async (req, res) => {
  try {
    const result = await requestPasswordReset({
      email: req.user.email,
      from: req.body?.from || req.user.role || "customer",
      requestIp: req.ip,
    });
    return res.json({
      success: true,
      message: "A password reset link has been sent to your email address.",
      ...result,
    });
  } catch (error) {
    return handleError(res, error, "Unable to send the password reset email.");
  }
};

const uploadMyCv = async (req, res) => {
  try {
    if (!req.file) {
      throw createHttpError(400, "A CV file is required.", "cv_required");
    }

    const profile = await uploadEmployeeCv(req.user.uid, req.file);
    return res.json({
      success: true,
      message: "CV uploaded successfully.",
      profile,
    });
  } catch (error) {
    return handleError(res, error, "Unable to upload the CV.");
  }
};

module.exports = {
  cvUpload,
  getMyProfile,
  updateMyProfile,
  sendMyPasswordReset,
  uploadMyCv,
};
