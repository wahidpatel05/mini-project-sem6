const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const upload = require("../middleware/fileUpload");
const { createSharedTask, getAllSharedTasks, getSharedTaskById } = require("../controllers/taskController");

const taskReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const taskWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

router.post("/", taskWriteLimiter, upload.array("attachments", 5), createSharedTask);
router.get("/", taskReadLimiter, getAllSharedTasks);
router.get("/:id", taskReadLimiter, getSharedTaskById);

module.exports = router;
