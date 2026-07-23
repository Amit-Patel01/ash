/**
 * In-Memory Queue Service (no Redis required)
 * 
 * Processes payment jobs asynchronously:
 *  - Send confirmation email
 *  - Assign course in Firestore
 * 
 * Can be swapped for BullMQ + Redis later by replacing this file only.
 */

const { logger } = require("../logger");
const { sendEmail, emailTemplate } = require("./emailService");
const { createEnrollment, savePayment } = require("./firebaseService");

// Simple in-memory queue using async processing
const jobQueue = [];
let isProcessing = false;

/**
 * Process a single payment job
 */
const processPaymentJob = async (job) => {
  const { type, data } = job;
  logger.info(`[Queue] Processing job: ${type}`);

  try {
    if (type === "TRADING_PAYMENT") {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        userId,
        userName,
        userEmail,
        planId,
        planName,
        amount,
      } = data;

      // 1. Save payment to Firestore
      await savePayment(razorpay_payment_id, {
        userId,
        userName,
        userEmail,
        courseId: planId,
        courseName: planName,
        amount,
        paymentMethod: "razorpay",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: "completed",
      });

      // 2. Create enrollment
      await createEnrollment({
        userId,
        userName,
        userEmail,
        courseId: planId,
        courseTitle: planName,
        courseName: planName,
        status: "active",
        paymentId: razorpay_payment_id,
      });

      // 3. Send confirmation email
      await sendEmail({
        to: userEmail,
        subject: `Welcome to ${planName} Mentorship!`,
        html: emailTemplate(
          "Enrollment Confirmed!",
          `
          <h2>Hello ${userName},</h2>
          <p>Your enrollment in the <strong>${planName} Mentorship Program</strong> is active.</p>
          <p>Your payment of <strong>₹${amount}</strong> was successful. You now have full access to:</p>
          <ul style="padding-left: 20px; color: #475569;">
            <li>Daily Live Trading Sessions</li>
            <li>Premium Strategy Blueprints</li>
            <li>Private Community Discord/Telegram</li>
            <li>One-on-One Performance Review</li>
          </ul>
          `,
          "Access Dashboard",
          "https://www.amitsolutionhub.com/customer"
        ),
      });

      logger.info(`[Queue] TRADING_PAYMENT processed for ${userEmail}`);
    } else if (type === "PROJECT_PAYMENT") {
      const {
        razorpay_order_id,
        customer_email,
        customer_name,
        project_title,
        amount,
        purchase_type,
      } = data;

      await sendEmail({
        to: customer_email,
        subject: `Payment Successful – ${project_title}`,
        html: emailTemplate(
          "Thank You for Your Purchase!",
          `
          <p>Hello <strong>${customer_name}</strong>,</p>
          <p>We've successfully received your payment for <strong>${project_title}</strong>.</p>
          <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #dbeafe;">
            <p style="margin: 0; font-weight: bold; color: #1e40af;">Next Steps:</p>
            <p style="margin: 8px 0 0; color: #1e3a8a;">
              Our engineers are preparing your files. <strong>The full source code, setup guide, and documentation will reach this email within 24 hours.</strong>
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b;">Order ID</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600;">${razorpay_order_id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b;">Amount Paid</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #059669;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b;">Package</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600;">${
                purchase_type === "project_with_source"
                  ? "Source + Setup"
                  : "Project Only"
              }</td>
            </tr>
          </table>
          `,
          "View Orders",
          "https://www.amitsolutionhub.com/customer/orders"
        ),
      });

      logger.info(`[Queue] PROJECT_PAYMENT processed for ${customer_email}`);
    }
  } catch (err) {
    logger.error(`[Queue] Job ${type} failed: ${err.message}`);
  }
};

/**
 * Process all jobs in queue sequentially
 */
const processQueue = async () => {
  if (isProcessing || jobQueue.length === 0) return;
  isProcessing = true;

  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    await processPaymentJob(job);
  }

  isProcessing = false;
};

/**
 * Add a payment job to the queue
 * @param {string} type - Job type e.g. 'TRADING_PAYMENT'
 * @param {Object} data - Job payload
 */
const addPaymentJob = (type, data) => {
  jobQueue.push({ type, data, createdAt: new Date() });
  logger.info(`[Queue] Job enqueued: ${type} (queue size: ${jobQueue.length})`);
  // Process asynchronously (non-blocking)
  setImmediate(processQueue);
};

module.exports = { addPaymentJob };
