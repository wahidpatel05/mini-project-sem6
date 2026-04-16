import React from "react";
import { Calendar, PlusCircle, XCircle, FileText } from "lucide-react";
import { getFileUrl } from "../../utils/apiService";

const NewTask = ({ data, onAccept, onReject, onRequestPostpone }) => {

  const priorityStyles = {
    Critical: "bg-orange-100 text-orange-700 ring-1 ring-orange-300",
    High: "bg-red-100 text-red-700 ring-1 ring-red-300",
    Medium: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300",
    Low: "bg-green-100 text-green-700 ring-1 ring-green-300",
  };

  const priorityText = {
    Critical: "Critical",
    High: "High",
    Medium: "Medium",
    Low: "Low",
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
      border border-gray-200
      shadow-lg hover:shadow-xl
      transition-all duration-300
      p-4 sm:p-5
      hover:-translate-y-1
    "
    >
      {/* ================= Header ================= */}
      <div className="flex justify-between items-start gap-2">

        <div className="flex flex-wrap items-center gap-2">

          {/* Category */}
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            {data.category}
          </span>

          {/* Priority */}
          {data.priority && (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${priorityStyles[data.priority]}`}
            >
              {priorityText[data.priority]}
            </span>
          )}

        </div>

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
        <div className="mt-3 pt-3 border-t border-gray-200">
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

      {/* ================= Action Buttons ================= */}
      <div className="mt-5 space-y-2">

        <button
          onClick={onAccept}
          className="
          flex items-center justify-center gap-2 w-full
          bg-emerald-600 hover:bg-emerald-700
          text-white text-xs sm:text-sm
          py-2 rounded-lg font-semibold
          transition active:scale-95
        "
        >
          <PlusCircle size={16} />
          Accept Task
        </button>

        <button
          onClick={onReject}
          className="
          flex items-center justify-center gap-2 w-full
          bg-rose-600 hover:bg-rose-700
          text-white text-xs sm:text-sm
          py-2 rounded-lg font-semibold
          transition active:scale-95
        "
        >
          <XCircle size={16} />
          Reject Task
        </button>

        <button
          onClick={onRequestPostpone}
          className="
          flex items-center justify-center gap-2 w-full
          bg-indigo-600 hover:bg-indigo-700
          text-white text-xs sm:text-sm
          py-2 rounded-lg font-semibold
          transition active:scale-95
        "
        >
          <Calendar size={16} />
          Request Postpone
        </button>

      </div>

    </div>
  );
};

export default NewTask;
