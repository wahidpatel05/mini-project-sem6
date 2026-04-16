import React from "react";
import { CheckCircle2, Calendar, FileText } from "lucide-react";
import { getFileUrl } from "../../utils/apiService";

const CompleteTask = ({ data }) => {
  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };
  const isImageFile = (fileName) => {
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExts.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  return (
    <div
      className="
      flex-shrink-0
      w-full sm:w-[320px]
      rounded-2xl
      bg-white/80 backdrop-blur-lg
      border border-emerald-200
      shadow-lg hover:shadow-xl
      transition-all duration-300
      p-4 sm:p-5
      hover:-translate-y-1
    "
    >
      {/* ================= Header ================= */}
      <div className="flex justify-between items-start gap-2">

        {/* Category */}
        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
          {data.category}
        </span>

        {/* Date */}
        <div className="flex items-center gap-1 text-gray-500 text-xs whitespace-nowrap">
          <Calendar size={14} />
          {data.taskDate}
        </div>

      </div>

      {/* ================= Title ================= */}
      <h2 className="mt-4 text-base sm:text-lg font-semibold text-gray-800 line-clamp-1">
        {data.taskTitle}
      </h2>

      {/* ================= Description ================= */}
      <p className="text-sm mt-2 text-gray-600 line-clamp-3">
        {data.taskDescription}
      </p>

      {/* ================= Attachments ================= */}
      {data.attachments && data.attachments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-emerald-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Attachments:</p>
          <div className="flex flex-wrap gap-2">
            {data.attachments.map((attachment, index) => (
              <a
                key={index}
                href={getFileUrl(attachment.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded px-2 py-1 text-xs transition"
              >
                {isImageFile(attachment.fileName) ? (
                  <span className="w-3 h-3 rounded bg-emerald-300 inline-block" />
                ) : (
                  <FileText size={12} className="text-emerald-600" />
                )}
                <span className="truncate max-w-[150px] text-emerald-700">
                  {attachment.fileName}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ================= Completed Status ================= */}
      <div
        className="
        mt-5 flex items-center justify-center gap-2
        bg-emerald-100/80 backdrop-blur
        text-emerald-700
        rounded-xl py-2
        text-sm font-semibold
        border border-emerald-300
        shadow-inner
      "
      >
        <CheckCircle2 size={16} />
        Completed
      </div>

      {data.completedAt && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Completed at {formatDateTime(data.completedAt)}
        </p>
      )}

    </div>
  );
};

export default CompleteTask;
