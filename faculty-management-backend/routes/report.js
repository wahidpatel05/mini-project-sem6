const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { downloadEmployeeReport } = require("../controllers/reportController");

const reportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many report requests, please try again later." },
});

router.get("/employee/:id", reportLimiter, downloadEmployeeReport);

module.exports = router;
