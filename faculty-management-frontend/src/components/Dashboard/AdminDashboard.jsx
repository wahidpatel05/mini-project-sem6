import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListChecks, SquarePen, UserPlus, Users, BarChart3,
  MessageCircle, GitMerge, CalendarDays,
} from "lucide-react";
import Header from "../other/Header";
import CreateTask from "../other/CreateTask";
import AllTask from "../other/AllTask";
import CreateEmployee from "../other/CreateEmployee";
import EmployeeList from "../other/EmployeeList";
import AdminTaskView from "../other/AdminTaskView";
import NotificationsPanel from "../other/NotificationsPanel";
import ReportsAnalytics from "../other/ReportsAnalytics";
import SharedTasksView from "../other/SharedTasksView";
import DirectChat from "../other/DirectChat";
import AdminLeavePanel from "../other/AdminLeavePanel";
import { AuthContext } from "../../context/AuthProvider";

const navItems = [
  { key: "overview", label: "Overview",            icon: <BarChart3 size={15} /> },
  { key: "tasks",    label: "View Tasks",          icon: <ListChecks size={15} /> },
  { key: "task",     label: "Create Task",         icon: <SquarePen size={15} /> },
  { key: "employee", label: "Add Employee",        icon: <UserPlus size={15} /> },
  { key: "manage",   label: "Manage",              icon: <Users size={15} /> },
  { key: "reports",  label: "Stats & AI",          icon: <BarChart3 size={15} /> },
  { key: "shared",   label: "Shared Tasks",        icon: <GitMerge size={15} /> },
  { key: "chat",     label: "Messages",            icon: <MessageCircle size={15} /> },
  { key: "leave",    label: "Leave Requests",      icon: <CalendarDays size={15} /> },
];

const sectionTitles = {
  overview: "Dashboard Overview",
  tasks:    "All Assigned Tasks",
  task:     "Create New Task",
  employee: "Add New Employee",
  manage:   "Manage Employees",
  reports:  "Performance & AI Analytics",
  shared:   "Multi-Assignee Shared Tasks",
  chat:     "Direct Messages",
  leave:    "Leave Requests",
};

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

const AdminDashboard = (props) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, , { refreshEmployees }] = useContext(AuthContext);

  const adminCurrentUser = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const data = stored.data || {};
      return { id: data._id || data.id || "admin", name: data.firstName || data.email || "Admin", role: "admin" };
    } catch {
      return { id: "admin", name: "Admin", role: "admin" };
    }
  })();

  useEffect(() => {
    const interval = setInterval(() => { refreshEmployees(); }, 3000);
    return () => clearInterval(interval);
  }, [refreshEmployees]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ─── Sticky Top Header ─── */}
      <div
        className="sticky top-0 z-30"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <Header changeUser={props.changeUser} />
        </div>

        {/* ─── Nav Tabs ─── */}
        <div
          className="max-w-6xl mx-auto px-2 sm:px-4 overflow-x-auto flex"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {navItems.map((item) => (
            <NavTab
              key={item.key}
              label={item.label}
              icon={item.icon}
              active={activeTab === item.key}
              onClick={() => setActiveTab(item.key)}
            />
          ))}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-[85rem] mx-auto p-4 md:p-6 flex flex-col gap-6">

        {/* Content Panel */}
        <div className="ui-card p-5 md:p-7 min-h-[70vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--accent)" }}>
                {navItems.find(i => i.key === activeTab)?.icon}
                {sectionTitles[activeTab]}
              </h2>

              {activeTab === "overview" && (
                <div className="flex flex-col gap-6">
                  <NotificationsPanel mode="admin" data={userData} />
                  <div className="p-1 rounded-lg" style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}>
                    <h2 className="text-base font-bold m-4 flex items-center gap-2" style={{ color: "var(--text)" }}>
                      <ListChecks size={18} style={{ color: "var(--accent)" }} />
                      Employee Task Breakdown
                    </h2>
                    <AllTask />
                  </div>
                </div>
              )}

              {activeTab === "employee" && <CreateEmployee />}
              {activeTab === "task"     && <CreateTask />}
              {activeTab === "manage"   && <EmployeeList />}
              {activeTab === "tasks"    && <AdminTaskView />}
              {activeTab === "reports"  && <ReportsAnalytics />}
              {activeTab === "shared"   && <SharedTasksView currentUser={adminCurrentUser} />}
              {activeTab === "chat"     && <DirectChat employees={userData} currentUser={adminCurrentUser} />}
              {activeTab === "leave"    && <AdminLeavePanel />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};

/* ─── Nav Tab ─── */
const NavTab = ({ label, icon, active, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150"
    style={
      active
        ? { color: "var(--accent)", borderColor: "var(--accent)" }
        : { color: "var(--text-muted)", borderColor: "transparent" }
    }
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text)"; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-muted)"; }}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </motion.button>
);

export default AdminDashboard;

