import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../other/Header";
import TaskListNumbers from "../other/TaskListNumbers";
import TaskList from "../TaskList/TaskList";
import EmployeeStatistics from "../other/EmployeeStatistics";
import NotificationsPanel from "../other/NotificationsPanel";
import ChatRoom from "../other/ChatRoom";
import MyLeave from "../other/MyLeave";
import { apiService } from "../../utils/apiService";
import { ClipboardList, ListTodo, MessageCircle, CalendarDays, ChevronDown, ChevronUp, X } from "lucide-react";

/* ─── Skeleton shimmer block ─── */
const Skeleton = ({ className = "" }) => (
  <div className={`skeleton ${className}`} />
);

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.07, ease: "easeOut" },
  }),
};

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

  /* ─── Skeleton Loading Screen ─── */
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Header skeleton */}
        <div className="sticky top-0 z-30" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-5">
          <div className="ui-card p-5">
            <Skeleton className="h-5 w-32 mb-4 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          </div>
          <div className="ui-card p-5">
            <Skeleton className="h-5 w-40 mb-4 rounded" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-52 w-72 flex-shrink-0 rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ─── Sticky Header ─── */}
      <div
        className="sticky top-0 z-30"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <Header changeUser={changeUser} data={employeeData} />
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-5">

        {/* Stats */}
        <motion.div
          className="ui-card p-4 md:p-6"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
            <ClipboardList size={17} style={{ color: "var(--accent)" }} />
            Task Overview
          </h2>
          <TaskListNumbers data={employeeData} />
          
          <EmployeeStatistics data={employeeData} />
        </motion.div>

        {/* Notifications */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <NotificationsPanel mode="employee" data={employeeData} />
        </motion.div>

        {/* Direct Message — Admin */}
        {adminId && (
          <motion.div
            className="ui-card p-4 md:p-6"
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <MessageCircle size={17} style={{ color: "var(--accent)" }} />
                Direct Message — Admin
              </h2>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setDirectChatOpen((o) => !o)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition"
                style={{
                  background: directChatOpen ? "var(--accent-dim)" : "var(--surface-soft)",
                  borderColor: directChatOpen ? "var(--accent)" : "var(--border)",
                  color: directChatOpen ? "var(--accent)" : "var(--text-muted)",
                }}
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
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
            <ListTodo size={17} style={{ color: "var(--accent)" }} />
            Your Tasks
          </h2>
          <TaskList data={employeeData} onOpenTaskChat={openTaskChat} />
        </motion.div>

        {/* My Leave */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <CalendarDays size={17} style={{ color: "var(--accent)" }} />
            <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
              My Leave
            </h2>
          </div>
          <MyLeave />
        </motion.div>

      </div>

      {/* ─── Slide-over Task Chat Panel ─── */}
      <AnimatePresence>
        {chatOpen && chatRoomId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(15,23,42,0.25)" }}
              onClick={() => setChatOpen(false)}
            />
            {/* Slide-over panel from right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 z-50 flex flex-col"
              style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}
            >
              {/* Panel header */}
              <div
                className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} style={{ color: "var(--accent)" }} />
                  <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                    {chatLabel}
                  </span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 rounded-md transition"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <X size={16} />
                </button>
              </div>
              {/* Chat content */}
              <div className="flex-1 overflow-hidden">
                <ChatRoom
                  roomId={chatRoomId}
                  roomLabel={chatLabel}
                  currentUser={currentUser}
                  onClose={() => setChatOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EmployeeDashboard;

