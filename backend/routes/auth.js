const express = require("express");
const router = express.Router();
const passport = require("../services/passport");
const {
  login,
  registerCustomer,
  submitAccountRequest,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  passportGoogleCallback,
} = require("../controllers/authController");


router.post("/login", login);
router.post("/register-customer", registerCustomer);
router.post("/account-requests", submitAccountRequest);
router.post("/forgot-password", forgotPassword);
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
