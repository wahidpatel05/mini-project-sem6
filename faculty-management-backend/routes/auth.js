const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { adminLogin, employeeLogin, getAdminProfile } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

const profileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

router.post("/admin-login", adminLogin);
router.post("/employee-login", employeeLogin);
router.get("/admin-profile", profileLimiter, verifyToken, getAdminProfile);

module.exports = router;
