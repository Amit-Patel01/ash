const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }
  const realIp = req.headers["x-real-ip"];
  if (realIp) return realIp.trim();
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) return cfIp.trim();
  let ip = req.socket?.remoteAddress || req.ip || "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required.", code: "credentials_required" });
    }

    const db = getDb();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password.", code: "user_not_found" });
    }

    if (user.status === "terminated" || user.isTerminated) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated. Please contact support.", code: "account_terminated" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ success: false, message: "Please reset your password to establish a local login.", code: "no_password" });
    }

    const attempts = user.loginAttempts || 0;
    const lastAttempt = user.lastLoginAttempt ? new Date(user.lastLoginAttempt) : null;
    const cooldownMs = 15 * 60 * 1000;
    if (attempts >= MAX_LOGIN_ATTEMPTS && lastAttempt && (Date.now() - lastAttempt.getTime() < cooldownMs)) {
      const remainingSec = Math.ceil((cooldownMs - (Date.now() - lastAttempt.getTime())) / 1000);
      return res.status(429).json({ success: false, message: `Account temporarily locked due to failed attempts. Try again in ${remainingSec}s.`, code: "account_locked" });
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

    const ADMIN_EMAILS = [
      (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
      "support@Ashnexa Systems.com",
      "amitpatel07029@gmail.com"
    ].filter(Boolean);

    let userRole = user.role || "customer";
    if (ADMIN_EMAILS.includes(normalizedEmail)) {
      userRole = "admin";
      if (user.role !== "admin") {
        await db.collection("users").updateOne(
          { email: normalizedEmail },
          { $set: { role: "admin", updatedAt: new Date() } }
        );
      }
    }

    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "Unknown Device";
    const sessionId = crypto.randomUUID();

    await db.collection("users").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          loginAttempts: 0,
          lastLoginAt: new Date().toISOString(),
          lastLoginIp: clientIp,
          lastLoginDevice: userAgent,
          currentSessionId: sessionId
        }
      }
    );

    const token = jwt.sign(
      {
        uid: user.uid || user._id.toString(),
        email: user.email,
        role: userRole,
        employeeId: user.employeeId || null,
        permissions: user.permissions || {},
        sessionId: sessionId
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { passwordHash, ...userResponse } = user;
    userResponse.uid = user.uid || user._id.toString();
    userResponse.role = userRole;
    userResponse.lastLoginIp = clientIp;
    userResponse.lastLoginDevice = userAgent;
    userResponse.lastLoginAt = new Date().toISOString();
    userResponse.currentSessionId = sessionId;

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

const passportGoogleCallback = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }

  if (user.status && user.status !== "active") {
    return res.redirect(`${FRONTEND_URL}/login?error=account_inactive`);
  }

  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "Unknown Device";
  const sessionId = crypto.randomUUID();
  const uid = user.uid || user._id?.toString();

  try {
    const db = getDb();
    await db.collection("users").updateOne(
      { $or: [{ uid }, { email: user.email }] },
      {
        $set: {
          lastLoginAt: new Date().toISOString(),
          lastLoginIp: clientIp,
          lastLoginDevice: userAgent,
          currentSessionId: sessionId
        }
      }
    );
  } catch (err) {
    logger.warn(`Failed to update session info on Google callback: ${err.message}`);
  }

  const token = jwt.sign(
    {
      uid,
      email: user.email,
      role: user.role || "customer",
      employeeId: user.employeeId || null,
      permissions: user.permissions || {},
      sessionId: sessionId
    },
    process.env.JWT_SECRET,
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
