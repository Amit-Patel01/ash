const express = require("express");
const router = express.Router();
const {
  broadcastEmail,
  notifyAccountApproval,
  listUsers,
  lookupUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  deleteUserByEmail,
  mergeUsers,
  approveRequest,
  rejectRequest,
  removeRequest,
  listEmployeeCvs,
  downloadEmployeeCv,
  sendReceiptEmail,
  fireEmployee,
  reinstateEmployee,
} = require("../controllers/adminController");
const { verifyFirebaseToken } = require("../middlewares/authMiddleware");
const { adminOnly, employeeOrAdmin } = require("../middlewares/rbacMiddleware");

router.post("/broadcast-email", verifyFirebaseToken, employeeOrAdmin, broadcastEmail);
router.post("/notify-account-approval", verifyFirebaseToken, adminOnly, notifyAccountApproval);
router.get("/users", verifyFirebaseToken, adminOnly, listUsers);
router.get("/users/lookup", verifyFirebaseToken, adminOnly, lookupUserByEmail);
router.delete("/users/by-email", verifyFirebaseToken, adminOnly, deleteUserByEmail);
router.post("/users", verifyFirebaseToken, adminOnly, createUser);
router.patch("/users/:userId", verifyFirebaseToken, adminOnly, updateUser);
router.post("/users/:userId/fire", verifyFirebaseToken, adminOnly, fireEmployee);
router.post("/users/:userId/reinstate", verifyFirebaseToken, adminOnly, reinstateEmployee);
router.delete("/users/:userId", verifyFirebaseToken, adminOnly, deleteUser);
router.post("/users/merge", verifyFirebaseToken, adminOnly, mergeUsers);
router.post("/account-requests/:requestId/approve", verifyFirebaseToken, adminOnly, approveRequest);
router.post("/account-requests/:requestId/reject", verifyFirebaseToken, adminOnly, rejectRequest);
router.delete("/account-requests/:requestId", verifyFirebaseToken, adminOnly, removeRequest);
router.get("/employee-cvs/:userId/download", verifyFirebaseToken, adminOnly, downloadEmployeeCv);
router.get("/employee-cvs", verifyFirebaseToken, adminOnly, listEmployeeCvs);
router.post("/receipts/:id/send-email", verifyFirebaseToken, employeeOrAdmin, sendReceiptEmail);

module.exports = router;
