import React, { useContext, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import AcceptTask from "./AcceptTask";
import NewTask from "./NewTask";
import CompleteTask from "./CompleteTask";
import FailedTask from "./FailedTask";
import { AuthContext } from "../../context/AuthProvider";
import { apiService } from "../../utils/apiService";

const TaskList = ({ data, onOpenTaskChat }) => {
  const scrollContainerRef = useRef(null);

  const [, , { refreshEmployees }] =
    useContext(AuthContext);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState("");

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionType, setCompletionType] = useState(null); // "completed" or "failed"
  const [completionFiles, setCompletionFiles] = useState([]);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState("");

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeTaskIndex, setPostponeTaskIndex] = useState(null);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeReason, setPostponeReason] = useState("");
  const [postponeLoading, setPostponeLoading] = useState(false);
  const [postponeError, setPostponeError] = useState("");

  /* ================= Update Task Status ================= */

  const updateTaskStatus = async (taskIndex, newStatus, attachments = []) => {
    try {
      await apiService.updateTask(data._id, taskIndex, newStatus, attachments);
      await refreshEmployees();
    } catch (error) {
      console.error("Task update failed:", error);
      alert("Failed to update task");
    }
  };

  /* ================= Completion with Proof Flow ================= */

  const handleCompleteClick = (taskIndex) => {
    setSelectedTaskIndex(taskIndex);
    setCompletionType("completed");
    setCompletionFiles([]);
    setCompletionError("");
    setShowCompletionModal(true);
  };

  const handleFailClick = (taskIndex) => {
    setSelectedTaskIndex(taskIndex);
    setCompletionType("failed");
    setCompletionFiles([]);
    setCompletionError("");
    setShowCompletionModal(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      );
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        setCompletionError("Only PDF and image files (JPEG, PNG, GIF, WebP) are allowed");
        return false;
      }
      if (!isValidSize) {
        setCompletionError("File size must be less than 10MB");
        return false;
      }
      return true;
    });

    if (validFiles.length + completionFiles.length > 5) {
      setCompletionError("Maximum 5 files allowed");
      return;
    }

    setCompletionFiles([...completionFiles, ...validFiles]);
  };

  const removeCompletionFile = (index) => {
    setCompletionFiles(completionFiles.filter((_, i) => i !== index));
  };

  const handleSubmitCompletion = async () => {
    setCompletionLoading(true);

    try {
      await updateTaskStatus(selectedTaskIndex, completionType, completionFiles);
      setShowCompletionModal(false);
      setSelectedTaskIndex(null);
      setCompletionType(null);
      setCompletionFiles([]);
      setCompletionError("");
    } catch (error) {
      setCompletionError(error.message || "Failed to update task");
    } finally {
      setCompletionLoading(false);
    }
  };

  /* ================= Reject Flow ================= */

  const handleRejectClick = (taskIndex) => {
    setSelectedTaskIndex(taskIndex);
    setRejectionReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  const handleRejectTask = async () => {
    if (!rejectionReason.trim()) {
      setRejectError("Please enter rejection reason");
      return;
    }

    setRejectLoading(true);

    try {
      const response = await apiService.rejectTask(
        data._id,
        selectedTaskIndex,
        rejectionReason
      );

      if (response.message) {
        setShowRejectModal(false);
        setSelectedTaskIndex(null);
        setRejectionReason("");
        await refreshEmployees();
      } else {
        setRejectError(response.error || "Rejection failed");
      }
    } catch (error) {
      setRejectError(error.message || "Rejection failed");
    } finally {
      setRejectLoading(false);
    }
  };

  /* ================= Postpone Request Flow ================= */

  const handlePostponeClick = (taskIndex, currentDate) => {
    setPostponeTaskIndex(taskIndex);
    setPostponeDate(currentDate || "");
    setPostponeReason("");
    setPostponeError("");
    setShowPostponeModal(true);
  };

  const handleSubmitPostpone = async () => {
    if (!postponeDate) {
      setPostponeError("Please select a new deadline");
      return;
    }

    if (!postponeReason.trim()) {
      setPostponeError("Please provide a reason");
      return;
    }

    setPostponeLoading(true);

    try {
      const response = await apiService.requestPostpone(
        data._id,
        postponeTaskIndex,
        postponeDate,
        postponeReason
      );

      if (response.employee) {
        setShowPostponeModal(false);
        setPostponeTaskIndex(null);
        setPostponeDate("");
        setPostponeReason("");
        setPostponeError("");
        await refreshEmployees();
      } else {
        setPostponeError(response.error || response.message || "Request failed");
      }
    } catch (error) {
      setPostponeError(error.message || "Request failed");
    } finally {
      setPostponeLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {/* ================= Task Cards Container Wrapper ================= */}
      <div className="relative group">
        <button
          onClick={() => scrollContainerRef.current?.scrollBy({ left: -350, behavior: "smooth" })}
          className="absolute top-1/2 left-0 -translate-y-1/2 z-10 p-2 
                     bg-white border text-slate-700 border-slate-200 
                     rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                     opacity-0 group-hover:opacity-100 hover:bg-slate-50 focus:opacity-100 transition-all
                     hidden sm:block -ml-4"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => scrollContainerRef.current?.scrollBy({ left: 350, behavior: "smooth" })}
          className="absolute top-1/2 right-0 -translate-y-1/2 z-10 p-2 
                     bg-white border text-slate-700 border-slate-200 
                     rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                     opacity-0 group-hover:opacity-100 hover:bg-slate-50 focus:opacity-100 transition-all
                     hidden sm:block -mr-4"
        >
          <ChevronRight size={24} />
        </button>

      <div
        id="tasklist"
        ref={scrollContainerRef}
        className="
        flex gap-4 sm:gap-6
        overflow-x-auto
        py-4 px-1
        snap-x snap-mandatory
        scrollbar-none sm:scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-transparent
        scroll-smooth
        "
      >
        {data.tasks &&
          data.tasks.map((elem, idx) => {
            const chatBtn = elem.sharedTaskId && onOpenTaskChat ? (
              <button
                onClick={() => onOpenTaskChat(elem)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 transition font-medium"
                title="Open Group Chat for this task"
              >
                <MessageCircle size={12} /> Group Chat
              </button>
            ) : null;

            if (elem.active) {
              return (
                <div key={idx} className="snap-start">
                  <AcceptTask
                    data={elem}
                    onComplete={() =>
                      handleCompleteClick(idx)
                    }
                    onFail={() =>
                      handleFailClick(idx)
                    }
                    onReject={() => handleRejectClick(idx)}
                    onRequestPostpone={() => handlePostponeClick(idx, elem.taskDate)}
                  />
                  {chatBtn}
                </div>
              );
            }

            if (elem.newTask) {
              return (
                <div key={idx} className="snap-start">
                  <NewTask
                    data={elem}
                    onAccept={() =>
                      updateTaskStatus(idx, "active")
                    }
                    onReject={() => handleRejectClick(idx)}
                    onRequestPostpone={() => handlePostponeClick(idx, elem.taskDate)}
                  />
                  {chatBtn}
                </div>
              );
            }

            if (elem.completed) {
              return (
                <div key={idx} className="snap-start">
                  <CompleteTask data={elem} />
                  {chatBtn}
                </div>
              );
            }

            if (elem.failed) {
              return (
                <div key={idx} className="snap-start">
                  <FailedTask data={elem} />
                  {chatBtn}
                </div>
              );
            }

            if (elem.rejected) {
              return (
                <div
                  key={idx}
                  className="
                  snap-start
                  w-full sm:w-[320px]
                  bg-white/80 backdrop-blur-lg
                  rounded-2xl
                  border border-rose-200
                  shadow-lg
                  p-4
                "
                >
                  <h3 className="text-rose-600 font-bold text-lg mb-2">
                    Rejected Task
                  </h3>

                  <h2 className="font-semibold text-gray-800 text-base">
                    {elem.taskTitle}
                  </h2>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {elem.taskDescription}
                  </p>

                  <div className="mt-3 p-3 bg-rose-100 rounded-xl border border-rose-300">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-rose-700">
                      {elem.rejectionReason}
                    </p>
                  </div>
                  {chatBtn}
                </div>
              );
            }

            return null;
          })}
      </div>
      </div>

      {/* ================= Postpone Request Modal ================= */}

      {showPostponeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="
            bg-white rounded-2xl shadow-xl
            p-5 sm:p-6
            w-full max-w-md mx-4
            border border-gray-200
          "
          >
            <h3 className="text-lg font-bold text-indigo-600 mb-4">
              Request Deadline Postpone
            </h3>

            {postponeError && (
              <p className="bg-red-100 text-red-600 p-2 rounded mb-3">
                {postponeError}
              </p>
            )}

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Deadline
            </label>
            <input
              type="date"
              value={postponeDate}
              onChange={(e) => setPostponeDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              rows={3}
              value={postponeReason}
              onChange={(e) => setPostponeReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Explain why you need more time"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowPostponeModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPostpone}
                disabled={postponeLoading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
              >
                {postponeLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Completion Modal with File Upload ================= */}

      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div
            className="
            bg-white rounded-2xl shadow-xl
            p-5 sm:p-6
            w-full max-w-md mx-4
            border border-gray-200
            animate-scaleIn
            max-h-[90vh] overflow-y-auto
          "
          >
            <h3 className={`text-xl font-bold mb-4 ${completionType === "completed" ? "text-emerald-600" : "text-rose-600"}`}>
              {completionType === "completed" ? "Mark as Completed" : "Mark as Failed"}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {completionType === "completed"
                ? "Upload proof of completion (optional)"
                : "Upload failure details (optional)"}
            </p>

            {completionError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {completionError}
              </div>
            )}

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition cursor-pointer bg-gray-50 mb-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileSelect}
                disabled={completionLoading || completionFiles.length >= 5}
                className="hidden"
                id="completion-file-input"
              />
              <label htmlFor="completion-file-input" className="cursor-pointer">
                <p className="text-sm font-semibold text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG, GIF, WebP (Max 10MB, Max 5 files - Optional)
                </p>
              </label>
            </div>

            {/* Attached files list */}
            {completionFiles.length > 0 && (
              <div className="mb-4 space-y-2 max-h-[200px] overflow-y-auto">
                {completionFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200"
                  >
                    <span className="text-xs text-gray-700 truncate">
                      📄 {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCompletionFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => setShowCompletionModal(false)}
                disabled={completionLoading}
                className="
                flex-1 py-2 rounded-lg
                bg-gray-200 hover:bg-gray-300
                text-gray-800 font-semibold
                transition
              "
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitCompletion}
                disabled={completionLoading}
                className={`
                flex-1 py-2 rounded-lg
                font-semibold
                transition disabled:opacity-60
                ${completionType === "completed"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-rose-500 hover:bg-rose-600 text-white"
                }
              `}
              >
                {completionLoading ? "Submitting..." : "Submit"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ================= Reject Modal ================= */}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div
            className="
            bg-white rounded-2xl shadow-xl
            p-5 sm:p-6
            w-full max-w-md mx-4
            border border-gray-200
            animate-scaleIn
          "
          >
            <h3 className="text-xl font-bold text-rose-600 mb-4">
              Reject Task
            </h3>

            {rejectError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {rejectError}
              </div>
            )}

            <textarea
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(e.target.value)
              }
              rows="4"
              placeholder="Explain why you are rejecting this task..."
              disabled={rejectLoading}
              className="
              w-full p-3 rounded-lg
              bg-gray-50 border border-gray-300
              focus:ring-2 focus:ring-rose-400 focus:border-rose-400
              outline-none resize-none transition
              text-sm
            "
            />

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => setShowRejectModal(false)}
                disabled={rejectLoading}
                className="
                flex-1 py-2 rounded-lg
                bg-gray-200 hover:bg-gray-300
                text-gray-800 font-semibold
                transition
              "
              >
                Cancel
              </button>

              <button
                onClick={handleRejectTask}
                disabled={rejectLoading}
                className="
                flex-1 py-2 rounded-lg
                bg-rose-500 hover:bg-rose-600
                text-white font-semibold
                transition disabled:opacity-60
              "
              >
                {rejectLoading ? "Rejecting..." : "Reject"}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskList;
