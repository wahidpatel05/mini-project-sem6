const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(admin._id, "admin");

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: { id: admin._id, email: admin.email, role: "admin" },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Admin Profile (used by employees to resolve the admin's ID for direct chat).
// This system has a single admin account; findOne() with no filter is intentional.
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({}, "_id email").lean();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ _id: admin._id, email: admin.email });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Employee Login
exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(employee._id, "employee");

    res.status(200).json({
      message: "Employee login successful",
      token,
      employee: {
        _id: employee._id,
        id: employee._id,
        firstName: employee.firstName,
        email: employee.email,
        role: "employee",
        isFirstLogin: employee.isFirstLogin,
        passwordChangedAt: employee.passwordChangedAt,
        taskCounts: employee.taskCounts,
        tasks: employee.tasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
