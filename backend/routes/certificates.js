const express = require("express");
const router = express.Router();
const {
  requestCertificate,
  updateCertificateStatus,
  verifyCertificate,
  createQrCertificate,
  updateQrCertificate,
  updateQrCertificateStatus,
  removeQrCertificate,
} = require("../controllers/certificateController");
const { verifyFirebaseToken } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/rbacMiddleware");

const { uploadCertificateAsset } = require("../middlewares/uploadMiddleware");

// POST /api/certificates/request
router.post("/request", requestCertificate);

// PATCH /api/certificates/update-status
router.patch("/update-status", updateCertificateStatus);

// QR certificate admin routes
router.post("/qr", verifyFirebaseToken, adminOnly, uploadCertificateAsset.single("signatureImage"), createQrCertificate);
router.patch("/qr/:docId", verifyFirebaseToken, adminOnly, uploadCertificateAsset.single("signatureImage"), updateQrCertificate);
router.patch("/qr/:docId/status", verifyFirebaseToken, adminOnly, updateQrCertificateStatus);
router.delete("/qr/:docId", verifyFirebaseToken, adminOnly, removeQrCertificate);

// GET /api/certificates/verify/:certId(*)
router.get("/verify/:certId(*)", verifyCertificate);

module.exports = router;
