import React, { useState, useContext, useEffect } from "react";
import { Menu, ListChecks, SquarePen, UserPlus, Users, BarChart3, LayoutDashboard } from "lucide-react";
import Header from "../other/Header";
import CreateTask from "../other/CreateTask";
import AllTask from "../other/AllTask";
import CreateEmployee from "../other/CreateEmployee";
import EmployeeList from "../other/EmployeeList";
import AdminTaskView from "../other/AdminTaskView";
import NotificationsPanel from "../other/NotificationsPanel";
import ReportsAnalytics from "../other/ReportsAnalytics";
import { AuthContext } from "../../context/AuthProvider";

const AdminDashboard = (props) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [userData, , { refreshEmployees }] =
    useContext(AuthContext);

  // Auto refresh employees
  useEffect(() => {
    const interval = setInterval(() => {
      refreshEmployees();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshEmployees]);

  return (
    <div className="flex min-h-screen ui-shell relative">

      {/* ================= Mobile Overlay ================= */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside
        className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 p-6 
        flex flex-col z-50 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
        `}
      >

        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Admin Panel
        </h2>

        <nav className="space-y-3">

          <SidebarButton
            label="View Tasks"
            icon={<ListChecks size={18} />}
            active={activeTab === "tasks"}
            onClick={() => {
              setActiveTab("tasks");
              setSidebarOpen(false);
            }}
          />

          <SidebarButton
            label="Create Task"
            icon={<SquarePen size={18} />}
            active={activeTab === "task"}
            onClick={() => {
              setActiveTab("task");
              setSidebarOpen(false);
            }}
          />

          <SidebarButton
            label="Create Employee"
            icon={<UserPlus size={18} />}
            active={activeTab === "employee"}
            onClick={() => {
              setActiveTab("employee");
              setSidebarOpen(false);
            }}
          />

          <SidebarButton
            label="Manage Employees"
            icon={<Users size={18} />}
            active={activeTab === "manage"}
            onClick={() => {
              setActiveTab("manage");
              setSidebarOpen(false);
            }}
          />

          <SidebarButton
            label="Reports & Analytics"
            icon={<BarChart3 size={18} />}
            active={activeTab === "reports"}
            onClick={() => {
              setActiveTab("reports");
              setSidebarOpen(false);
            }}
          />

        </nav>
      </aside>

      {/* ================= Main Content ================= */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6">

        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between mb-2 md:hidden">
          <h1 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
            <LayoutDashboard size={18} className="text-slate-700" />
            Admin Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white rounded-lg border border-slate-200"
          >
            <Menu size={18} className="text-slate-700" />
          </button>
        </div>

        {/* Header */}
        <div className="ui-card">
          <Header changeUser={props.changeUser} />
        </div>

        {/* Notifications */}
        <div>
          <NotificationsPanel mode="admin" data={userData} />
        </div>

        {/* Content Card */}
        <div className="ui-card p-6 min-h-[60vh] transition-all">

          {activeTab === "employee" && (
            <>
              <SectionTitle title="Add New Employee" color="text-blue-600" />
              <CreateEmployee />
            </>
          )}

          {activeTab === "task" && (
            <>
              <SectionTitle title="Create New Task" color="text-emerald-600" />
              <CreateTask />
            </>
          )}

          {activeTab === "manage" && (
            <>
              <SectionTitle title="Manage Employees" color="text-indigo-600" />
              <EmployeeList />
            </>
          )}

          {activeTab === "tasks" && (
            <>
              <SectionTitle title="All Assigned Tasks" color="text-purple-600" />
              <AdminTaskView />
            </>
          )}

          {activeTab === "reports" && (
            <>
              <SectionTitle title="Reports & Analytics" color="text-indigo-600" />
              <ReportsAnalytics />
            </>
          )}

        </div>

        {/* Bottom Task List */}
        <div className="mt-6 ui-card p-4 md:p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ListChecks size={20} className="text-slate-700" />
            Task Overview
          </h2>
          <AllTask />
        </div>

      </main>
    </div>
  );
};

/* ================= Reusable Components ================= */

const SidebarButton = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left
      transition-all duration-300 font-medium
      ${
        active
          ? "bg-slate-900 text-white"
          : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
};

const SectionTitle = ({ title, color }) => {
  return (
    <h2 className={`text-xl md:text-2xl font-semibold mb-4 ${color}`}>
      {title}
    </h2>
  );
};

export default AdminDashboard;
