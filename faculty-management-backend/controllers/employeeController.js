const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const markOverdueTasks = require("../utils/taskHelper");
const { getTaskRecommendationsWithFallback } = require("../utils/mlRecommendationHelper");
const { sendWelcomeEmail, sendPasswordChangedEmail, sendTaskAssignedEmail } = require("../utils/emailService");

const { isEmployeeAvailable } = require("../utils/leaveHelper");

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();

    // Check and mark overdue tasks for all employees
    for (let employee of employees) {
      const updated = markOverdueTasks(employee);
      if (updated) {
        await employee.save();
      }
    }

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check and mark overdue tasks
    const updated = markOverdueTasks(employee);
    if (updated) {
      await employee.save();
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { firstName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 3) {
      return res.status(400).json({ message: "Password must be at least 3 characters" });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      firstName,
      email,
      password: hashedPassword,
      passwordChangedAt: null,
      taskCounts: { active: 0, newTask: 0, completed: 0, failed: 0 },
      tasks: [],
    });

    await newEmployee.save();

    // Send welcome email with credentials (fire-and-forget)
    sendWelcomeEmail(firstName, email, password);
    res.status(201).json({
      message: `✅ Employee created successfully! Login credentials have been sent to ${email}`,
      employee: newEmployee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { firstName, email, password } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Validate email if changed
    if (email && email !== employee.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    if (firstName) employee.firstName = firstName;
    if (email) employee.email = email;
    if (password) {
      if (password.length < 3) {
        return res.status(400).json({ message: "Password must be at least 3 characters" });
      }
      employee.password = await bcrypt.hash(password, 10);
      // Admin reset: force the employee to change password on next login
      employee.isFirstLogin = true;
      employee.passwordChangedAt = null;
    }

    await employee.save();

    res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Employee deleted successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add task to employee
exports.addTask = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const task = req.body;

    // Validate task date is not in the past
    const taskDate = new Date(task.taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate < today) {
      return res.status(400).json({ message: "Cannot create task for a past date" });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if employee is on leave on taskDate
    const isAvailable = await isEmployeeAvailable(employeeId, task.taskDate);
    if (!isAvailable) {
      return res.status(400).json({ message: "Employee is on leave on the deadline date" });
    }

    // Handle file attachments if provided
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

    // Add attachments to task
    task.attachments = attachments;
    task.completedAt = null;
    task.postponeRequests = task.postponeRequests || [];

    employee.tasks.push(task);

    // Update task counts
    if (task.active) employee.taskCounts.active += 1;
    if (task.newTask) employee.taskCounts.newTask += 1;
    if (task.completed) employee.taskCounts.completed += 1;
    if (task.failed) employee.taskCounts.failed += 1;

    await employee.save();

    // Send task assignment email to employee (fire-and-forget)
    sendTaskAssignedEmail(employee.firstName, employee.email, task);

    res.status(201).json({
      message: "Task added successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update task status for an employee
exports.updateTask = async (req, res) => {
  try {
    const { employeeId, taskIndex } = req.params;
    const { newStatus } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (taskIndex >= employee.tasks.length || taskIndex < 0) {
      return res.status(400).json({ message: "Invalid task index" });
    }

    const task = employee.tasks[taskIndex];

    // Handle file attachments if provided (for adding more files to existing task)
    if (req.files && req.files.length > 0) {
      if (!task.attachments) {
        task.attachments = [];
      }
      req.files.forEach((file) => {
        task.attachments.push({
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          uploadedAt: new Date(),
        });
      });
    }

    // Check if task is overdue - if so, mark as failed instead of allowing status change (unless rejected)
    const taskDate = new Date(task.taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate < today && (task.newTask || task.active) && !task.rejected) {
      // Overdue task should be marked failed
      if (task.newTask) {
        employee.taskCounts.newTask -= 1;
      } else if (task.active) {
        employee.taskCounts.active -= 1;
      }

      task.newTask = false;
      task.active = false;
      task.completed = false;
      task.failed = true;
      task.rejected = false;
      task.completedAt = null;
      employee.taskCounts.failed += 1;

      await employee.save();

      return res.status(200).json({
        message: "Task is past deadline and has been marked as failed",
        employee,
      });
    }

    // Update counts based on old status
    if (task.newTask) employee.taskCounts.newTask -= 1;
    if (task.active) employee.taskCounts.active -= 1;
    if (task.completed) employee.taskCounts.completed -= 1;
    if (task.failed) employee.taskCounts.failed -= 1;

    // Reset all status flags
    task.newTask = false;
    task.active = false;
    task.completed = false;
    task.failed = false;

    // Set new status and update counts
    if (newStatus === "active") {
      task.active = true;
      employee.taskCounts.active += 1;
      task.completedAt = null;
    } else if (newStatus === "completed") {
      task.completed = true;
      employee.taskCounts.completed += 1;
      task.completedAt = new Date();
    } else if (newStatus === "failed") {
      task.failed = true;
      employee.taskCounts.failed += 1;
      task.completedAt = null;
    } else if (newStatus === "newTask") {
      task.newTask = true;
      employee.taskCounts.newTask += 1;
      task.completedAt = null;
    }

    await employee.save();

    res.status(200).json({
      message: "Task updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reassign task from one employee to another
exports.reassignTask = async (req, res) => {
  try {
    const { fromEmployeeId, toEmployeeId, taskIndex } = req.params;

    // Check if both employees exist
    const fromEmployee = await Employee.findById(fromEmployeeId);
    const toEmployee = await Employee.findById(toEmployeeId);

    if (!fromEmployee) {
      return res.status(404).json({ message: "Source employee not found" });
    }

    if (!toEmployee) {
      return res.status(404).json({ message: "Target employee not found" });
    }

    // Validate task index
    if (taskIndex >= fromEmployee.tasks.length || taskIndex < 0) {
      return res.status(400).json({ message: "Invalid task index" });
    }

    // Get the task
    const task = fromEmployee.tasks[taskIndex];

    // Prevent reassignment of completed, failed, or rejected tasks
    if (task.completed) {
      return res.status(400).json({ message: "Cannot reassign a completed task" });
    }

    if (task.failed) {
      return res.status(400).json({ message: "Cannot reassign a failed task" });
    }

    if (task.rejected) {
      return res.status(400).json({ message: "Cannot reassign a rejected task" });
    }

    // Update counts for source employee (remove task)
    if (task.newTask) fromEmployee.taskCounts.newTask -= 1;
    if (task.active) fromEmployee.taskCounts.active -= 1;
    if (task.completed) fromEmployee.taskCounts.completed -= 1;
    if (task.failed) fromEmployee.taskCounts.failed -= 1;

    // Remove task from source employee
    fromEmployee.tasks.splice(taskIndex, 1);

    // Add task to target employee
    toEmployee.tasks.push(task);

    // Update counts for target employee (add task)
    if (task.newTask) toEmployee.taskCounts.newTask += 1;
    if (task.active) toEmployee.taskCounts.active += 1;
    if (task.completed) toEmployee.taskCounts.completed += 1;
    if (task.failed) toEmployee.taskCounts.failed += 1;

    // Save both employees
    await fromEmployee.save();
    await toEmployee.save();

    res.status(200).json({
      message: "Task reassigned successfully",
      fromEmployee,
      toEmployee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject task with reason
exports.rejectTask = async (req, res) => {
  try {
    const { employeeId, taskIndex } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (taskIndex >= employee.tasks.length || taskIndex < 0) {
      return res.status(400).json({ message: "Invalid task index" });
    }

    const task = employee.tasks[taskIndex];

    // Update counts based on old status
    if (task.newTask) employee.taskCounts.newTask -= 1;
    if (task.active) employee.taskCounts.active -= 1;
    if (task.completed) employee.taskCounts.completed -= 1;
    if (task.failed) employee.taskCounts.failed -= 1;

    // Reset all status flags
    task.newTask = false;
    task.active = false;
    task.completed = false;
    task.failed = false;
    task.rejected = true;
    task.rejectionReason = rejectionReason.trim();
    task.completedAt = null;

    // Update counts
    employee.taskCounts.rejected += 1;

    await employee.save();

    res.status(200).json({
      message: "Task rejected successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Request postpone for a task
exports.requestPostpone = async (req, res) => {
  try {
    const { employeeId, taskIndex } = req.params;
    const { requestedDate, reason } = req.body;

    if (!requestedDate) {
      return res.status(400).json({ message: "Requested date is required" });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Reason is required" });
    }

    const requested = new Date(requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    requested.setHours(0, 0, 0, 0);

    if (Number.isNaN(requested.getTime())) {
      return res.status(400).json({ message: "Invalid requested date" });
    }

    if (requested < today) {
      return res.status(400).json({ message: "Requested date cannot be in the past" });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (taskIndex >= employee.tasks.length || taskIndex < 0) {
      return res.status(400).json({ message: "Invalid task index" });
    }

    const task = employee.tasks[taskIndex];

    if (task.completed || task.failed || task.rejected) {
      return res.status(400).json({ message: "Cannot postpone a closed task" });
    }

    if (!task.postponeRequests) {
      task.postponeRequests = [];
    }

    task.postponeRequests.push({
      requestedDate,
      reason: reason.trim(),
      status: "pending",
      requestedAt: new Date(),
    });

    await employee.save();

    res.status(200).json({
      message: "Postpone request submitted",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve a postpone request
exports.approvePostpone = async (req, res) => {
  try {
    const { employeeId, taskIndex, requestIndex } = req.params;
    const { responseNote } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (taskIndex >= employee.tasks.length || taskIndex < 0) {
      return res.status(400).json({ message: "Invalid task index" });
    }

    const task = employee.tasks[taskIndex];
    const request = task.postponeRequests?.[requestIndex];

    if (!request) {
      return res.status(404).json({ message: "Postpone request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Postpone request already processed" });
    }

    const requested = new Date(request.requestedDate);
    if (Number.isNaN(requested.getTime())) {
      return res.status(400).json({ message: "Invalid requested date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    requested.setHours(0, 0, 0, 0);

    if (requested < today) {
      return res.status(400).json({ message: "Requested date is in the past" });
    }

    request.status = "approved";
    request.respondedAt = new Date();
    if (responseNote) {
      request.responseNote = responseNote.trim();
    }

    task.taskDate = request.requestedDate;

    await employee.save();

    res.status(200).json({
      message: "Postpone request approved",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject a postpone request
exports.rejectPostpone = async (req, res) => {
  try {
    const { employeeId, taskIndex, requestIndex } = req.params;
    const { responseNote } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (taskIndex >= employee.tasks.length || taskIndex < 0) {
      return res.status(400).json({ message: "Invalid task index" });
    }

    const task = employee.tasks[taskIndex];
    const request = task.postponeRequests?.[requestIndex];

    if (!request) {
      return res.status(404).json({ message: "Postpone request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Postpone request already processed" });
    }

    request.status = "rejected";
    request.respondedAt = new Date();
    if (responseNote) {
      request.responseNote = responseNote.trim();
    }

    await employee.save();

    res.status(200).json({
      message: "Postpone request rejected",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const employeeId = req.params.id;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 3) {
      return res.status(400).json({ message: "New password must be at least 3 characters" });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // If it's first login (passwordChangedAt is null), skip old password verification
    if (employee.passwordChangedAt === null) {
      // First login - no need to verify old password
      employee.password = await bcrypt.hash(newPassword, 10);
      employee.passwordChangedAt = new Date();
      employee.isFirstLogin = false;

      await employee.save();

      // Send email with new password details
      sendPasswordChangedEmail(employee.firstName, employee.email, newPassword);

      return res.status(200).json({
        message: "Password set successfully",
        employee,
      });
    }

    // For subsequent password changes, verify old password
    if (!oldPassword) {
      return res.status(400).json({ message: "Old password is required" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Hash and set new password
    employee.password = await bcrypt.hash(newPassword, 10);
    employee.passwordChangedAt = new Date();

    await employee.save();

    // Send email with new password details
    sendPasswordChangedEmail(employee.firstName, employee.email, newPassword);

    res.status(200).json({
      message: "Password changed successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get task assignment recommendations
exports.getTaskRecommendations = async (req, res) => {
  try {
    const { taskCategory, taskPriority, taskDate } = req.query;

    if (!taskCategory) {
      return res.status(400).json({ message: "Task category is required" });
    }

    // Get all employees
    const employees = await Employee.find();

    // Check and mark overdue tasks for all employees
    for (let employee of employees) {
      const updated = markOverdueTasks(employee);
      if (updated) {
        await employee.save();
      }
    }

    // ML-first recommendation with automatic fallback to rule-based logic
    // Pass taskDate so availability filtering can exclude on-leave employees
    const recommendations = await getTaskRecommendationsWithFallback(
      employees,
      taskCategory,
      taskPriority || "Medium",
      taskDate || null
    );

    res.status(200).json({
      message: "Task recommendations generated successfully",
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

