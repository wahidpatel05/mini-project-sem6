import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Calendar, FileText } from "lucide-react";
import { getFileUrl } from "../../utils/apiService";

const priorityBorderColor = {
  Critical: "#F59E0B",
  High:     "#F43F5E",
  Medium:   "#F59E0B",
  Low:      "#10B981",
};

const priorityBadge = {
  Critical: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" },
  High:     { bg: "rgba(244,63,94,0.12)",  color: "#F43F5E", border: "rgba(244,63,94,0.3)" },
  Medium:   { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" },
  Low:      { bg: "rgba(16,185,129,0.12)", color: "#10B981", border: "rgba(16,185,129,0.3)" },
};

const isImageFile = (fileName) => {
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return imageExts.some((ext) => fileName.toLowerCase().endsWith(ext));
};

const AcceptTask = ({ data, onComplete, onFail, onReject, onRequestPostpone }) => {
  const borderColor = data.priority ? (priorityBorderColor[data.priority] || "#3B82F6") : "#3B82F6";
  const badge = data.priority ? (priorityBadge[data.priority] || priorityBadge.Medium) : null;
  const isUrgent = data.priority === "Critical" || data.priority === "High";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      className="flex-shrink-0 w-full sm:w-[300px] rounded-md p-4 sm:p-5 relative overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* ─── Header ─── */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-sm"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            {data.category}
          </span>
          {/* Priority */}
          {badge && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-sm"
              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
            >
              {isUrgent && <span className="animate-softPulse inline-block mr-1">●</span>}
              {data.priority}
            </span>
          )}
        </div>
        {/* Date */}
        <div className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
          <Calendar size={13} />
          {data.taskDate}
        </div>
      </div>

      {/* ─── Title ─── */}
      <h2 className="mt-3 text-sm font-semibold line-clamp-1" style={{ color: "var(--text)" }}>
        {data.taskTitle}
      </h2>

      {/* ─── Description ─── */}
      <p className="text-xs mt-1.5 line-clamp-3" style={{ color: "var(--text-muted)" }}>
        {data.taskDescription}
      </p>

      {/* ─── Attachments ─── */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Attachments:</p>
          <div className="flex flex-wrap gap-1.5">
            {data.attachments.map((attachment, index) => (
              <a
                key={index}
                href={getFileUrl(attachment.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs transition"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                {isImageFile(attachment.fileName)
                  ? <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--accent)" }} />
                  : <FileText size={11} style={{ color: "var(--accent)" }} />}
                <span className="truncate max-w-[120px]">{attachment.fileName}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── Actions ─── */}
      <div className="mt-4 space-y-2">
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Upload proof files when completing</p>
        <div className="flex gap-2">
          <ActionButton onClick={onComplete} color="#10B981" dimColor="rgba(16,185,129,0.15)" icon={<CheckCircle size={14} />} label="Complete" />
          <ActionButton onClick={onFail} color="#F43F5E" dimColor="rgba(244,63,94,0.15)" icon={<XCircle size={14} />} label="Failed" />
        </div>
        <ActionButton onClick={onReject} color="#F59E0B" dimColor="rgba(245,158,11,0.15)" icon={<XCircle size={14} />} label="Reject Task" full />
        <ActionButton onClick={onRequestPostpone} color="#3B82F6" dimColor="rgba(59,130,246,0.15)" icon={<Calendar size={14} />} label="Request Postpone" full />
      </div>
    </motion.div>
  );
};

const ActionButton = ({ onClick, color, dimColor, icon, label, full }) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`${full ? "w-full" : "flex-1"} flex items-center justify-center gap-1.5 py-2 rounded-sm text-xs font-semibold transition`}
    style={{ background: dimColor, color, border: `1px solid ${color}33` }}
    onMouseEnter={e => e.currentTarget.style.background = color + "30"}
    onMouseLeave={e => e.currentTarget.style.background = dimColor}
  >
    {icon}
    {label}
  </motion.button>
);

export default AcceptTask;
