const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDb } = require("../utils/mongo");
const { logger } = require("../logger");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const {
  createManagedUser,
  createAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  createHttpError,
} = require("../services/userService");

const handleControllerError = (res, error, fallbackMessage) => {
  logger.error(error);
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || fallbackMessage,
    code: error.code || "internal_error",
  });
};

const registerCustomer = async (req, res) => {
  try {
    const user = await createManagedUser(
      {
        displayName: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role: "customer",
        status: "active",
        location: req.body.location,
      },
      {
        sendActivationEmail: true,
        activationFrom: "customer",
        requestIp: req.ip,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Your account has been created. Please reset your password to access your account.",
      user,
    });
  } catch (error) {
    return handleControllerError(res, error, "Unable to create the account.");
  }
};

const submitAccountRequest = async (req, res) => {
  try {
    const result = await createAccountRequest(req.body, { requestIp: req.ip });
    return res.json({
      success: true,
      message: result.message,
      alreadyExists: Boolean(result.alreadyExists),
      merged: Boolean(result.merged),
      request: result.request,
    });
  } catch (error) {
    return handleControllerError(res, error, "Unable to submit the account request.");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, from } = req.body;
    if (!email) {
      throw createHttpError(400, "Email is required.", "email_required");
    }

    const result = await requestPasswordReset({ email, from, requestIp: req.ip });
    return res.json({
      success: true,
      message: "A password reset link has been sent to your email address.",
      ...result,
    });
  } catch (error) {
    return handleControllerError(res, error, "Unable to process the password reset request.");
  }
};

const verifyPasswordResetToken = async (req, res) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      throw createHttpError(400, "Reset token is required.", "token_required");
    }

    const result = await verifyResetToken(token);
    return res.json({ success: true, ...result });
  } catch (error) {
    return handleControllerError(res, error, "Unable to verify the password reset link.");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      throw createHttpError(400, "Reset token is required.", "token_required");
    }
    if (!password) {
      throw createHttpError(400, "Password is required.", "password_required");
    }

    const result = await completePasswordReset({ token, newPassword: password });
    return res.json({
      success: true,
      message: "Your password has been updated successfully.",
      ...result,
    });
  } catch (error) {
    return handleControllerError(res, error, "Unable to reset the password.");
  }
};

const MAX_LOGIN_ATTEMPTS = 3;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required.", code: "missing_fields" });
    }

    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: "No account found with this email.", code: "invalid_email" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ success: false, message: "Your account is inactive. Please contact support.", code: "inactive" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ success: false, message: "Please reset your password to establish a local login.", code: "no_password" });
    }

    const attempts = user.loginAttempts || 0;
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      return res.status(401).json({ success: false, message: "Too many failed attempts. Please reset your password.", code: "forgot_password_required" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const newAttempts = attempts + 1;
      await db.collection("users").updateOne(
        { email: normalizedEmail },
        { $set: { loginAttempts: newAttempts, lastLoginAttempt: new Date() } }
      );
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        return res.status(401).json({ success: false, message: "Too many failed attempts. Please reset your password.", code: "forgot_password_required" });
      }
      return res.status(401).json({ success: false, message: "Incorrect password.", code: "invalid_password" });
    }

    await db.collection("users").updateOne(
      { email: normalizedEmail },
      { $set: { loginAttempts: 0, lastLoginAt: new Date() } }
    );

    const token = jwt.sign(
      {
        uid: user.uid || user._id.toString(),
        email: user.email,
        role: user.role || "customer",
        employeeId: user.employeeId || null,
        permissions: user.permissions || {}
      },
      process.env.JWT_SECRET || "your_jwt_secret_here",
      { expiresIn: "7d" }
    );

    const { passwordHash, ...userResponse } = user;
    userResponse.uid = user.uid || user._id.toString();

    return res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    logger.error("Login error:", error);
    return res.status(500).json({ success: false, message: "An error occurred during login.", code: "server_error" });
  }
};

// ─── Google OAuth with Passport ───────────────────────────────────────────────

const passportGoogleCallback = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }

  if (user.status && user.status !== "active") {
    return res.redirect(`${FRONTEND_URL}/login?error=account_inactive`);
  }

  const uid = user.uid || user._id?.toString();
  const token = jwt.sign(
    {
      uid,
      email: user.email,
      role: user.role || "customer",
      employeeId: user.employeeId || null,
      permissions: user.permissions || {},
    },
    process.env.JWT_SECRET || "your_jwt_secret_here",
    { expiresIn: "7d" }
  );

  return res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
};

module.exports = {
  login,
  registerCustomer,
  submitAccountRequest,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  passportGoogleCallback,
};
