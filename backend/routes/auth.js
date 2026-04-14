const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  submitAccountRequest,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
} = require("../controllers/authController");

router.post("/register-customer", registerCustomer);
router.post("/account-requests", submitAccountRequest);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyPasswordResetToken);
router.post("/reset-password", resetPassword);

module.exports = router;
