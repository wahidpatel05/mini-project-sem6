const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload");
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addTask,
  updateTask,
  reassignTask,
  rejectTask,
  requestPostpone,
  approvePostpone,
  rejectPostpone,
  changePassword,
  getTaskRecommendations,
} = require("../controllers/employeeController");

router.get("/", getAllEmployees);
router.get("/recommendations/task", getTaskRecommendations);
router.get("/:id", getEmployeeById);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.put("/:id/change-password", changePassword);
router.delete("/:id", deleteEmployee);
router.post("/:employeeId/tasks", upload.array("attachments", 5), addTask);
router.put("/:employeeId/tasks/:taskIndex", upload.array("attachments", 5), updateTask);
router.post("/:fromEmployeeId/tasks/:taskIndex/reassign/:toEmployeeId", reassignTask);
router.post("/:employeeId/tasks/:taskIndex/reject", rejectTask);
router.post("/:employeeId/tasks/:taskIndex/postpone", requestPostpone);
router.post("/:employeeId/tasks/:taskIndex/postpone/:requestIndex/approve", approvePostpone);
router.post("/:employeeId/tasks/:taskIndex/postpone/:requestIndex/reject", rejectPostpone);

module.exports = router;
