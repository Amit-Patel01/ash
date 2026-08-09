const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { addPaymentJob } = require("../services/queueService");
const { logger } = require("../logger");

/**
 * POST /api/webhook/razorpay
 * 
 * Razorpay sends webhook events here.
 * Register this URL in Razorpay Dashboard > Settings > Webhooks
 * 
 * IMPORTANT: This route must be mounted BEFORE express.json() so we get the raw body.
 * The server.js mounts this route with express.raw() middleware.
 */
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn("[Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification");
    }

    // Verify signature
    const receivedSignature = req.headers["x-razorpay-signature"];

    if (webhookSecret && receivedSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.body)
        .digest("hex");

      if (expectedSignature !== receivedSignature) {
        logger.warn("[Webhook] Invalid Razorpay signature");
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }
    }

    // Parse event
    let event;
    try {
      event = JSON.parse(req.body.toString());
    } catch (e) {
      logger.error("[Webhook] Failed to parse event body");
      return res.status(400).json({ success: false, message: "Invalid JSON body" });
    }

    logger.info(`[Webhook] Event received: ${event.event}`);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        const notes = payment.notes || {};
        const type = notes.type || "PROJECT_PAYMENT";

        addPaymentJob(type, {
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          customer_email: notes.customer_email || payment.email,
          customer_name: notes.customer_name || "Customer",
          project_title: notes.project_title || "Purchase",
          amount: payment.amount / 100,
          purchase_type: notes.purchase_type,
          // Trading fields
          userId: notes.userId,
          userName: notes.userName,
          userEmail: notes.userEmail || payment.email,
          planId: notes.planId,
          planName: notes.planName,
        });
      }
    }

    // Always respond 200 immediately
    res.status(200).json({ received: true });
  }
);

module.exports = router;
