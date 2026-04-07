const express = require("express");
const router = express.Router();
const {
  requestCertificate,
  updateCertificateStatus,
  verifyCertificate,
} = require("../controllers/certificateController");

// POST /api/certificates/request
router.post("/request", requestCertificate);

// PATCH /api/certificates/update-status
router.patch("/update-status", updateCertificateStatus);

// GET /api/certificates/verify/:certId
router.get("/verify/:certId", verifyCertificate);

module.exports = router;
