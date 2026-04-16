import React from "react";
import { motion } from "framer-motion";
import { Calendar, PlusCircle, XCircle, FileText } from "lucide-react";
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

const NewTask = ({ data, onAccept, onReject, onRequestPostpone }) => {
  const borderColor = data.priority ? (priorityBorderColor[data.priority] || "#10B981") : "#10B981";
  const badge = data.priority ? (priorityBadge[data.priority] || null) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      className="flex-shrink-0 w-full sm:w-[300px] rounded-md p-4 sm:p-5 relative"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      {/* ─── Header ─── */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-sm"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            {data.category}
          </span>
          {badge && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-sm"
              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
            >
              {data.priority}
            </span>
          )}
        </div>
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
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAccept}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-sm text-xs font-semibold transition"
          style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.15)"}
        >
          <PlusCircle size={14} />
          Accept Task
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onReject}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-sm text-xs font-semibold transition"
          style={{ background: "rgba(244,63,94,0.12)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.25)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.22)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(244,63,94,0.12)"}
        >
          <XCircle size={14} />
          Reject Task
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRequestPostpone}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-sm text-xs font-semibold transition"
          style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.25)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.22)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.12)"}
        >
          <Calendar size={14} />
          Request Postpone
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NewTask;
