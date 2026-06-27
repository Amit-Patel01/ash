const express = require("express");
const router = express.Router();
const {
  login,
  registerCustomer,
  submitAccountRequest,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  googleAuthRedirect,
  googleAuthCallback,
} = require("../controllers/authController");


router.post("/login", login);
router.post("/register-customer", registerCustomer);
router.post("/account-requests", submitAccountRequest);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyPasswordResetToken);
router.post("/reset-password", resetPassword);

// Google OAuth
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);


module.exports = router;
