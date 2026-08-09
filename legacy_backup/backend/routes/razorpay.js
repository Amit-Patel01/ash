const express = require("express");
const router = express.Router();
const {
  createOrder,
  createCourseOrder,
  verifyProjectPayment,
  verifyCoursePayment,
} = require("../controllers/razorpayController");
const { verifyFirebaseToken } = require("../middlewares/authMiddleware");

// POST /api/razorpay/create-order
router.post("/create-order", createOrder);

// POST /api/razorpay/create-course-order
router.post("/create-course-order", verifyFirebaseToken, createCourseOrder);

// POST /api/razorpay/verify-payment
router.post("/verify-payment", verifyProjectPayment);

// POST /api/razorpay/verify-course
router.post("/verify-course", verifyFirebaseToken, verifyCoursePayment);

module.exports = router;
