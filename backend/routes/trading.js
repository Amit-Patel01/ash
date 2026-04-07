const express = require("express");
const router = express.Router();
const { verifyPayment, sendEnrollmentEmail, toggleLive } = require("../controllers/tradingController");

// POST /api/trading/verify-payment
router.post("/verify-payment", verifyPayment);

// POST /api/trading/enrollment-email
router.post("/enrollment-email", sendEnrollmentEmail);

// POST /api/trading/toggle-live
router.post("/toggle-live", toggleLive);

module.exports = router;
