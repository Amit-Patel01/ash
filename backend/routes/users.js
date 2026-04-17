const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/rbacMiddleware");
const {
  cvUpload,
  getMyProfile,
  changeMyEmail,
  updateMyProfile,
  sendMyPasswordReset,
  uploadMyCv,
} = require("../controllers/userController");

router.get("/me", verifyFirebaseToken, getMyProfile);
router.post("/me/email-change", verifyFirebaseToken, changeMyEmail);
router.patch("/me", verifyFirebaseToken, updateMyProfile);
router.post("/me/password-reset", verifyFirebaseToken, sendMyPasswordReset);
router.post("/me/cv", verifyFirebaseToken, requireRole("employee", "admin"), cvUpload.single("cv"), uploadMyCv);

module.exports = router;
