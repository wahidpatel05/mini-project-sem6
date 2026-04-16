import React, { useMemo, useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";

// ---------- helpers ----------
const formatRelative = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getBadgeStyles = (type) => {
  switch (type) {
    case "postpone-request":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "postpone-approved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "postpone-rejected":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "failed":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "new-task":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// ---------- notification builder ----------
const buildNotifications = (mode, data) => {
  if (!data) return [];

  const employees = Array.isArray(data) ? data : [data];
  const notifications = [];

  employees.forEach((employee) => {
    employee.tasks?.forEach((task) => {
      const base = {
        employeeName: employee.firstName,
        taskTitle: task.taskTitle,
      };

      if (task.newTask) {
        notifications.push({
          ...base,
          type: "new-task",
          title: "New task",
          message:
            mode === "admin"
              ? `${employee.firstName} was assigned "${task.taskTitle}"`
              : `You were assigned "${task.taskTitle}"`,
          time: normalizeDate(task.taskDate),
        });
      }

      if (task.completed && task.completedAt) {
        notifications.push({
          ...base,
          type: "completed",
          title: "Completed",
          message:
            mode === "admin"
              ? `${employee.firstName} completed "${task.taskTitle}"`
              : `You completed "${task.taskTitle}"`,
          time: normalizeDate(task.completedAt),
        });
      }

      if (task.failed) {
        notifications.push({
          ...base,
          type: "failed",
          title: "Failed",
          message:
            mode === "admin"
              ? `${employee.firstName} failed "${task.taskTitle}"`
              : `Task failed: "${task.taskTitle}"`,
          time: normalizeDate(task.taskDate),
        });
      }

      task.postponeRequests?.forEach((request) => {
        if (mode === "admin" && request.status === "pending") {
          notifications.push({
            ...base,
            type: "postpone-request",
            title: "Postpone request",
            message: `${employee.firstName} requested ${request.requestedDate} for "${task.taskTitle}"`,
            time: normalizeDate(request.requestedAt),
          });
        }

        if (mode === "employee" && request.status === "approved") {
          notifications.push({
            ...base,
            type: "postpone-approved",
            title: "Approved",
            message: `Deadline updated to ${request.requestedDate}`,
            time: normalizeDate(request.respondedAt),
          });
        }

        if (mode === "employee" && request.status === "rejected") {
          notifications.push({
            ...base,
            type: "postpone-rejected",
            title: "Rejected",
            message: `Postpone rejected for "${task.taskTitle}"`,
            time: normalizeDate(request.respondedAt),
          });
        }
      });
    });
  });

  return notifications
    .filter((item) => item.time)
    .sort((a, b) => b.time - a.time);
};

// ---------- main component ----------
const NotificationsPanel = ({ mode = "employee", data }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const notifications = useMemo(
    () => buildNotifications(mode, data),
    [mode, data]
  );

  const visibleNotifications = notifications.slice(0, 8);

  // close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl bg-white shadow hover:shadow-md transition"
      >
        
        <Bell size={20} />

        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] max-h-[420px] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-indigo-600">
              Notifications
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>

          {visibleNotifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {visibleNotifications.map((item, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyles(
                        item.type
                      )}`}
                    >
                      {item.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelative(item.time)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;