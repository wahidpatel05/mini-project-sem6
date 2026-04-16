import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ListChecks, SquarePen, UserPlus, Users, BarChart3, LayoutDashboard, MessageCircle, GitMerge, X } from "lucide-react";
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
import { AuthContext } from "../../context/AuthProvider";

const AdminDashboard = (props) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [userData, , { refreshEmployees }] =
    useContext(AuthContext);

  const adminCurrentUser = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const data = stored.data || {};
      return {
        id: data._id || data.id || "admin",
        name: data.firstName || data.email || "Admin",
        role: "admin",
      };
    } catch {
      return { id: "admin", name: "Admin", role: "admin" };
    }
  })();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshEmployees();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshEmployees]);

  const navItems = [
    { key: "tasks",    label: "View Tasks",          icon: <ListChecks size={17} /> },
    { key: "task",     label: "Create Task",          icon: <SquarePen size={17} /> },
    { key: "employee", label: "Create Employee",      icon: <UserPlus size={17} /> },
    { key: "manage",   label: "Manage Employees",     icon: <Users size={17} /> },
    { key: "reports",  label: "Reports & Analytics",  icon: <BarChart3 size={17} /> },
    { key: "shared",   label: "Shared Tasks",         icon: <GitMerge size={17} /> },
    { key: "chat",     label: "Messages",             icon: <MessageCircle size={17} /> },
  ];

  const sectionTitles = {
    tasks:    { label: "All Assigned Tasks",          color: "var(--accent)" },
    task:     { label: "Create New Task",             color: "var(--accent)" },
    employee: { label: "Add New Employee",            color: "var(--accent)" },
    manage:   { label: "Manage Employees",            color: "var(--accent)" },
    reports:  { label: "Reports & Analytics",         color: "var(--accent)" },
    shared:   { label: "Multi-Assignee Shared Tasks", color: "var(--accent)" },
    chat:     { label: "Direct Messages",             color: "var(--accent)" },
  };

  return (
    <div className="flex min-h-screen ui-shell relative">

      {/* ─── Mobile Overlay ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(0,0,0,0.6)" }}
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen || typeof window !== "undefined" ? 0 : "-100%" }}
        className={`
          fixed md:sticky top-0 left-0 h-screen w-60 flex flex-col z-50
          border-r transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{ background: "#0B1120", borderColor: "var(--border)" }}
      >
        {/* Logo / Brand */}
        <div className="px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "var(--accent)" }}>
              <LayoutDashboard size={14} color="#fff" />
            </div>
            <span className="font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
              Admin Panel
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-md transition"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarButton
              key={item.key}
              label={item.label}
              icon={item.icon}
              active={activeTab === item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
          Faculty Management v2
        </div>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col gap-5 p-4 md:p-7 min-w-0">

        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between md:hidden">
          <span className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--text)" }}>
            <LayoutDashboard size={16} style={{ color: "var(--accent)" }} />
            Admin Dashboard
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md border transition"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Menu size={17} />
          </motion.button>
        </div>

        {/* Header */}
        <Header changeUser={props.changeUser} />

        {/* Notifications */}
        <NotificationsPanel mode="admin" data={userData} />

        {/* Content Panel */}
        <div className="ui-card p-5 md:p-7 min-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <h2 className="text-lg font-semibold mb-5"
                style={{ color: sectionTitles[activeTab]?.color }}>
                {sectionTitles[activeTab]?.label}
              </h2>

              {activeTab === "employee" && <CreateEmployee />}
              {activeTab === "task"     && <CreateTask />}
              {activeTab === "manage"   && <EmployeeList />}
              {activeTab === "tasks"    && <AdminTaskView />}
              {activeTab === "reports"  && <ReportsAnalytics />}
              {activeTab === "shared"   && <SharedTasksView currentUser={adminCurrentUser} />}
              {activeTab === "chat"     && <DirectChat employees={userData} currentUser={adminCurrentUser} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Task Overview */}
        <div className="ui-card p-5 md:p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text)" }}>
            <ListChecks size={18} style={{ color: "var(--accent)" }} />
            Task Overview
          </h2>
          <AllTask />
        </div>

      </main>
    </div>
  );
};

/* ─── Sidebar Button ─── */
const SidebarButton = ({ label, icon, active, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-left text-sm font-medium transition-all duration-200"
    style={
      active
        ? { background: "var(--accent-dim)", color: "var(--accent)", borderLeft: "3px solid var(--accent)", paddingLeft: "9px" }
        : { color: "var(--text-muted)", borderLeft: "3px solid transparent", paddingLeft: "9px" }
    }
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text)"; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--text-muted)"; } }}
  >
    <span>{icon}</span>
    {label}
  </motion.button>
);

export default AdminDashboard;
