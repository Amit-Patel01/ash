const express = require("express");
const router = express.Router();
const { forgotPassword } = require("../controllers/authController");

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

module.exports = router;
