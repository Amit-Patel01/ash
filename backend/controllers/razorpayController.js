const crypto = require("crypto");
const Razorpay = require("razorpay");
const { sendEmail, emailTemplate } = require("../services/emailService");
const { addPaymentJob } = require("../services/queueService");
const { logger } = require("../logger");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || "rzp_test_dummykey12345",
  key_secret: RAZORPAY_KEY_SECRET || "dummysecret12345",
});

/**
 * POST /api/razorpay/create-order
 */
const createOrder = async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  try {
    // Handle free plans (amount == 0) without Razorpay
    if (Number(amount) === 0) {
      const mockOrder = {
        id: `free_order_${Date.now()}`,
        amount: 0,
        currency,
        receipt: `receipt_free_${Date.now()}`,
      };
      return res.json({ success: true, order: mockOrder });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    });
    res.json({ success: true, order });
  } catch (error) {
    logger.error(`Razorpay create order error: ${JSON.stringify(error)}`, error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

/**
 * POST /api/razorpay/verify-payment
 * Project purchases
 */
const verifyProjectPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customer_email,
    customer_name,
    project_title,
    amount,
    purchase_type,
  } = req.body;

  // Handle free plans (amount == 0) without Razorpay verification
  if (Number(amount) === 0) {
    try {
      // Enqueue async email processing
      addPaymentJob("PROJECT_PAYMENT", {
        razorpay_order_id,
        razorpay_payment_id,
        customer_email,
        customer_name,
        project_title,
        amount,
        purchase_type,
      });

      // Notify admin immediately (lightweight)
      sendEmail({
        to: "amitpatel07029@gmail.com",
        subject: `New Free Project Access: ${project_title}`,
        text: `Free access granted for ${project_title} to ${customer_name} (${customer_email}). Order ID: ${razorpay_order_id}.`,
      }).catch((e) => logger.error("Admin notify error:", e));

      return res.json({ success: true, message: "Free access granted and email is being sent" });
    } catch (error) {
      logger.error("Free project access error:", error);
      return res.json({ success: true, message: "Free access granted but email failed" });
    }
  }

  const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSignature = hmac.digest("hex");

  if (expectedSignature !== razorpay_signature) {
    logger.error("❌ Projects Signature Mismatch", { razorpay_order_id });
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  try {
    // Enqueue async email processing
    addPaymentJob("PROJECT_PAYMENT", {
      razorpay_order_id,
      razorpay_payment_id,
      customer_email,
      customer_name,
      project_title,
      amount,
      purchase_type,
    });

    // Notify admin immediately (lightweight)
    sendEmail({
      to: "amitpatel07029@gmail.com",
      subject: `New Payment Received: ₹${amount}`,
      text: `New order for ${project_title} from ${customer_name} (${customer_email}). Order ID: ${razorpay_order_id}.`,
    }).catch((e) => logger.error("Admin notify error:", e));

    res.json({ success: true, message: "Payment verified and email is being sent" });
  } catch (error) {
    logger.error("Project payment verify error:", error);
    res.json({ success: true, message: "Payment verified but email failed" });
  }
};

/**
 * POST /api/razorpay/verify-course
 * Course enrollments
 */
const verifyCoursePayment = async (req, res) => {
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

  // Handle free plans (amount == 0) without Razorpay verification
  if (Number(amount) === 0) {
    try {
      // Enqueue async email processing
      addPaymentJob("TRADING_PAYMENT", {
        razorpay_order_id,
        razorpay_payment_id,
        userId,
        userName,
        userEmail,
        planId,
        planName,
        amount,
      });

      // Notify admin
      sendEmail({
        to: "amitpatel07029@gmail.com",
        subject: `New Free Course Enrollment: ${planName}`,
        text: `Free enrollment for ${planName} from ${userName} (${userEmail}). Order ID: ${razorpay_order_id}.`,
      }).catch((e) => logger.error("Admin notify error:", e));

      return res.json({ success: true, message: "Free enrollment processed successfully" });
    } catch (error) {
      logger.error("Free course enrollment error:", error);
      return res.json({ success: true, message: "Free enrollment processed but email failed" });
    }
  }

  const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSignature = hmac.digest("hex");

  if (expectedSignature !== razorpay_signature) {
    logger.error("❌ Course Signature Mismatch", { razorpay_order_id });
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  try {
    // Enqueue async email processing
    addPaymentJob("TRADING_PAYMENT", {
      razorpay_order_id,
      razorpay_payment_id,
      userId,
      userName,
      userEmail,
      planId,
      planName,
      amount,
    });

    // Notify admin
    sendEmail({
      to: "amitpatel07029@gmail.com",
      subject: `New Course Enrollment: ₹${amount}`,
      text: `New enrollment for ${planName} from ${userName} (${userEmail}). Order ID: ${razorpay_order_id}.`,
    }).catch((e) => logger.error("Admin notify error:", e));

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    logger.error("Course payment verify error:", error);
    res.json({ success: true, message: "Payment verified but email failed" });
  }
};

module.exports = { createOrder, verifyProjectPayment, verifyCoursePayment };
