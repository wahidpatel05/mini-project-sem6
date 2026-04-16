import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { apiService, getFileUrl } from "../../utils/apiService";
import { Search, ChevronLeft, ChevronRight, FileText, Eye, MessageCircle } from "lucide-react";
import TaskListNumbers from "./TaskListNumbers";
import ChatRoom from "./ChatRoom";

const PAGE_SIZE = 8;

const AdminTaskView = () => {

  const [userData, , { refreshEmployees }] = useContext(AuthContext);

  /* ================= STATE ================= */

  const [statusTab, setStatusTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const [sortKey, setSortKey] = useState("date");
  const sortDir = "asc";

  const [currentPage, setCurrentPage] = useState(1);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newEmployeeId, setNewEmployeeId] = useState("");

  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignError, setReassignError] = useState("");

  const [postponeActionLoading, setPostponeActionLoading] = useState(false);
  const [postponeActionError, setPostponeActionError] = useState("");

  const [activeChatRoomId, setActiveChatRoomId] = useState(null);
  const [activeChatLabel, setActiveChatLabel] = useState("");

  /* ================= TASK AGGREGATION ================= */

  const allTasks = useMemo(() => {
    if (!userData) return [];

    let tasks = [];

    userData.forEach((emp) => {
      emp.tasks?.forEach((task, index) => {
        tasks.push({
          ...task,
          employeeId: emp._id,
          employeeName: emp.firstName,
          taskIndex: index
        });
      });
    });

    // Status tab filter
    if (statusTab !== "all") {
      tasks = tasks.filter((t) => t[statusTab]);
    }

    // Search
    if (searchTerm) {
      tasks = tasks.filter((t) =>
        t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Employee filter
    if (filterEmployee !== "all") {
      tasks = tasks.filter((t) => t.employeeId === filterEmployee);
    }

    // Priority filter
    if (filterPriority !== "all") {
      tasks = tasks.filter((t) => t.priority === filterPriority);
    }

    // Sorting
    tasks.sort((a, b) => {
      let valA = a[sortKey] || "";
      let valB = b[sortKey] || "";

      if (sortKey === "taskDate") {
        valA = new Date(a.taskDate);
        valB = new Date(b.taskDate);
      }

      return sortDir === "asc"
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });

    return tasks;

  }, [
    userData,
    statusTab,
    searchTerm,
    filterEmployee,
    filterPriority,
    sortKey,
    sortDir
  ]);

  const taskCounts = useMemo(() => {
    const counts = {
      newTask: 0,
      completed: 0,
      active: 0,
      failed: 0
    };

    if (!userData) return counts;

    userData.forEach((emp) => {
      emp.tasks?.forEach((task) => {
        if (task.newTask) counts.newTask += 1;
        if (task.completed) counts.completed += 1;
        if (task.active) counts.active += 1;
        if (task.failed) counts.failed += 1;
      });
    });

    return counts;
  }, [userData]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(allTasks.length / PAGE_SIZE);

  const paginatedTasks = allTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, searchTerm, filterEmployee, filterPriority]);

  /* ================= REASSIGN ================= */

  const handleReassignClick = (task) => {
    setSelectedTask(task);
    setShowReassignModal(true);
    setNewEmployeeId("");
    setReassignError("");
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
    setPostponeActionError("");
  };

  const handleReassignTask = async () => {

  if (!newEmployeeId) {
    setReassignError("Please select an employee");
    return;
  }

  // Same employee reassignment guard
  if (newEmployeeId === selectedTask.employeeId) {
    setReassignError("Task is already assigned to this employee");
    return;
  }

  setReassignLoading(true);
  setReassignError("");

  try {
    await apiService.reassignTask(
      selectedTask.employeeId,
      newEmployeeId,
      selectedTask.taskIndex
    );

    refreshEmployees();
    setShowReassignModal(false);

  } catch {
    setReassignError("Failed to reassign task. Try again.");
  } finally {
    setReassignLoading(false);
  }
};

  const handleApprovePostpone = async (requestIndex) => {
    if (!selectedTask) return;

    setPostponeActionLoading(true);
    setPostponeActionError("");

    try {
      const response = await apiService.approvePostpone(
        selectedTask.employeeId,
        selectedTask.taskIndex,
        requestIndex
      );

      if (response.employee) {
        await refreshEmployees();
        setShowTaskDetailsModal(false);
        setSelectedTask(null);
      } else {
        setPostponeActionError(response.error || response.message || "Approval failed");
      }
    } catch (error) {
      setPostponeActionError(error.message || "Approval failed");
    } finally {
      setPostponeActionLoading(false);
    }
  };

  const handleRejectPostpone = async (requestIndex) => {
    if (!selectedTask) return;

    setPostponeActionLoading(true);
    setPostponeActionError("");

    try {
      const response = await apiService.rejectPostpone(
        selectedTask.employeeId,
        selectedTask.taskIndex,
        requestIndex
      );

      if (response.employee) {
        await refreshEmployees();
        setShowTaskDetailsModal(false);
        setSelectedTask(null);
      } else {
        setPostponeActionError(response.error || response.message || "Rejection failed");
      }
    } catch (error) {
      setPostponeActionError(error.message || "Rejection failed");
    } finally {
      setPostponeActionLoading(false);
    }
  };

  const getTaskStatusLabel = (task) => {
    if (task.completed) return "Completed";
    if (task.failed) return "Failed";
    if (task.active) return "Active";
    if (task.newTask) return "New";
    if (task.rejected) return "Rejected";
    return "Unknown";
  };

  const adminCurrentUser = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const data = stored.data || {};
      return { id: data._id || data.id || "admin", name: data.firstName || data.email || "Admin", role: "admin" };
    } catch {
      return { id: "admin", name: "Admin", role: "admin" };
    }
  })();

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  const exportTasksToCsv = () => {
    const headers = [
      "Task Title",
      "Category",
      "Employee",
      "Priority",
      "Deadline",
      "Completed At",
      "Status",
      "Description"
    ];

    const escapeCsvValue = (value) => {
      const text = String(value ?? "");
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows = allTasks.map((task) => [
      task.taskTitle,
      task.category,
      task.employeeName,
      task.priority,
      task.taskDate,
      formatDateTime(task.completedAt),
      getTaskStatusLabel(task),
      task.taskDescription
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `admin-tasks-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "New", value: "newTask" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Rejected", value: "rejected" }
];


  /* ================= UI ================= */

  return (
    <div>

      {/* ================= Stats Section ================= */}

      <div className="mb-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-lg md:text-xl font-semibold text-indigo-600 mb-4 flex items-center gap-2">
            Task Overview
          </h2>
          <TaskListNumbers data={{ taskCounts }} />
        </div>
      </div>

      {/* ================= Task List Section ================= */}

      <div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h2 className="text-lg md:text-xl font-semibold text-emerald-600 mb-1 flex items-center gap-2">
                All Tasks
              </h2>
              <p className="text-sm text-gray-600">
                Manage, filter, and reassign tasks
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white/80 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              <button
                onClick={exportTasksToCsv}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              >
                Export CSV
              </button>
            </div>

          </div>

          {/* ================= STATUS TABS ================= */}

          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">

            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition
                  ${
                    statusTab === tab.value
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}

          </div>

          {/* ================= FILTER BAR ================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="filter-input"
            >
              <option value="all">All Employees</option>
              {userData?.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-input"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="filter-input"
            >
              <option value="taskDate">Sort by Date</option>
              <option value="employeeName">Sort by Employee</option>
              <option value="priority">Sort by Priority</option>
            </select>

          </div>

          {/* ================= TABLE ================= */}

          <div className="overflow-x-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg">

            <table className="min-w-full text-sm">

              <thead className="bg-indigo-50/80 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Task</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Completed At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {paginatedTasks.map((task) => (

                  <tr
                    key={`${task.employeeId}-${task.taskIndex}`}
                    className="hover:bg-indigo-50/70 transition"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold">{task.taskTitle}</p>
                      <p className="text-xs text-gray-500">{task.category}</p>
                    </td>

                    <td className="px-4 py-3">
                      {task.employeeName}
                    </td>

                    <td className="px-4 py-3">
                      {task.priority}
                    </td>

                    <td className="px-4 py-3">
                      {task.taskDate}
                    </td>

                    <td className="px-4 py-3">
                      {task.completedAt ? formatDateTime(task.completedAt) : "-"}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {task.completed ? "Completed" :
                        task.failed ? "Failed" :
                          task.active ? "Active" :
                            task.newTask ? "New" : "Rejected"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewDetails(task)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 flex items-center gap-1"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {!task.rejected && !task.completed && !task.failed && (
                          <button
                            onClick={() => handleReassignClick(task)}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs hover:bg-indigo-200"
                          >
                            Reassign
                          </button>
                        )}
                        {task.sharedTaskId && (
                          <button
                            onClick={() => {
                              const roomId = `task_${task.sharedTaskId}`;
                              if (activeChatRoomId === roomId) {
                                setActiveChatRoomId(null);
                              } else {
                                setActiveChatRoomId(roomId);
                                setActiveChatLabel(`Group Chat: ${task.taskTitle}`);
                              }
                            }}
                            className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs hover:bg-violet-200 flex items-center gap-1"
                          >
                            <MessageCircle size={12} />
                            Chat
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* ================= PAGINATION ================= */}

          <div className="flex justify-between items-center mt-4">

            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="pagination-btn"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="pagination-btn"
              >
                <ChevronRight size={18} />
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* ================= TASK DETAILS MODAL ================= */}

      {showTaskDetailsModal && selectedTask && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="bg-slate-900 text-white p-6 sticky top-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTask.taskTitle}</h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    Assigned to: <span className="font-semibold">{selectedTask.employeeName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowTaskDetailsModal(false)}
                    className="text-2xl hover:text-slate-200 transition"
                >
                  x
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">

              {/* Task Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold">Category</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedTask.category}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold">Priority</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedTask.priority}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold">Deadline</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedTask.taskDate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold">Status</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedTask.completed ? "Completed" :
                      selectedTask.failed ? "Failed" :
                        selectedTask.active ? "Active" :
                          selectedTask.newTask ? "New" : "Rejected"}
                  </p>
                </div>
                {selectedTask.completedAt && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold">Completed At</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDateTime(selectedTask.completedAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-600 font-semibold mb-2">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedTask.taskDescription}
                </p>
              </div>

              {selectedTask.postponeRequests && selectedTask.postponeRequests.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Postpone Requests</p>
                  {postponeActionError && (
                    <p className="bg-red-100 text-red-600 p-2 rounded mb-3">
                      {postponeActionError}
                    </p>
                  )}
                  {selectedTask.postponeRequests.map((request, requestIndex) => (
                    <div key={requestIndex} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-800">
                        Requested Date: {request.requestedDate}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Status: {request.status || "pending"}
                      </p>
                      {request.requestedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Requested At: {formatDateTime(request.requestedAt)}
                        </p>
                      )}
                      {request.respondedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Responded At: {formatDateTime(request.respondedAt)}
                        </p>
                      )}
                      {request.responseNote && (
                        <p className="text-xs text-gray-600 mt-1">
                          Note: {request.responseNote}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mt-2">
                        {request.reason}
                      </p>
                      {request.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleApprovePostpone(requestIndex)}
                            disabled={postponeActionLoading}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                          >
                            {postponeActionLoading ? "Working..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleRejectPostpone(requestIndex)}
                            disabled={postponeActionLoading}
                            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs hover:bg-rose-700"
                          >
                            {postponeActionLoading ? "Working..." : "Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-600 font-semibold mb-3">Attachments</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTask.attachments.map((attachment, index) => {
                      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) =>
                        attachment.fileName.toLowerCase().endsWith(ext)
                      );
                      return (
                        <a
                          key={index}
                          href={getFileUrl(attachment.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                        >
                          {isImage ? (
                            <span className="w-5 h-5 rounded bg-indigo-300 inline-block" />
                          ) : (
                            <FileText size={20} className="text-indigo-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-indigo-700 truncate">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(attachment.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!selectedTask.attachments || selectedTask.attachments.length === 0) && (
                <div className="border-t pt-4 text-center">
                  <p className="text-sm text-gray-500">No attachments uploaded</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50">
              <button
                onClick={() => setShowTaskDetailsModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ================= REASSIGN MODAL ================= */}

      {showReassignModal && selectedTask && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl w-full max-w-md">

            <h3 className="font-bold text-lg text-indigo-600 mb-4">
              Reassign Task
            </h3>

            {reassignError && (
              <p className="bg-red-100 text-red-600 p-2 rounded mb-2">
                {reassignError}
              </p>
            )}

            <select
              value={newEmployeeId}
              onChange={(e) => setNewEmployeeId(e.target.value)}
              className="filter-input mb-4"
            >
              <option value="">Select Employee</option>
              {userData?.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName}
                </option>
              ))}
            </select>

            <div className="flex gap-3">

              <button
                onClick={() => setShowReassignModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleReassignTask}
                disabled={reassignLoading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
              >
                {reassignLoading ? "Reassigning..." : "Reassign"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= FLOATING TASK CHAT PANEL ================= */}

      {activeChatRoomId && (
        <div className="fixed bottom-4 right-4 w-80 sm:w-96 z-50 shadow-2xl rounded-2xl overflow-hidden">
          <ChatRoom
            roomId={activeChatRoomId}
            roomLabel={activeChatLabel}
            currentUser={adminCurrentUser}
            onClose={() => setActiveChatRoomId(null)}
          />
        </div>
      )}

    </div>
  );
};

export default AdminTaskView;
