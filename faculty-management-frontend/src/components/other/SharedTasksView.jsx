import React, { useEffect, useState } from "react";
import { apiService } from "../../utils/apiService";
import ChatRoom from "./ChatRoom";
import { MessageCircle, RefreshCw, Users } from "lucide-react";

const PRIORITY_COLOR = {
  Low: "bg-sky-100 text-sky-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const STATUS_LABEL = (task) => {
  if (task.completed) return { label: "Completed", cls: "bg-emerald-100 text-emerald-700" };
  if (task.failed) return { label: "Failed", cls: "bg-red-100 text-red-700" };
  if (task.active) return { label: "Active", cls: "bg-yellow-100 text-yellow-700" };
  return { label: "New", cls: "bg-sky-100 text-sky-700" };
};

const SharedTasksView = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openChatTaskId, setOpenChatTaskId] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.getAllSharedTasks();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setError(data.message || "Failed to load shared tasks");
      }
    } catch {
      setError("Failed to load shared tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-violet-600" />
          <h3 className="font-semibold text-slate-800">Multi-Assignee Tasks</h3>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button
          onClick={fetchTasks}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-2 py-1 transition"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm py-8 text-center">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="text-slate-400 text-sm py-8 text-center">No multi-assignee tasks yet. Create one from "Create Task".</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const status = STATUS_LABEL(task);
            const chatRoomId = `task_${task._id}`;
            const isChatOpen = openChatTaskId === task._id;
            return (
              <div key={task._id} className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{task.taskTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.taskDescription}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority] || "bg-slate-100 text-slate-600"}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Due: {task.taskDate}
                      </span>
                    </div>
                    {/* Assignees */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.assignees?.map((a) => (
                        <span key={a.employeeId?._id || a.employeeId} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">
                          {a.employeeName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chat button */}
                  <button
                    onClick={() => setOpenChatTaskId(isChatOpen ? null : task._id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition flex-shrink-0 ${
                      isChatOpen
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <MessageCircle size={13} />
                    {isChatOpen ? "Close Chat" : "Group Chat"}
                  </button>
                </div>

                {/* Inline chat panel */}
                {isChatOpen && (
                  <div className="mt-3 h-80">
                    <ChatRoom
                      roomId={chatRoomId}
                      roomLabel={`Task: ${task.taskTitle}`}
                      currentUser={currentUser}
                      onClose={() => setOpenChatTaskId(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SharedTasksView;
