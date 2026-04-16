import React from "react";
import { motion } from "framer-motion";

import { CheckCircle2, Calendar, FileText } from "lucide-react";
import { getFileUrl } from "../../utils/apiService";

const isImageFile = (fileName) => {
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return imageExts.some((ext) => fileName.toLowerCase().endsWith(ext));
};

const CompleteTask = ({ data }) => {
  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col h-full w-full rounded-md p-4 sm:p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid #10B981",
      }}
    >
      {/* ─── Header ─── */}
      <div className="flex justify-between items-start gap-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-sm"
          style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          {data.category}
        </span>
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
                  ? <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#10B981" }} />
                  : <FileText size={11} style={{ color: "#10B981" }} />}
                <span className="truncate max-w-[120px]">{attachment.fileName}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── Status ─── */}
      <div
        className="mt-auto pt-4 flex items-center justify-center gap-2 rounded-sm text-xs font-semibold"
      >
        <div className="w-full py-2 flex items-center justify-center gap-2 rounded-sm"
          style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <CheckCircle2 size={14} />
          Completed
        </div>
      </div>

      {data.completedAt && (
        <p className="mt-2 text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Completed at {formatDateTime(data.completedAt)}
        </p>
      )}
    </motion.div>
  );
};

export default CompleteTask;
