const express = require("express");
const router = express.Router();
const passport = require("../services/passport");
const rateLimit = require("express-rate-limit");
const {
  login,
  registerCustomer,
  submitAccountRequest,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  passportGoogleCallback,
} = require("../controllers/authController");

// Strict rate limiter for auth-sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes.", code: "rate_limit_exceeded" },
});

router.post("/login", authLimiter, login);
router.post("/register-customer", registerCustomer);
router.post("/register-student", registerCustomer);
router.post("/account-requests", submitAccountRequest);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/verify-reset-token", verifyPasswordResetToken);
router.post("/reset-password", resetPassword);


// Google OAuth with Passport
router.get("/google",
  passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_denied` }),
  passportGoogleCallback
);


module.exports = router;
