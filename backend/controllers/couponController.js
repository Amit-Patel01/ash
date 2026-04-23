const {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  validateCouponForPurchase,
} = require("../services/couponService");
const { logger } = require("../logger");

const listAllCoupons = async (req, res) => {
  try {
    const coupons = await listCoupons();
    return res.json({ success: true, coupons });
  } catch (error) {
    logger.error("Unable to list coupons:", error);
    return res.status(500).json({ success: false, message: "Unable to load coupons." });
  }
};

const createCouponRecord = async (req, res) => {
  try {
    const coupon = await createCoupon(req.body || {}, req.user);
    return res.status(201).json({ success: true, coupon });
  } catch (error) {
    logger.warn(`Coupon create failed: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || "Unable to create coupon." });
  }
};

const updateCouponRecord = async (req, res) => {
  try {
    const coupon = await updateCoupon(req.params.couponId, req.body || {}, req.user);
    return res.json({ success: true, coupon });
  } catch (error) {
    logger.warn(`Coupon update failed: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || "Unable to update coupon." });
  }
};

const deleteCouponRecord = async (req, res) => {
  try {
    await deleteCoupon(req.params.couponId);
    return res.json({ success: true });
  } catch (error) {
    logger.warn(`Coupon delete failed: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || "Unable to delete coupon." });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const result = await validateCouponForPurchase({
      couponCode: req.body?.couponCode,
      courseId: req.body?.courseId,
      planId: req.body?.planId,
      originalAmount: req.body?.originalAmount,
      userId: req.user?.uid,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      coupon: {
        id: result.coupon.id,
        code: result.coupon.code,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
      },
      pricing: result.pricing,
    });
  } catch (error) {
    logger.warn(`Coupon validation failed: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || "Unable to validate coupon." });
  }
};

module.exports = {
  createCouponRecord,
  deleteCouponRecord,
  listAllCoupons,
  updateCouponRecord,
  validateCoupon,
};
