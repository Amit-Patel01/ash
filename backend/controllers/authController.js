const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const https = require("https");
const { getDb } = require("../utils/mongo");
const { logger } = require("../logger");
const {
  createManagedUser,
  createAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  createHttpError,
} = require("../services/userService");

// ─── Google OAuth Helpers ─────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL  = process.env.GOOGLE_CALLBACK_URL  || 'http://localhost:5000/api/auth/google/callback';
const FRONTEND_URL         = process.env.FRONTEND_URL         || 'http://localhost:5173';

/** Simple https GET/POST helper (no extra packages) */
const httpsPost = (url, postData) =>
  new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body   = typeof postData === 'string' ? postData : new URLSearchParams(postData).toString();
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'POST',
      headers: {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON from Google: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

const httpsGet = (url, accessToken) =>
  new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'GET',
      headers:  { Authorization: `Bearer ${accessToken}` },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON from Google: ' + data)); }
      });
    });
    req.on('error', reject);
    req.end();
  });

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

// ─── Google OAuth Controllers ─────────────────────────────────────────────────

/**
 * Step 1 – Redirect the browser to Google's consent screen.
 * GET /api/auth/google
 */
const googleAuthRedirect = (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ success: false, message: 'Google OAuth is not configured on this server.' });
  }

  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

/**
 * Step 2 – Google redirects here with ?code=...
 * GET /api/auth/google/callback
 */
const googleAuthCallback = async (req, res) => {
  const { code, error: oauthError } = req.query;

  if (oauthError || !code) {
    logger.warn('[Google OAuth] User denied access or error:', oauthError);
    return res.redirect(`${FRONTEND_URL}/login?error=google_denied`);
  }

  try {
    // 1. Exchange code → access_token
    const tokenData = await httpsPost('https://oauth2.googleapis.com/token', {
      code,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri:  GOOGLE_CALLBACK_URL,
      grant_type:    'authorization_code',
    });

    if (!tokenData.access_token) {
      logger.error('[Google OAuth] Token exchange failed:', tokenData);
      return res.redirect(`${FRONTEND_URL}/login?error=google_token_failed`);
    }

    // 2. Get user profile from Google
    const profile = await httpsGet('https://www.googleapis.com/oauth2/v3/userinfo', tokenData.access_token);
    const { email, name, picture, sub: googleId } = profile;

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
    }

    const db  = getDb();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find or create user in MongoDB
    let user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      // New user — create as student (customer)
      const uid = `google_${googleId}`;
      const newUser = {
        uid,
        email:         normalizedEmail,
        displayName:   name || email.split('@')[0],
        photoURL:      picture || '',
        role:          'customer',
        status:        'active',
        authProvider:  'google',
        googleId,
        createdAt:     new Date(),
        updatedAt:     new Date(),
      };
      await db.collection('users').insertOne(newUser);
      user = newUser;
      logger.info(`[Google OAuth] New user created: ${normalizedEmail}`);
    } else {
      // Existing user — update Google info & ensure active
      await db.collection('users').updateOne(
        { email: normalizedEmail },
        {
          $set: {
            googleId,
            photoURL:     user.photoURL || picture || '',
            authProvider: user.authProvider || 'google',
            updatedAt:    new Date(),
          }
        }
      );
      logger.info(`[Google OAuth] Existing user logged in via Google: ${normalizedEmail}`);
    }

    if (user.status && user.status !== 'active') {
      return res.redirect(`${FRONTEND_URL}/login?error=account_inactive`);
    }

    // 4. Issue our own JWT (same shape as email/password login)
    const uid = user.uid || user._id?.toString();
    const jwtToken = jwt.sign(
      {
        uid,
        email:       user.email,
        role:        user.role  || 'customer',
        employeeId:  user.employeeId || null,
        permissions: user.permissions || {},
      },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '7d' }
    );

    // 5. Redirect to frontend with token in URL
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(jwtToken)}`);

  } catch (err) {
    logger.error('[Google OAuth] Callback error:', err);
    return res.redirect(`${FRONTEND_URL}/login?error=google_server_error`);
  }
};

module.exports = {
  login,
  registerCustomer,
  submitAccountRequest,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
  googleAuthRedirect,
  googleAuthCallback,
};
