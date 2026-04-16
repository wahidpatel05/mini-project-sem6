const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { getMessages } = require("../controllers/messageController");

const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

router.get("/:roomId", messageLimiter, getMessages);

module.exports = router;
