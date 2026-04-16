const mongoose = require("mongoose");

const sharedTaskSchema = new mongoose.Schema(
  {
    taskTitle: { type: String, required: true },
    taskDescription: { type: String, required: true },
    taskDate: { type: String, required: true },
    category: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    assignees: [
      {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
        employeeName: { type: String, required: true },
      },
    ],
    // Status flags (shared across all assignees)
    active: { type: Boolean, default: false },
    newTask: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
    failed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    createdByAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedTask", sharedTaskSchema);
