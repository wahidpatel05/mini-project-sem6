const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  active: Boolean,
  newTask: Boolean,
  completed: Boolean,
  failed: Boolean,
  rejected: Boolean,
  rejectionReason: String,
  taskTitle: String,
  taskDescription: String,
  taskDate: String,
  completedAt: {
    type: Date,
    default: null,
  },
  category: String,
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  // Reference to a SharedTask when assigned to multiple employees.
  // Links this embedded task entry to its parent SharedTask document.
  sharedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SharedTask",
    default: null,
  },
  postponeRequests: [
    {
      requestedDate: String,
      reason: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      respondedAt: Date,
      responseNote: String,
    },
  ],
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const employeeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    taskCounts: {
      active: { type: Number, default: 0 },
      newTask: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
    },
    tasks: [taskSchema],
    leaveRequests: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
