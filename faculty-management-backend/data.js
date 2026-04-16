const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");
const Employee = require("./models/Employee");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected");
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear old data (IMPORTANT)
    await Admin.deleteMany();
    await Employee.deleteMany();

    // ================= ADMIN =================
    const adminPassword = await bcrypt.hash("admin123", 10);

    const admin = await Admin.create({
      email: "admin@test.com",
      password: adminPassword,
    });

    console.log("Admin Created");

    // ================= EMPLOYEES + PRESENTATION TASK DATA =================
    const makeTask = ({
      taskTitle,
      taskDescription,
      taskDate,
      category,
      priority,
      status,
      rejectionReason = "",
    }) => ({
      taskTitle,
      taskDescription,
      taskDate,
      category,
      priority,
      active: status === "active",
      newTask: status === "newTask",
      completed: status === "completed",
      failed: status === "failed",
      rejected: status === "rejected",
      rejectionReason,
      completedAt: status === "completed" ? new Date() : null,
      postponeRequests: [],
      attachments: [],
    });

    const buildTaskCounts = (tasks) => {
      return tasks.reduce(
        (acc, task) => {
          if (task.active) acc.active += 1;
          if (task.newTask) acc.newTask += 1;
          if (task.completed) acc.completed += 1;
          if (task.failed) acc.failed += 1;
          if (task.rejected) acc.rejected += 1;
          return acc;
        },
        { active: 0, newTask: 0, completed: 0, failed: 0, rejected: 0 }
      );
    };

    const employeesData = [
      {
        firstName: "Aarav",
        email: "aarav@test.com",
        password: "1234",
        tasks: [
          makeTask({ taskTitle: "Build Faculty Dashboard UI", taskDescription: "Create responsive admin cards", taskDate: "2026-04-03", category: "Frontend", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Implement Chart Widgets", taskDescription: "Add task trend visualizations", taskDate: "2026-04-05", category: "Frontend", priority: "Medium", status: "completed" }),
          makeTask({ taskTitle: "Fix Tailwind Layout Issues", taskDescription: "Resolve mobile spacing regressions", taskDate: "2026-04-08", category: "Debugging", priority: "Medium", status: "completed" }),
          makeTask({ taskTitle: "Improve Form Validation UX", taskDescription: "Inline validation for create task form", taskDate: "2026-04-11", category: "Frontend", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Optimize Component Render", taskDescription: "Reduce unnecessary re-renders", taskDate: "2026-04-18", category: "Frontend", priority: "Critical", status: "active" }),
          makeTask({ taskTitle: "Polish Employee Dashboard", taskDescription: "Refine cards and spacing for demo", taskDate: "2026-04-21", category: "Frontend", priority: "High", status: "newTask" }),
        ],
      },
      {
        firstName: "Meera",
        email: "meera@test.com",
        password: "1234",
        tasks: [
          makeTask({ taskTitle: "Design Employee API", taskDescription: "CRUD APIs for employee module", taskDate: "2026-04-02", category: "Backend", priority: "Critical", status: "completed" }),
          makeTask({ taskTitle: "JWT Auth Hardening", taskDescription: "Secure middleware and token checks", taskDate: "2026-04-06", category: "Backend", priority: "Critical", status: "completed" }),
          makeTask({ taskTitle: "Task Reassign Endpoint", taskDescription: "Implement task reassignment route", taskDate: "2026-04-09", category: "Backend", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Postpone Approval Logic", taskDescription: "Add postpone approve/reject flow", taskDate: "2026-04-12", category: "Backend", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Email Notification Queue", taskDescription: "Queue mail events for task updates", taskDate: "2026-04-19", category: "Backend", priority: "High", status: "active" }),
          makeTask({ taskTitle: "Analytics API Extension", taskDescription: "Expose monthly summary endpoint", taskDate: "2026-04-22", category: "Backend", priority: "Medium", status: "newTask" }),
        ],
      },
      {
        firstName: "Priya",
        email: "priya@test.com",
        password: "1234",
        tasks: [
          makeTask({ taskTitle: "Regression Test Auth", taskDescription: "Verify admin and employee login", taskDate: "2026-04-04", category: "Testing", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "UI Smoke Test", taskDescription: "Validate key page rendering", taskDate: "2026-04-07", category: "Testing", priority: "Medium", status: "completed" }),
          makeTask({ taskTitle: "API Contract Check", taskDescription: "Verify response consistency", taskDate: "2026-04-10", category: "Testing", priority: "Medium", status: "completed" }),
          makeTask({ taskTitle: "Attachment Upload Test", taskDescription: "Run edge cases for file upload", taskDate: "2026-04-13", category: "Testing", priority: "High", status: "failed" }),
          makeTask({ taskTitle: "Pre-demo QA Sweep", taskDescription: "Final QA for all dashboards", taskDate: "2026-04-20", category: "Testing", priority: "Critical", status: "active" }),
          makeTask({ taskTitle: "Cross-browser Checklist", taskDescription: "Validate Chrome/Edge/Firefox", taskDate: "2026-04-23", category: "Testing", priority: "Medium", status: "newTask" }),
        ],
      },
      {
        firstName: "Neha",
        email: "neha@test.com",
        password: "1234",
        tasks: [
          makeTask({ taskTitle: "Project README Draft", taskDescription: "Write setup and modules overview", taskDate: "2026-04-01", category: "Documentation", priority: "Low", status: "completed" }),
          makeTask({ taskTitle: "API Usage Guide", taskDescription: "Document auth and employee endpoints", taskDate: "2026-04-05", category: "Documentation", priority: "Medium", status: "completed" }),
          makeTask({ taskTitle: "Feature Walkthrough Slides", taskDescription: "Prepare presentation narrative", taskDate: "2026-04-11", category: "Documentation", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Release Notes", taskDescription: "Summarize recent sprint updates", taskDate: "2026-04-14", category: "Documentation", priority: "Low", status: "completed" }),
          makeTask({ taskTitle: "Demo Script Notes", taskDescription: "Write presenter cue notes", taskDate: "2026-04-20", category: "Documentation", priority: "High", status: "active" }),
          makeTask({ taskTitle: "Final Report Formatting", taskDescription: "Align report styling and citations", taskDate: "2026-04-24", category: "Documentation", priority: "Medium", status: "newTask" }),
        ],
      },
      {
        firstName: "Vikram",
        email: "vikram@test.com",
        password: "1234",
        tasks: [
          makeTask({ taskTitle: "Legacy Bug Cleanup", taskDescription: "Fix inherited backend issues", taskDate: "2026-04-02", category: "Debugging", priority: "High", status: "failed" }),
          makeTask({ taskTitle: "Task Schema Refactor", taskDescription: "Refactor old task flags", taskDate: "2026-04-06", category: "Backend", priority: "High", status: "rejected", rejectionReason: "Incomplete implementation details" }),
          makeTask({ taskTitle: "State Sync Fix", taskDescription: "Fix stale context state bugs", taskDate: "2026-04-09", category: "Debugging", priority: "Critical", status: "failed" }),
          makeTask({ taskTitle: "Notification Retry Logic", taskDescription: "Handle transient mail failures", taskDate: "2026-04-15", category: "Backend", priority: "Medium", status: "active" }),
          makeTask({ taskTitle: "Metrics Cleanup", taskDescription: "Normalize historical task counters", taskDate: "2026-04-22", category: "Backend", priority: "High", status: "newTask" }),
          makeTask({ taskTitle: "Patch Old API Tests", taskDescription: "Repair outdated integration tests", taskDate: "2026-04-24", category: "Testing", priority: "Medium", status: "newTask" }),
        ],
      },
      {
        firstName: "Isha",
        email: "isha@test.com",
        password: "1234",
        tasks: [
          makeTask({ taskTitle: "Attendance Trend Analysis", taskDescription: "Analyze faculty attendance data", taskDate: "2026-04-03", category: "Analytics", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Performance KPI Summary", taskDescription: "Build completion/failure insights", taskDate: "2026-04-07", category: "Analytics", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Report Chart Dataset", taskDescription: "Prepare monthly chart data", taskDate: "2026-04-12", category: "Analytics", priority: "Medium", status: "completed" }),
          makeTask({ taskTitle: "Recommendation Benchmark", taskDescription: "Compare rule vs ml scores", taskDate: "2026-04-18", category: "Analytics", priority: "Critical", status: "completed" }),
          makeTask({ taskTitle: "Forecast Validation", taskDescription: "Validate 7-day forecast cards", taskDate: "2026-04-23", category: "Analytics", priority: "High", status: "completed" }),
          makeTask({ taskTitle: "Data Export Review", taskDescription: "Verify CSV export quality", taskDate: "2026-04-25", category: "Analytics", priority: "Medium", status: "active" }),
        ],
      },
    ];

    const employees = [];
    for (const emp of employeesData) {
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      employees.push({
        firstName: emp.firstName,
        email: emp.email,
        password: hashedPassword,
        passwordChangedAt: null,
        tasks: emp.tasks,
        taskCounts: buildTaskCounts(emp.tasks),
      });
    }

    await Employee.insertMany(employees);
    console.log("Employees Created with presentation task history");

    console.log("Seeding Completed Successfully");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();