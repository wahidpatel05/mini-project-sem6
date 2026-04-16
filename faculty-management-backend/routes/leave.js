const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const verifyToken = require("../middleware/authMiddleware");
const {
  submitLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const leaveReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const leaveWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// ── Employee routes ──
router.post("/request", leaveWriteLimiter, verifyToken, submitLeaveRequest);
router.get("/my-requests", leaveReadLimiter, verifyToken, getMyLeaveRequests);

// ── Admin routes ──
router.get("/all", leaveReadLimiter, verifyToken, getAllLeaveRequests);
router.put("/:employeeId/:requestId", leaveWriteLimiter, verifyToken, updateLeaveStatus);

module.exports = router;
