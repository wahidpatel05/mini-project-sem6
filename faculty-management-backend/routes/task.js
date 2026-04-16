const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload");
const { createSharedTask, getAllSharedTasks, getSharedTaskById } = require("../controllers/taskController");

router.post("/", upload.array("attachments", 5), createSharedTask);
router.get("/", getAllSharedTasks);
router.get("/:id", getSharedTaskById);

module.exports = router;
