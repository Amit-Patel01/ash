const express = require("express");
const router = express.Router();
const { broadcastEmail, notifyAccountApproval } = require("../controllers/adminController");
const { verifyFirebaseToken } = require("../middlewares/authMiddleware");
const { adminOnly, employeeOrAdmin } = require("../middlewares/rbacMiddleware");

// POST /api/admin/broadcast-email
router.post("/broadcast-email", verifyFirebaseToken, employeeOrAdmin, broadcastEmail);

// POST /api/admin/notify-account-approval
router.post("/notify-account-approval", verifyFirebaseToken, adminOnly, notifyAccountApproval);

module.exports = router;
