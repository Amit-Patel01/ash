const admin = require("firebase-admin");
const { sendEmail } = require("../services/emailService");
const { logger } = require("../logger");

/**
 * POST /api/auth/forgot-password
 * Generate Firebase password reset link and send it via Resend
 */
const forgotPassword = async (req, res) => {
  const { email, returnUrl } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const cleanReturnUrl = (returnUrl || "https://www.amitsolutionhub.com/login").replace(/\.$/, "");
    const actionCodeSettings = { url: cleanReturnUrl, handleCodeInApp: true };

    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

    let displayName = "Member";
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      displayName = userRecord.displayName || "Member";
    } catch (e) {}

    await sendEmail({
      to: email,
      subject: "🔒 Action Required: Reset Your SolutionHub Password",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Solution<span style="color: #60a5fa;">Hub</span></h1>
            <p style="color: #bfdbfe; margin-top: 8px; font-size: 14px; font-weight: 500;">Secure Infrastructure & Growth Management</p>
          </div>
          
          <div style="padding: 40px 30px; background-color: white;">
            <h2 style="color: #111827; margin-top: 0; font-size: 22px; font-weight: 700;">Password Recovery</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hello <strong>${displayName}</strong>,</p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">We've received a request to reset your password for your account linked to <strong>${email}</strong>.</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">Reset My Password</a>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong>Security Alert:</strong> If you did not request this reset, please ignore this email. This link expires in 1 hour.
              </p>
            </div>
          </div>
          
          <div style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">© 2026 Amit Solution Hub | Gujarat, India</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: "Reset link sent to your email." });
  } catch (error) {
    logger.error("Custom reset error:", error);
    let errorMsg = "Failed to process request. Please ensure the email is registered.";
    if (error.code === "auth/user-not-found") errorMsg = "No account found with this email.";
    res.status(500).json({ success: false, message: errorMsg });
  }
};

module.exports = { forgotPassword };
