import React, { useEffect, useState } from "react";
import Header from "../other/Header";
import TaskListNumbers from "../other/TaskListNumbers";
import TaskList from "../TaskList/TaskList";
import NotificationsPanel from "../other/NotificationsPanel";
import ChatRoom from "../other/ChatRoom";
import { apiService } from "../../utils/apiService";
import { Loader2, ClipboardList, ListTodo, MessageCircle, X } from "lucide-react";

const EmployeeDashboard = (props) => {
  const { data, changeUser } = props;
  const [employeeData, setEmployeeData] = useState(data);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatLabel, setChatLabel] = useState("");

  // Build current-user identity for chat
  const currentUser = {
    id: data?._id || data?.id || "emp",
    name: data?.firstName || "Employee",
    role: "employee",
  };

  const openTaskChat = (task) => {
    if (!task.sharedTaskId) return;
    setChatRoomId(`task_${task.sharedTaskId}`);
    setChatLabel(`Task Chat: ${task.taskTitle}`);
    setChatOpen(true);
  };

  // Fetch employee data (auto refresh)
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeId = data?._id || data?.id;

        if (employeeId) {
          const updatedEmployee =
            await apiService.getEmployeeById(employeeId);
          
          if (updatedEmployee && !updatedEmployee.message && updatedEmployee._id) {
            setEmployeeData(updatedEmployee);
          } else if (updatedEmployee && updatedEmployee.message === "Employee not found") {
            // Handle deleted or not found employee
            localStorage.clear();
            if (changeUser) {
              changeUser("");
            }
          }
        }
      } catch (error) {
        console.error("Employee fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
    const interval = setInterval(fetchEmployeeData, 3000);

    return () => clearInterval(interval);
  }, [data?._id, data?.id, changeUser]);

  /* ================= Loading Screen ================= */

  if (loading) {
    return (
      <div className="ui-shell flex items-center justify-center">
        <div className="ui-card p-6 flex items-center gap-3">
          <Loader2 size={18} className="text-slate-700 animate-spin" />
          <p className="text-slate-700 font-semibold text-lg">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-shell">

      {/* ================= Sticky Header ================= */}
      <div className="sticky top-0 z-30 bg-white shadow-md">
        <Header changeUser={changeUser} data={employeeData} />
      </div>

      {/* ================= Main Content ================= */}
      <div className="p-4 md:p-8">

        {/* ================= Stats Section ================= */}
        <div className="mb-6">
          <div className="ui-card p-4 md:p-6 transition-all">

            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-slate-700" />
              Task Overview
            </h2>

            <TaskListNumbers data={employeeData} />
          </div>
        </div>

        {/* ================= Notifications ================= */}
        <div className="mb-6">
          
          <NotificationsPanel mode="employee" data={employeeData} />
        </div>

        {/* ================= Task List Section ================= */}
        <div>
          <div className="ui-card p-4 md:p-6 transition-all">

            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ListTodo size={18} className="text-slate-700" />
              Your Tasks
            </h2>

            <TaskList data={employeeData} onOpenTaskChat={openTaskChat} />
          </div>
        </div>

        {/* ================= Task Chat Panel ================= */}
        {chatOpen && chatRoomId && (
          <div className="fixed bottom-4 right-4 w-80 sm:w-96 z-50 shadow-2xl rounded-2xl overflow-hidden">
            <ChatRoom
              roomId={chatRoomId}
              roomLabel={chatLabel}
              currentUser={currentUser}
              onClose={() => setChatOpen(false)}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeDashboard;
