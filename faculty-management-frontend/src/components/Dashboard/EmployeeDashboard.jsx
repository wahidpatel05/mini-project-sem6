import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../other/Header";
import TaskListNumbers from "../other/TaskListNumbers";
import TaskList from "../TaskList/TaskList";
import NotificationsPanel from "../other/NotificationsPanel";
import ChatRoom from "../other/ChatRoom";
import { apiService } from "../../utils/apiService";
import { Loader2, ClipboardList, ListTodo, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

const EmployeeDashboard = (props) => {
  const { data, changeUser } = props;
  const [employeeData, setEmployeeData] = useState(data);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [chatLabel, setChatLabel] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [directChatOpen, setDirectChatOpen] = useState(false);

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

  const getDirectRoomId = (id1, id2) => {
    const [a, b] = [id1, id2].sort();
    return `direct_${a}_${b}`;
  };

  useEffect(() => {
    apiService.getAdminProfile()
      .then((res) => { if (res && res._id) setAdminId(res._id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeId = data?._id || data?.id;
        if (employeeId) {
          const updatedEmployee = await apiService.getEmployeeById(employeeId);
          if (updatedEmployee && !updatedEmployee.message && updatedEmployee._id) {
            setEmployeeData(updatedEmployee);
          } else if (updatedEmployee && updatedEmployee.message === "Employee not found") {
            localStorage.clear();
            if (changeUser) changeUser("");
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

  /* ─── Loading Screen ─── */
  if (loading) {
    return (
      <div className="ui-shell flex items-center justify-center">
        <div className="ui-card p-6 flex items-center gap-3">
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent)" }} />
          <p className="font-semibold text-lg" style={{ color: "var(--text)" }}>
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="ui-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >

      {/* ─── Sticky Header ─── */}
      <div className="sticky top-0 z-30" style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <Header changeUser={changeUser} data={employeeData} />
      </div>

      {/* ─── Main Content ─── */}
      <div className="p-4 md:p-7 flex flex-col gap-5">

        {/* Stats */}
        <motion.div
          className="ui-card p-4 md:p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text)" }}>
            <ClipboardList size={17} style={{ color: "var(--accent)" }} />
            Task Overview
          </h2>
          <TaskListNumbers data={employeeData} />
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <NotificationsPanel mode="employee" data={employeeData} />
        </motion.div>

        {/* Chat with Admin */}
        {adminId && (
          <motion.div
            className="ui-card p-4 md:p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2"
                style={{ color: "var(--text)" }}>
                <MessageCircle size={17} style={{ color: "var(--accent)" }} />
                Direct Message — Admin
              </h2>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setDirectChatOpen((o) => !o)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition"
                style={{ background: "var(--surface-soft)", borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                {directChatOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {directChatOpen ? "Close" : "Open"} Chat
              </motion.button>
            </div>
            <AnimatePresence>
              {directChatOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 320 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-4 overflow-hidden"
                >
                  <ChatRoom
                    roomId={getDirectRoomId(currentUser.id, adminId)}
                    roomLabel="Chat with Admin"
                    currentUser={currentUser}
                    onClose={() => setDirectChatOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Task List */}
        <motion.div
          className="ui-card p-4 md:p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text)" }}>
            <ListTodo size={17} style={{ color: "var(--accent)" }} />
            Your Tasks
          </h2>
          <TaskList data={employeeData} onOpenTaskChat={openTaskChat} />
        </motion.div>

      </div>

      {/* ─── Floating Task Chat Panel ─── */}
      <AnimatePresence>
        {chatOpen && chatRoomId && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 w-80 sm:w-96 z-50 rounded-md overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            <ChatRoom
              roomId={chatRoomId}
              roomLabel={chatLabel}
              currentUser={currentUser}
              onClose={() => setChatOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default EmployeeDashboard;
