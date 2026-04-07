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
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    });
    res.json({ success: true, order });
  } catch (error) {
    logger.error("Razorpay create order error:", error);
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

module.exports = { createOrder, verifyProjectPayment };
