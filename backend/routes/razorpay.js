const express = require("express");
const router = express.Router();
const { createOrder, verifyProjectPayment } = require("../controllers/razorpayController");

// POST /api/razorpay/create-order
router.post("/create-order", createOrder);

// POST /api/razorpay/verify-payment
router.post("/verify-payment", verifyProjectPayment);

module.exports = router;
