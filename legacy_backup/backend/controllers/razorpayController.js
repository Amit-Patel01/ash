const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { sendEmail, emailTemplate } = require("../services/emailService");
const { addPaymentJob } = require("../services/queueService");
const { getDb } = require("../utils/mongo");
const {
  incrementCouponUsage,
  validateCouponForPurchase,
} = require("../services/couponService");
const { logger } = require("../logger");

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || "rzp_test_dummykey12345",
  key_secret: RAZORPAY_KEY_SECRET || "dummysecret12345",
});

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;
const normalizePlanKey = (value) => String(value || "").trim().toLowerCase();
const compactPlanKey = (value) => normalizePlanKey(value).replace(/[^a-z0-9]/g, "");

const resolveStoredCoursePricing = async ({ courseId, planId }) => {
  const normalizedCourseId = String(courseId || "").trim();
  if (!normalizedCourseId) {
    throw new Error("Course id is required.");
  }

  const courseDoc = await getDb().collection("courses").findOne({ _id: ObjectId.isValid(normalizedCourseId) ? new ObjectId(normalizedCourseId) : normalizedCourseId });
  if (!courseDoc) {
    throw new Error("Selected course was not found.");
  }

  const course = { id: courseDoc._id.toString(), ...courseDoc };
  const plans = Array.isArray(course.plans) ? course.plans : [];

  if (plans.length === 0) {
    return {
      course,
      plan: null,
      originalAmount: roundCurrency(course.isFree ? 0 : course.price ?? 0),
    };
  }

  const normalizedTargetPlan = normalizePlanKey(planId);
  const compactTargetPlan = compactPlanKey(planId);
  const matchedPlan = plans.find((plan, index) => {
    const normalizedCandidates = [
      plan?.id,
      plan?.label,
      plan?.planId,
      index,
    ]
      .map(normalizePlanKey)
      .filter(Boolean);

    const compactCandidates = [
      plan?.id,
      plan?.label,
      plan?.planId,
      index,
    ]
      .map(compactPlanKey)
      .filter(Boolean);

    return (
      (normalizedTargetPlan && normalizedCandidates.includes(normalizedTargetPlan)) ||
      (compactTargetPlan && compactCandidates.includes(compactTargetPlan))
    );
  });

  if (!matchedPlan) {
    throw new Error("Selected plan was not found for this course.");
  }

  return {
    course,
    plan: matchedPlan,
    originalAmount: roundCurrency(
      matchedPlan.isFree ? 0 : matchedPlan.price ?? 0
    ),
  };
};

const resolveCoursePricing = async ({
  couponCode,
  courseId,
  planId,
  userId,
}) => {
  const { originalAmount } = await resolveStoredCoursePricing({ courseId, planId });
  const amount = roundCurrency(originalAmount);
  if (amount < 0) {
    throw new Error("Original amount is invalid.");
  }

  if (!couponCode) {
    return {
      success: true,
      pricing: {
        couponId: "",
        couponCode: "",
        discountAmount: 0,
        originalAmount: amount,
        finalAmount: amount,
      },
    };
  }

  return validateCouponForPurchase({
    couponCode,
    courseId,
    planId,
    originalAmount: amount,
    userId,
  });
};

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
 * POST /api/razorpay/create-course-order
 */
const createCourseOrder = async (req, res) => {
  const { courseId, planId, couponCode, currency = "INR" } = req.body || {};

  try {
    const pricingResult = await resolveCoursePricing({
      couponCode,
      courseId,
      planId,
      userId: req.user?.uid,
    });

    if (!pricingResult.success) {
      return res.status(400).json(pricingResult);
    }

    const { pricing } = pricingResult;

    if (pricing.finalAmount === 0) {
      const mockOrder = {
        id: `free_course_order_${Date.now()}`,
        amount: 0,
        currency,
        receipt: `receipt_free_course_${Date.now()}`,
      };

      return res.json({ success: true, order: mockOrder, pricing });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(pricing.finalAmount * 100),
      currency,
      receipt: `course_receipt_${Date.now()}`,
      notes: {
        courseId: String(courseId || ""),
        planId: String(planId || ""),
        couponCode: pricing.couponCode || "",
      },
    });

    return res.json({ success: true, order, pricing });
  } catch (error) {
    logger.error(`Razorpay course order error: ${JSON.stringify(error)}`, error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create course order." });
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
    courseId,
    planId,
    planName,
    amount,
    originalAmount,
    discountAmount,
    finalAmount,
    couponCode,
    couponId,
  } = req.body;

  let pricingResult;
  try {
    pricingResult = await resolveCoursePricing({
      couponCode,
      courseId,
      planId,
      userId: req.user?.uid || userId,
    });
  } catch (error) {
    logger.warn(`Course pricing resolution failed: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || "Unable to validate the coupon." });
  }

  if (!pricingResult.success) {
    return res.status(400).json(pricingResult);
  }

  const pricing = pricingResult.pricing;
  const expectedFinalAmount = pricing.finalAmount;
  const reportedFinalAmount = roundCurrency(finalAmount ?? amount);

  if (Math.abs(expectedFinalAmount - reportedFinalAmount) > 0.01) {
    return res.status(400).json({
      success: false,
      message: "The checkout amount no longer matches the latest coupon pricing.",
    });
  }

  // Handle free plans (amount == 0) without Razorpay verification
  if (expectedFinalAmount === 0) {
    try {
      // Enqueue async email processing
      addPaymentJob("TRADING_PAYMENT", {
        razorpay_order_id,
        razorpay_payment_id,
        userId,
        userName,
        userEmail,
        courseId,
        planId,
        planName,
        amount: expectedFinalAmount,
        originalAmount: pricing.originalAmount,
        discountAmount: pricing.discountAmount,
        couponCode: pricing.couponCode,
      });

      if (pricing.couponCode && (couponId || pricing.couponId)) {
        await incrementCouponUsage(couponId || pricing.couponId);
      }

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
      courseId,
      planId,
      planName,
      amount: expectedFinalAmount,
      originalAmount: pricing.originalAmount,
      discountAmount: pricing.discountAmount,
      couponCode: pricing.couponCode,
    });

    if (pricing.couponCode && (couponId || pricing.couponId)) {
      await incrementCouponUsage(couponId || pricing.couponId);
    }

    // Notify admin
    sendEmail({
      to: "amitpatel07029@gmail.com",
      subject: `New Course Enrollment: ₹${expectedFinalAmount}`,
      text: `New enrollment for ${planName} from ${userName} (${userEmail}). Order ID: ${razorpay_order_id}.`,
    }).catch((e) => logger.error("Admin notify error:", e));

    res.json({
      success: true,
      message: "Payment verified successfully",
      pricing: {
        originalAmount: pricing.originalAmount,
        discountAmount: pricing.discountAmount,
        finalAmount: expectedFinalAmount,
        couponCode: pricing.couponCode,
      },
    });
  } catch (error) {
    logger.error("Course payment verify error:", error);
    res.json({ success: true, message: "Payment verified but email failed" });
  }
};

module.exports = { createOrder, createCourseOrder, verifyProjectPayment, verifyCoursePayment };
