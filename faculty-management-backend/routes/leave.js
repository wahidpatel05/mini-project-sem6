const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  submitLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
} = require("../controllers/leaveController");

// ── Employee routes (any authenticated user can submit / view their own) ──
router.post("/request", verifyToken, submitLeaveRequest);
router.get("/my-requests", verifyToken, getMyLeaveRequests);

// ── Admin routes ──
router.get("/all", verifyToken, getAllLeaveRequests);
router.put("/:employeeId/:requestId", verifyToken, updateLeaveStatus);

module.exports = router;
