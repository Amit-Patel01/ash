const admin = require("firebase-admin");
const { db } = require("./firebaseService");

const COUPON_COLLECTION = "coupons";

const normalizeString = (value) => String(value || "").trim();
const normalizeCouponCode = (value) => normalizeString(value).toUpperCase();
const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

const buildCouponPlanKey = (courseId, planId) =>
  `${normalizeString(courseId)}::${normalizeString(planId)}`;

const normalizeCouponPlans = (plans) => {
  if (!Array.isArray(plans)) return [];

  const unique = new Map();
  for (const plan of plans) {
    const key = normalizeString(plan?.key);
    if (!key) continue;
    unique.set(key, {
      key,
      label: normalizeString(plan?.label),
    });
  }

  return [...unique.values()];
};

const normalizeCourseScopes = (courseScopes) => {
  if (!Array.isArray(courseScopes)) return [];

  const unique = new Map();
  for (const scope of courseScopes) {
    const courseId = normalizeString(scope?.courseId);
    if (!courseId) continue;

    unique.set(courseId, {
      courseId,
      courseTitle: normalizeString(scope?.courseTitle),
      plans: normalizeCouponPlans(scope?.plans),
    });
  }

  return [...unique.values()];
};

const normalizeOptionalDate = (value, label) => {
  const raw = normalizeString(value);
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${label}.`);
  }

  return parsed.toISOString();
};

const sanitizeCouponPayload = (input = {}, existing = {}) => {
  const code = normalizeCouponCode(input.code ?? existing.code);
  if (!code) {
    throw new Error("Coupon code is required.");
  }

  const discountType = normalizeString(input.discountType || existing.discountType || "percentage").toLowerCase();
  if (!["percentage", "flat"].includes(discountType)) {
    throw new Error("Discount type must be percentage or flat.");
  }

  const discountValue = roundCurrency(input.discountValue ?? existing.discountValue);
  if (discountValue <= 0) {
    throw new Error("Discount value must be greater than zero.");
  }

  if (discountType === "percentage" && discountValue > 100) {
    throw new Error("Percentage discount cannot be more than 100.");
  }

  const validFrom = normalizeOptionalDate(input.validFrom ?? existing.validFrom, "start date");
  const validUntil = normalizeOptionalDate(input.validUntil ?? existing.validUntil, "end date");

  if (validFrom && validUntil && new Date(validUntil) < new Date(validFrom)) {
    throw new Error("Coupon end date must be after the start date.");
  }

  const rawUsageLimit = input.usageLimit ?? existing.usageLimit ?? "";
  const normalizedUsageLimit = normalizeString(rawUsageLimit);
  const usageLimit =
    normalizedUsageLimit === ""
      ? null
      : Math.max(0, Number.parseInt(normalizedUsageLimit, 10) || 0);

  const courseScopes = normalizeCourseScopes(input.courseScopes ?? existing.courseScopes ?? []);

  return {
    code,
    discountType,
    discountValue,
    isActive: input.isActive ?? existing.isActive ?? true,
    validFrom,
    validUntil,
    usageLimit,
    courseScopes,
    updatedByUid: normalizeString(input.updatedByUid || existing.updatedByUid),
    updatedByEmail: normalizeString(input.updatedByEmail || existing.updatedByEmail),
  };
};

const mapCouponDoc = (docSnap) => ({ id: docSnap.id, ...docSnap.data() });

const listCoupons = async () => {
  try {
    const snap = await db().collection(COUPON_COLLECTION).orderBy("createdAt", "desc").get();
    return snap.docs.map(mapCouponDoc);
  } catch {
    const snap = await db().collection(COUPON_COLLECTION).get();
    return snap.docs
      .map(mapCouponDoc)
      .sort((left, right) => {
        const leftValue = left.createdAt?.toMillis?.() || 0;
        const rightValue = right.createdAt?.toMillis?.() || 0;
        return rightValue - leftValue;
      });
  }
};

const getCouponById = async (couponId) => {
  const docSnap = await db().collection(COUPON_COLLECTION).doc(String(couponId)).get();
  return docSnap.exists ? mapCouponDoc(docSnap) : null;
};

const findCouponByCode = async (couponCode) => {
  const normalizedCode = normalizeCouponCode(couponCode);
  if (!normalizedCode) return null;

  const snap = await db()
    .collection(COUPON_COLLECTION)
    .where("code", "==", normalizedCode)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return mapCouponDoc(snap.docs[0]);
};

const assertUniqueCouponCode = async (code, ignoreCouponId = "") => {
  const existing = await findCouponByCode(code);
  if (existing && existing.id !== String(ignoreCouponId || "")) {
    throw new Error("This coupon code already exists.");
  }
};

const createCoupon = async (payload, actor = {}) => {
  const sanitized = sanitizeCouponPayload({
    ...payload,
    updatedByUid: actor?.uid || "",
    updatedByEmail: actor?.email || "",
  });

  await assertUniqueCouponCode(sanitized.code);

  const docRef = await db().collection(COUPON_COLLECTION).add({
    ...sanitized,
    createdByUid: normalizeString(actor?.uid),
    createdByEmail: normalizeString(actor?.email),
    usedCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const created = await docRef.get();
  return mapCouponDoc(created);
};

const updateCoupon = async (couponId, payload, actor = {}) => {
  const existing = await getCouponById(couponId);
  if (!existing) {
    throw new Error("Coupon not found.");
  }

  const sanitized = sanitizeCouponPayload(
    {
      ...payload,
      updatedByUid: actor?.uid || "",
      updatedByEmail: actor?.email || "",
    },
    existing
  );

  await assertUniqueCouponCode(sanitized.code, couponId);

  await db()
    .collection(COUPON_COLLECTION)
    .doc(String(couponId))
    .update({
      ...sanitized,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  const updated = await getCouponById(couponId);
  return updated;
};

const deleteCoupon = async (couponId) => {
  await db().collection(COUPON_COLLECTION).doc(String(couponId)).delete();
};

const getCouponUsageByUser = async (userId, couponCode) => {
  if (!normalizeString(userId) || !normalizeCouponCode(couponCode)) return false;

  const snap = await db()
    .collection("enrollments")
    .where("userId", "==", String(userId))
    .limit(100)
    .get();

  return snap.docs.some((docSnap) => normalizeCouponCode(docSnap.data()?.couponCode) === normalizeCouponCode(couponCode));
};

const validateCouponForPurchase = async ({
  couponCode,
  courseId,
  planId,
  originalAmount,
  userId,
}) => {
  const normalizedCode = normalizeCouponCode(couponCode);
  if (!normalizedCode) {
    return { success: false, message: "Enter a coupon code." };
  }

  const amount = roundCurrency(originalAmount);
  if (amount <= 0) {
    return { success: false, message: "Coupons can only be used on paid plans." };
  }

  const coupon = await findCouponByCode(normalizedCode);
  if (!coupon) {
    return { success: false, message: "Coupon code not found." };
  }

  if (coupon.isActive !== true) {
    return { success: false, message: "This coupon is currently inactive." };
  }

  const now = Date.now();
  if (coupon.validFrom) {
    const startsAt = new Date(coupon.validFrom).getTime();
    if (!Number.isNaN(startsAt) && now < startsAt) {
      return { success: false, message: "This coupon is not active yet." };
    }
  }

  if (coupon.validUntil) {
    const endsAt = new Date(coupon.validUntil).getTime();
    if (!Number.isNaN(endsAt) && now > endsAt) {
      return { success: false, message: "This coupon has expired." };
    }
  }

  if (coupon.usageLimit !== null && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit || 0)) {
    return { success: false, message: "This coupon has reached its usage limit." };
  }

  if (userId) {
    const alreadyUsed = await getCouponUsageByUser(userId, coupon.code);
    if (alreadyUsed) {
      return { success: false, message: "You have already used this coupon." };
    }
  }

  const normalizedCourseId = normalizeString(courseId);
  const normalizedPlanId = normalizeString(planId);
  const planKey = buildCouponPlanKey(normalizedCourseId, normalizedPlanId);
  const scopes = normalizeCourseScopes(coupon.courseScopes);

  if (scopes.length > 0) {
    const matchedScope = scopes.find((scope) => scope.courseId === normalizedCourseId);
    if (!matchedScope) {
      return { success: false, message: "This coupon does not apply to the selected course." };
    }

    const allowedPlanKeys = normalizeCouponPlans(matchedScope.plans).map((plan) => plan.key);
    if (allowedPlanKeys.length > 0 && !allowedPlanKeys.includes(planKey)) {
      return { success: false, message: "This coupon does not apply to the selected plan." };
    }
  }

  const rawDiscount =
    coupon.discountType === "percentage"
      ? roundCurrency((amount * Number(coupon.discountValue || 0)) / 100)
      : roundCurrency(coupon.discountValue);

  const discountAmount = Math.min(amount, Math.max(0, rawDiscount));
  const finalAmount = roundCurrency(Math.max(0, amount - discountAmount));

  return {
    success: true,
    coupon,
    pricing: {
      couponId: coupon.id,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalAmount: amount,
      discountAmount,
      finalAmount,
      planKey,
    },
  };
};

const incrementCouponUsage = async (couponId) => {
  if (!normalizeString(couponId)) return;

  await db()
    .collection(COUPON_COLLECTION)
    .doc(String(couponId))
    .set(
      {
        usedCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
};

module.exports = {
  buildCouponPlanKey,
  createCoupon,
  deleteCoupon,
  findCouponByCode,
  getCouponById,
  incrementCouponUsage,
  listCoupons,
  updateCoupon,
  validateCouponForPurchase,
};
