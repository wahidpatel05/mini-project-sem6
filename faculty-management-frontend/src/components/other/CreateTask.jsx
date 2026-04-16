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
        const result = await apiService.getTaskRecommendations(category, priority, taskDate || null);

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
  }, [category, priority, taskDate]);

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
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ background: "var(--accent-dim)" }}>
          <ClipboardPlus size={20} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Create Task</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Assign new work to faculty</p>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981" }}>
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
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-muted)" }}>
              Demo Scenarios (Quick Fill)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyDemoScenario("frontend")}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition"
                style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", color: "#2563EB" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(37,99,235,0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(37,99,235,0.08)")}
              >
                Frontend High
              </button>
              <button
                type="button"
                onClick={() => applyDemoScenario("backend")}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              >
                Backend Critical
              </button>
              <button
                type="button"
                onClick={() => applyDemoScenario("analytics")}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.14)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.08)")}
              >
                Analytics High
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>
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
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>
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
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Assign To
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => { setAssignMode("single"); setAssigneeIds([]); }}
                  className="px-2 py-0.5 rounded-full border font-semibold transition"
                  style={assignMode === "single"
                    ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                    : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignMode("multi"); setAssignTo(""); }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold transition"
                  style={assignMode === "multi"
                    ? { background: "#7C3AED", color: "#fff", borderColor: "#7C3AED" }
                    : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }}
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
              <div
                className="rounded-lg max-h-36 overflow-y-auto p-2 space-y-1"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
              >
                {userData?.length === 0 && (
                  <p className="text-xs p-1" style={{ color: "var(--text-muted)" }}>No employees found</p>
                )}
                {userData?.map((emp) => {
                  const checked = assigneeIds.includes(emp._id);
                  return (
                    <label key={emp._id} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1 transition"
                      style={{ background: checked ? "var(--accent-dim)" : "transparent" }}
                      onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = "var(--surface-soft)"; }}
                      onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = "transparent"; }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setAssigneeIds((prev) =>
                            checked ? prev.filter((id) => id !== emp._id) : [...prev, emp._id]
                          );
                        }}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span className="text-sm" style={{ color: "var(--text)" }}>{emp.firstName}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {assignMode === "multi" && assigneeIds.length > 0 && (
              <p className="text-xs mt-1" style={{ color: "#7C3AED" }}>{assigneeIds.length} employee(s) selected — a group chat room will be auto-created.</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>
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
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>
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
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-muted)" }}>
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

          {/* Attachments */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--text-muted)" }}>
              Attachments (Optional)
            </label>
            <div
              className="rounded-lg p-4 text-center transition cursor-pointer"
              style={{ border: "2px dashed var(--border)", background: "var(--surface-soft)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
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
                <Upload size={20} className="mx-auto mb-2" style={{ color: "var(--accent)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Click to upload or drag and drop
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  PDF, JPG, PNG, GIF, WebP (Max 10MB, Max 5 files)
                </p>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-xs truncate" style={{ color: "var(--text)" }}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      style={{ color: "var(--danger)" }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition flex justify-center items-center gap-2 active:scale-[0.98]"
            style={
              loading
                ? { background: "var(--surface-soft)", color: "var(--text-muted)", cursor: "not-allowed" }
                : { background: "var(--accent)", color: "#fff" }
            }
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#1d4ed8"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent)"; }}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>

        </div>

        {/* RIGHT COLUMN — Recommendations */}

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
          />
        </div>

      </form>

    </div>
  );
};

export default CreateTask;