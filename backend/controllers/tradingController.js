const crypto = require("crypto");
const { sendEmail, emailTemplate } = require("../services/emailService");
const {
  savePayment,
  createEnrollment,
  getEnrollmentsByCourse,
  getSession,
  updateSession,
} = require("../services/firebaseService");
const { addPaymentJob } = require("../services/queueService");
const { logger } = require("../logger");

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * POST /api/trading/verify-payment
 * Verifies Razorpay signature and enqueues course assignment + email
 */
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    userName,
    userEmail,
    planId,
    planName,
    amount,
  } = req.body;

  const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSignature = hmac.digest("hex");

  if (expectedSignature !== razorpay_signature) {
    logger.error("❌ Trading Signature Mismatch", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  try {
    // Enqueue async processing (email + course assignment)
    addPaymentJob("TRADING_PAYMENT", {
      razorpay_payment_id,
      razorpay_order_id,
      userId,
      userName,
      userEmail,
      planId,
      planName,
      amount,
    });

    res.json({ success: true, message: "Payment verified and enrollment is being processed" });
  } catch (error) {
    logger.error("Trading verify-payment error:", error);
    res.status(500).json({ success: false, message: "Failed to process enrollment" });
  }
};

/**
 * POST /api/trading/enrollment-email
 * Manually trigger enrollment confirmation email
 */
const sendEnrollmentEmail = async (req, res) => {
  const { userName, userEmail, planName, amount } = req.body;
  try {
    await sendEmail({
      to: userEmail,
      subject: `Welcome to ${planName} Mentorship!`,
      html: emailTemplate(
        "Enrollment Confirmed!",
        `
        <h2>Hello ${userName},</h2>
        <p>Your enrollment in the <strong>${planName} Mentorship Program</strong> is confirmed.</p>
        <p>You can now access live sessions, curriculum, and community resources through your dashboard.</p>
        `,
        "Go to Dashboard",
        "https://www.amitsolutionhub.com/customer"
      ),
    });
    res.json({ success: true, message: "Enrollment email sent" });
  } catch (error) {
    logger.error("Enrollment email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
};

/**
 * POST /api/trading/toggle-live
 * Toggle live status of a trading session
 */
const toggleLive = async (req, res) => {
  const { sessionId, isLive } = req.body;
  try {
    await updateSession(sessionId, { isLive });

    if (isLive === true) {
      // Trigger notifications asynchronously
      const { sendSessionNotification } = require("../services/notificationService");
      sendSessionNotification(sessionId, "LIVE_NOW").catch((err) =>
        logger.error("Live notification error:", err)
      );
    }

    res.json({ success: true, message: `Session is now ${isLive ? "LIVE" : "OFFLINE"}` });
  } catch (error) {
    logger.error("Toggle live error:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

module.exports = { verifyPayment, sendEnrollmentEmail, toggleLive };
