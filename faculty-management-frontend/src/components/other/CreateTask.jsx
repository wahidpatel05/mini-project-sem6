import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { apiService } from "../../utils/apiService";
import { ClipboardPlus, Upload, X, Users } from "lucide-react";
import TaskRecommendation from "./TaskRecommendation";

const CreateTask = () => {

  const [userData, , { refreshEmployees }] =
    useContext(AuthContext);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [assignTo, setAssignTo] = useState(""); // single employee id
  const [assignMode, setAssignMode] = useState("single"); // "single" | "multi"
  const [assigneeIds, setAssigneeIds] = useState([]); // multi-assign ids
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [attachments, setAttachments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");

  const applyDemoScenario = (scenario) => {
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const dueDate = inThreeDays.toISOString().split("T")[0];

    setTaskDate(dueDate);
    setAssignTo("");

    if (scenario === "frontend") {
      setTaskTitle("Presentation UI Polish");
      setTaskDescription("Refine dashboard visuals, responsiveness, and interaction polish for demo.");
      setCategory("Frontend");
      setPriority("High");
      return;
    }

    if (scenario === "backend") {
      setTaskTitle("Critical API Stability Patch");
      setTaskDescription("Harden employee/task APIs and validate error handling paths for production readiness.");
      setCategory("Backend");
      setPriority("Critical");
      return;
    }

    if (scenario === "analytics") {
      setTaskTitle("Analytics KPI Deep-Dive");
      setTaskDescription("Prepare trend insights and validate recommendation quality for presentation metrics.");
      setCategory("Analytics");
      setPriority("High");
    }
  };

  /* ================= Fetch Recommendations ================= */

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!category.trim() || !priority) {
        setRecommendations([]);
        return;
      }

      setRecommendationsLoading(true);
      setRecommendationsError("");

      try {
        const result = await apiService.getTaskRecommendations(category, priority);
        
        if (result.recommendations) {
          setRecommendations(result.recommendations);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        setRecommendationsError(err.message || "Failed to fetch recommendations");
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    // Debounce the API call
    const timer = setTimeout(fetchRecommendations, 500);
    return () => clearTimeout(timer);
  }, [category, priority]);

  /* ================= File Handling ================= */

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      );
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        setError("Only PDF and image files (JPEG, PNG, GIF, WebP) are allowed");
        return false;
      }
      if (!isValidSize) {
        setError("File size must be less than 10MB");
        return false;
      }
      return true;
    });

    if (validFiles.length + attachments.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }

    setAttachments([...attachments, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  /* ================= Validation ================= */

  const validateInputs = () => {

    if (!taskTitle.trim()) {
      setError("Task title is required");
      return false;
    }

    if (!taskDescription.trim()) {
      setError("Task description is required");
      return false;
    }

    if (!taskDate) {
      setError("Deadline date is required");
      return false;
    }

    if (assignMode === "single" && !assignTo) {
      setError("Select an employee");
      return false;
    }

    if (assignMode === "multi" && assigneeIds.length === 0) {
      setError("Select at least one employee");
      return false;
    }

    if (!category.trim()) {
      setError("Category is required");
      return false;
    }

    const selectedDate = new Date(taskDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Task date cannot be in the past");
      return false;
    }

    return true;
  };

  /* ================= Submit ================= */

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateInputs()) return;

    setLoading(true);

    try {

      const newTask = {
        taskTitle,
        taskDescription,
        taskDate,
        category,
        priority,
        active: false,
        newTask: true,
        failed: false,
        completed: false,
        rejected: false,
      };

      if (assignMode === "multi") {
        // Multi-assignee: use the SharedTask endpoint
        await apiService.createSharedTask(newTask, assigneeIds, attachments);
      } else {
        // Single assignee: use existing per-employee endpoint
        await apiService.addTask(assignTo, newTask, attachments);
      }

      await refreshEmployees();

      setSuccess(
        assignMode === "multi"
          ? `Task assigned to ${assigneeIds.length} employee(s)!`
          : "Task created successfully!"
      );

      // Reset form
      setTaskTitle("");
      setTaskDescription("");
      setTaskDate("");
      setAssignTo("");
      setAssigneeIds([]);
      setCategory("");
      setPriority("Medium");
      setAttachments([]);

    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div
      className="
      bg-white/80 backdrop-blur-xl
      rounded-2xl shadow-xl
      border border-gray-200
      p-4 md:p-6
      max-w-5xl
    "
    >
      {/* ================= Header ================= */}

      <div className="flex items-center gap-3 mb-6">

        <div className="p-2 bg-emerald-100 rounded-lg">
          <ClipboardPlus size={20} className="text-emerald-600" />
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-bold text-emerald-600">
            Create Task
          </h2>
          <p className="text-xs text-gray-500">
            Assign new work to employees
          </p>
        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* ================= Form ================= */}

      <form
        onSubmit={submitHandler}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >

        {/* ================= LEFT COLUMN (FORM) ================= */}

        <div className="lg:col-span-2 space-y-4">

          {/* Demo scenario quick presets */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              Demo Scenarios (Quick Fill)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyDemoScenario("frontend")}
                className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
              >
                Frontend High
              </button>
              <button
                type="button"
                onClick={() => applyDemoScenario("backend")}
                className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
              >
                Backend Critical
              </button>
              <button
                type="button"
                onClick={() => applyDemoScenario("analytics")}
                className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
              >
                Analytics High
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Task Title
            </label>
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Design dashboard UI"
              disabled={loading}
              className="input-ui"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Deadline
            </label>
            <input
              type="date"
              value={taskDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setTaskDate(e.target.value)}
              disabled={loading}
              className="input-ui"
            />
          </div>

          {/* Assign */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600">
                Assign To
              </label>
              {/* Toggle single / multi */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => { setAssignMode("single"); setAssigneeIds([]); }}
                  className={`px-2 py-0.5 rounded-full border font-semibold transition ${assignMode === "single" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-300"}`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignMode("multi"); setAssignTo(""); }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold transition ${assignMode === "multi" ? "bg-violet-700 text-white border-violet-700" : "bg-white text-slate-600 border-slate-300"}`}
                >
                  <Users size={11} /> Multi
                </button>
              </div>
            </div>

            {assignMode === "single" ? (
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                disabled={loading}
                className="input-ui"
              >
                <option value="">Select Employee</option>
                {userData?.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="border border-slate-300 rounded-lg bg-white max-h-36 overflow-y-auto p-2 space-y-1">
                {userData?.length === 0 && (
                  <p className="text-xs text-slate-400 p-1">No employees found</p>
                )}
                {userData?.map((emp) => {
                  const checked = assigneeIds.includes(emp._id);
                  return (
                    <label key={emp._id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded px-2 py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setAssigneeIds((prev) =>
                            checked ? prev.filter((id) => id !== emp._id) : [...prev, emp._id]
                          );
                        }}
                        className="accent-violet-700"
                      />
                      <span className="text-sm text-slate-700">{emp.firstName}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {assignMode === "multi" && assigneeIds.length > 0 && (
              <p className="text-xs text-violet-700 mt-1">{assigneeIds.length} employee(s) selected — a group chat room will be auto-created.</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Category
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Design / Backend / Testing"
              disabled={loading}
              className="input-ui"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={loading}
              className="input-ui"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Explain task requirements..."
              disabled={loading}
              rows={5}
              className="input-ui resize-none"
            />
          </div>

          {/* FILE ATTACHMENTS */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-emerald-300 rounded-lg p-4 text-center hover:border-emerald-500 transition cursor-pointer bg-emerald-50">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileSelect}
                disabled={loading || attachments.length >= 5}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload size={20} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-sm font-semibold text-emerald-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG, GIF, WebP (Max 10MB, Max 5 files)
                </p>
              </label>
            </div>

            {/* Attached files list */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg border border-emerald-200"
                  >
                    <span className="text-xs text-gray-700 truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`
            w-full py-3 rounded-lg font-semibold
            transition flex justify-center items-center gap-2
            ${
              loading
                ? "bg-emerald-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            }
          `}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>

        </div>

        {/* ================= RIGHT COLUMN (RECOMMENDATIONS) ================= */}

        <div className="lg:col-span-1">
          <TaskRecommendation
            recommendations={recommendations}
            loading={recommendationsLoading}
            error={recommendationsError}
            selectedEmployeeId={assignTo}
            onSelectEmployee={(employeeId) => {
              setAssignMode("single");
              setAssignTo(employeeId);
            }}
          />        </div>

      </form>

    </div>
  );
};

export default CreateTask;