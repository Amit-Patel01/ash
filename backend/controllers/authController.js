const { logger } = require("../logger");
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

module.exports = {
  registerCustomer,
  submitAccountRequest,
  forgotPassword,
  verifyPasswordResetToken,
  resetPassword,
};
