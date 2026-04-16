const Employee = require("../models/Employee");

/**
 * Returns the availability status of an employee relative to a deadline date.
 * Works synchronously on a populated employee object (no DB call needed).
 *
 * @param {Object} employee - Mongoose employee document or plain object
 * @param {Date|string} deadlineDate - The task deadline date
 * @returns {"available"|"on_leave"|"returning_soon"}
 */
const getAvailabilityStatus = (employee, deadlineDate) => {
  const deadline = new Date(deadlineDate);
  deadline.setHours(0, 0, 0, 0);

  const threeDaysBeforeDeadline = new Date(deadline);
  threeDaysBeforeDeadline.setDate(threeDaysBeforeDeadline.getDate() - 3);

  const approvedLeaves = (employee.leaveRequests || []).filter(
    (req) => req.status === "approved"
  );

  for (const leave of approvedLeaves) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // On leave on the deadline date itself
    if (deadline >= start && deadline <= end) {
      return "on_leave";
    }

    // Leave ends within 3 days before the deadline (returning soon)
    if (end >= threeDaysBeforeDeadline && end < deadline) {
      return "returning_soon";
    }
  }

  return "available";
};

/**
 * Async helper — looks up an employee by ID and checks if they are available
 * (not on an approved leave) on the given targetDate.
 *
 * @param {string} employeeId - MongoDB ObjectId string
 * @param {Date|string} targetDate
 * @returns {Promise<boolean>} true if available, false if on approved leave
 */
const isEmployeeAvailable = async (employeeId, targetDate) => {
  const employee = await Employee.findById(employeeId).select("leaveRequests").lean();
  if (!employee) return true;

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const onLeave = (employee.leaveRequests || []).some((req) => {
    if (req.status !== "approved") return false;
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return target >= start && target <= end;
  });

  return !onLeave;
};

module.exports = { isEmployeeAvailable, getAvailabilityStatus };
