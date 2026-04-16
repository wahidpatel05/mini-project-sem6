const SharedTask = require("../models/SharedTask");
const Employee = require("../models/Employee");
const { sendTaskAssignedEmail } = require("../utils/emailService");

// Create a shared (multi-assignee) task
exports.createSharedTask = async (req, res) => {
  try {
    const { taskTitle, taskDescription, taskDate, category, priority } = req.body;

    // assigneeIds may arrive as a single string or an array from FormData
    let assigneeIds = req.body.assigneeIds;
    if (!assigneeIds) assigneeIds = [];
    if (!Array.isArray(assigneeIds)) assigneeIds = [assigneeIds];
    // Filter out any empty values
    assigneeIds = assigneeIds.filter(Boolean);

    if (!taskTitle || !taskDescription || !taskDate || !category) {
      return res.status(400).json({ message: "All task fields are required" });
    }

    if (assigneeIds.length === 0) {
      return res.status(400).json({ message: "At least one assignee is required" });
    }

    // Validate date
    const taskDateObj = new Date(taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDateObj.setHours(0, 0, 0, 0);

    if (taskDateObj < today) {
      return res.status(400).json({ message: "Cannot create task for a past date" });
    }

    // Fetch all assignee employees
    const employees = await Employee.find({ _id: { $in: assigneeIds } });

    if (employees.length !== assigneeIds.length) {
      return res.status(404).json({ message: "One or more employees not found" });
    }

    // Handle file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          uploadedAt: new Date(),
        });
      });
    }

    // Build assignees array for SharedTask
    const assigneesData = employees.map((emp) => ({
      employeeId: emp._id,
      employeeName: emp.firstName,
    }));

    // Create the SharedTask document
    const sharedTask = new SharedTask({
      taskTitle,
      taskDescription,
      taskDate,
      category,
      priority: priority || "Medium",
      assignees: assigneesData,
      active: false,
      newTask: true,
      completed: false,
      failed: false,
      attachments,
    });

    await sharedTask.save();

    // Push a copy into each employee's embedded tasks array with sharedTaskId reference
    const taskPayload = {
      taskTitle,
      taskDescription,
      taskDate,
      category,
      priority: priority || "Medium",
      active: false,
      newTask: true,
      completed: false,
      failed: false,
      rejected: false,
      attachments,
      completedAt: null,
      postponeRequests: [],
      sharedTaskId: sharedTask._id,
    };

    for (const emp of employees) {
      emp.tasks.push(taskPayload);
      emp.taskCounts.newTask += 1;
      await emp.save();

      // Send notification email (fire-and-forget, log failures)
      sendTaskAssignedEmail(emp.firstName, emp.email, { taskTitle, taskDescription, taskDate, category, priority })
        .catch((err) => console.error(`Failed to send task email to ${emp.email}:`, err.message));
    }

    const populated = await SharedTask.findById(sharedTask._id).populate("assignees.employeeId", "firstName email");

    res.status(201).json({
      message: "Shared task created and assigned to all selected employees",
      sharedTask: populated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all shared tasks
exports.getAllSharedTasks = async (req, res) => {
  try {
    const tasks = await SharedTask.find()
      .populate("assignees.employeeId", "firstName email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single shared task by ID
exports.getSharedTaskById = async (req, res) => {
  try {
    const task = await SharedTask.findById(req.params.id).populate("assignees.employeeId", "firstName email");

    if (!task) {
      return res.status(404).json({ message: "Shared task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
