const Employee = require("../models/Employee");

// POST /api/leave/request — Employee submits a new leave request
exports.submitLeaveRequest = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "startDate, endDate, and reason are required" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "startDate must be before or equal to endDate" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.leaveRequests.push({ startDate, endDate, reason });
    await employee.save();

    const newRequest = employee.leaveRequests[employee.leaveRequests.length - 1];
    res.status(201).json({ message: "Leave request submitted successfully", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/leave/my-requests — Employee views their own leave history
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const employee = await Employee.findById(employeeId).select("leaveRequests");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const sorted = [...employee.leaveRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json({ leaveRequests: sorted });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/leave/all — Admin views all pending leave requests across all employees
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const employees = await Employee.find({
      "leaveRequests.status": "pending",
    }).select("firstName email leaveRequests");

    const pendingRequests = [];
    employees.forEach((emp) => {
      emp.leaveRequests
        .filter((req) => req.status === "pending")
        .forEach((req) => {
          pendingRequests.push({
            employeeId: emp._id,
            employeeName: emp.firstName,
            employeeEmail: emp.email,
            requestId: req._id,
            startDate: req.startDate,
            endDate: req.endDate,
            reason: req.reason,
            status: req.status,
            createdAt: req.createdAt,
          });
        });
    });

    pendingRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ requests: pendingRequests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/leave/:employeeId/:requestId — Admin approves or rejects a request
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { employeeId, requestId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const request = employee.leaveRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    request.status = status;
    await employee.save();

    res.status(200).json({ message: `Leave request ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
