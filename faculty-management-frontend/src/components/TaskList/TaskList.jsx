import React, { useContext, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import AcceptTask from "./AcceptTask";
import NewTask from "./NewTask";
import CompleteTask from "./CompleteTask";
import FailedTask from "./FailedTask";
import { AuthContext } from "../../context/AuthProvider";
import { apiService } from "../../utils/apiService";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const TaskList = ({ data, onOpenTaskChat }) => {
  const scrollContainerRef = useRef(null);

  const [, , { refreshEmployees }] = useContext(AuthContext);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState("");

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionType, setCompletionType] = useState(null);
  const [completionFiles, setCompletionFiles] = useState([]);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState("");

  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeTaskIndex, setPostponeTaskIndex] = useState(null);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeReason, setPostponeReason] = useState("");
  const [postponeLoading, setPostponeLoading] = useState(false);
  const [postponeError, setPostponeError] = useState("");

  /* ─── Update Task Status ─── */

  const updateTaskStatus = async (taskIndex, newStatus, attachments = []) => {
    try {
      await apiService.updateTask(data._id, taskIndex, newStatus, attachments);
      await refreshEmployees();
    } catch (error) {
      console.error("Task update failed:", error);
      alert("Failed to update task");
    }
  };

  /* ─── Completion Flow ─── */

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
      const isValidType = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024;
      if (!isValidType) { setCompletionError("Only PDF and image files (JPEG, PNG, GIF, WebP) are allowed"); return false; }
      if (!isValidSize) { setCompletionError("File size must be less than 10MB"); return false; }
      return true;
    });
    if (validFiles.length + completionFiles.length > 5) { setCompletionError("Maximum 5 files allowed"); return; }
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

  /* ─── Reject Flow ─── */

  const handleRejectClick = (taskIndex) => {
    setSelectedTaskIndex(taskIndex);
    setRejectionReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  const handleRejectTask = async () => {
    if (!rejectionReason.trim()) { setRejectError("Please enter rejection reason"); return; }
    setRejectLoading(true);
    try {
      const response = await apiService.rejectTask(data._id, selectedTaskIndex, rejectionReason);
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

  /* ─── Postpone Flow ─── */

  const handlePostponeClick = (taskIndex, currentDate) => {
    setPostponeTaskIndex(taskIndex);
    setPostponeDate(currentDate || "");
    setPostponeReason("");
    setPostponeError("");
    setShowPostponeModal(true);
  };

  const handleSubmitPostpone = async () => {
    if (!postponeDate) { setPostponeError("Please select a new deadline"); return; }
    if (!postponeReason.trim()) { setPostponeError("Please provide a reason"); return; }
    setPostponeLoading(true);
    try {
      const response = await apiService.requestPostpone(data._id, postponeTaskIndex, postponeDate, postponeReason);
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

  /* ─── UI ─── */

  return (
    <>
      {/* ─── Task Cards ─── */}
      <div className="relative group">
        <button
          onClick={() => scrollContainerRef.current?.scrollBy({ left: -350, behavior: "smooth" })}
          className="absolute top-1/2 left-0 -translate-y-1/2 z-10 p-2 rounded-full border opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hidden sm:block -ml-4"
          style={{ background: "var(--surface-soft)", borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => scrollContainerRef.current?.scrollBy({ left: 350, behavior: "smooth" })}
          className="absolute top-1/2 right-0 -translate-y-1/2 z-10 p-2 rounded-full border opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hidden sm:block -mr-4"
          style={{ background: "var(--surface-soft)", borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <ChevronRight size={22} />
        </button>

        <motion.div
          id="tasklist"
          ref={scrollContainerRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-4 sm:gap-5 overflow-x-auto py-4 px-1 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {data.tasks && data.tasks.map((elem, idx) => {
            const chatBtn = elem.sharedTaskId && onOpenTaskChat ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenTaskChat(elem)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-sm border font-medium transition"
                style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#A78BFA" }}
                title="Open Group Chat for this task"
              >
                <MessageCircle size={12} /> Group Chat
              </motion.button>
            ) : null;

            if (elem.active) return (
              <motion.div key={idx} variants={itemVariants} className="snap-start">
                <AcceptTask data={elem} onComplete={() => handleCompleteClick(idx)} onFail={() => handleFailClick(idx)} onReject={() => handleRejectClick(idx)} onRequestPostpone={() => handlePostponeClick(idx, elem.taskDate)} />
                {chatBtn}
              </motion.div>
            );

            if (elem.newTask) return (
              <motion.div key={idx} variants={itemVariants} className="snap-start">
                <NewTask data={elem} onAccept={() => updateTaskStatus(idx, "active")} onReject={() => handleRejectClick(idx)} onRequestPostpone={() => handlePostponeClick(idx, elem.taskDate)} />
                {chatBtn}
              </motion.div>
            );

            if (elem.completed) return (
              <motion.div key={idx} variants={itemVariants} className="snap-start">
                <CompleteTask data={elem} />
                {chatBtn}
              </motion.div>
            );

            if (elem.failed) return (
              <motion.div key={idx} variants={itemVariants} className="snap-start">
                <FailedTask data={elem} />
                {chatBtn}
              </motion.div>
            );

            if (elem.rejected) return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="snap-start flex-shrink-0 w-full sm:w-[300px] rounded-md p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid #F43F5E" }}
              >
                <h3 className="font-bold text-sm mb-2" style={{ color: "#F43F5E" }}>Rejected Task</h3>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>{elem.taskTitle}</h2>
                <p className="text-xs mt-1.5 line-clamp-3" style={{ color: "var(--text-muted)" }}>{elem.taskDescription}</p>
                <div className="mt-3 p-3 rounded-sm" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Rejection Reason</p>
                  <p className="text-xs" style={{ color: "#F43F5E" }}>{elem.rejectionReason}</p>
                </div>
                {chatBtn}
              </motion.div>
            );

            return null;
          })}
        </motion.div>
      </div>

      {/* ─── Postpone Modal ─── */}
      <AnimatePresence>
        {showPostponeModal && (
          <DarkModal onClose={() => setShowPostponeModal(false)}>
            <h3 className="text-base font-bold mb-4" style={{ color: "#3B82F6" }}>Request Deadline Postpone</h3>
            {postponeError && <ErrorBanner msg={postponeError} />}
            <ModalLabel>New Deadline</ModalLabel>
            <input type="date" value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)} className="input-ui mb-3" />
            <ModalLabel>Reason</ModalLabel>
            <textarea rows={3} value={postponeReason} onChange={(e) => setPostponeReason(e.target.value)} className="input-ui mb-4" placeholder="Explain why you need more time" style={{ resize: "none" }} />
            <ModalButtons
              onCancel={() => setShowPostponeModal(false)}
              onConfirm={handleSubmitPostpone}
              loading={postponeLoading}
              confirmLabel="Submit"
              confirmColor="#3B82F6"
            />
          </DarkModal>
        )}
      </AnimatePresence>

      {/* ─── Completion Modal ─── */}
      <AnimatePresence>
        {showCompletionModal && (
          <DarkModal onClose={() => setShowCompletionModal(false)}>
            <h3 className="text-base font-bold mb-1" style={{ color: completionType === "completed" ? "#10B981" : "#F43F5E" }}>
              {completionType === "completed" ? "Mark as Completed" : "Mark as Failed"}
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              {completionType === "completed" ? "Upload proof of completion (optional)" : "Upload failure details (optional)"}
            </p>
            {completionError && <ErrorBanner msg={completionError} />}

            {/* File Upload Area */}
            <div
              className="rounded-sm p-4 text-center mb-4 transition cursor-pointer"
              style={{ border: "1px dashed var(--border)", background: "var(--surface-soft)" }}
            >
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileSelect} disabled={completionLoading || completionFiles.length >= 5} className="hidden" id="completion-file-input" />
              <label htmlFor="completion-file-input" className="cursor-pointer">
                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>Click to upload or drag and drop</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>PDF, JPG, PNG, GIF, WebP (Max 10MB, 5 files — Optional)</p>
              </label>
            </div>

            {completionFiles.length > 0 && (
              <div className="mb-4 space-y-1.5 max-h-[160px] overflow-y-auto">
                {completionFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-sm" style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}>
                    <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>📄 {file.name}</span>
                    <button type="button" onClick={() => removeCompletionFile(index)} style={{ color: "#F43F5E" }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <ModalButtons
              onCancel={() => setShowCompletionModal(false)}
              onConfirm={handleSubmitCompletion}
              loading={completionLoading}
              confirmLabel="Submit"
              confirmColor={completionType === "completed" ? "#10B981" : "#F43F5E"}
              disabled={completionLoading}
            />
          </DarkModal>
        )}
      </AnimatePresence>

      {/* ─── Reject Modal ─── */}
      <AnimatePresence>
        {showRejectModal && (
          <DarkModal onClose={() => setShowRejectModal(false)}>
            <h3 className="text-base font-bold mb-4" style={{ color: "#F43F5E" }}>Reject Task</h3>
            {rejectError && <ErrorBanner msg={rejectError} />}
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Explain why you are rejecting this task..."
              disabled={rejectLoading}
              className="input-ui mb-4"
              style={{ resize: "none" }}
            />
            <ModalButtons
              onCancel={() => setShowRejectModal(false)}
              onConfirm={handleRejectTask}
              loading={rejectLoading}
              confirmLabel="Reject"
              confirmColor="#F43F5E"
            />
          </DarkModal>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Shared Modal Components ─── */

const DarkModal = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.7)" }}
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 16 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="w-full max-w-md mx-4 rounded-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);

const ModalLabel = ({ children }) => (
  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>{children}</label>
);

const ErrorBanner = ({ msg }) => (
  <div className="mb-3 p-3 rounded-sm text-xs" style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", color: "#F43F5E" }}>
    {msg}
  </div>
);

const ModalButtons = ({ onCancel, onConfirm, loading, confirmLabel, confirmColor, disabled }) => (
  <div className="flex gap-3">
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onCancel}
      disabled={loading}
      className="flex-1 py-2 rounded-sm text-sm font-semibold transition"
      style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
    >
      Cancel
    </motion.button>
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onConfirm}
      disabled={disabled || loading}
      className="flex-1 py-2 rounded-sm text-sm font-semibold transition disabled:opacity-50"
      style={{ background: confirmColor + "20", color: confirmColor, border: `1px solid ${confirmColor}40` }}
      onMouseEnter={e => e.currentTarget.style.background = confirmColor + "35"}
      onMouseLeave={e => e.currentTarget.style.background = confirmColor + "20"}
    >
      {loading ? "Submitting..." : confirmLabel}
    </motion.button>
  </div>
);

export default TaskList;
