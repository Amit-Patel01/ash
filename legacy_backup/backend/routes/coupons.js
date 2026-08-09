const express = require("express");
const {
  createCouponRecord,
  deleteCouponRecord,
  listAllCoupons,
  updateCouponRecord,
  validateCoupon,
} = require("../controllers/couponController");
const { verifyFirebaseToken } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.post("/validate", verifyFirebaseToken, validateCoupon);
router.get("/", verifyFirebaseToken, adminOnly, listAllCoupons);
router.post("/", verifyFirebaseToken, adminOnly, createCouponRecord);
router.patch("/:couponId", verifyFirebaseToken, adminOnly, updateCouponRecord);
router.delete("/:couponId", verifyFirebaseToken, adminOnly, deleteCouponRecord);

module.exports = router;
