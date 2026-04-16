import React, { useContext, useState, useMemo } from "react";
import { AuthContext } from "../../context/AuthProvider";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarDays,
  Award,
  Zap,
  Target,
  Activity,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Gauge,
  Globe,
  Circle,
} from "lucide-react";

const ReportsAnalytics = () => {
  const [userData] = useContext(AuthContext);
  const [timeRange, setTimeRange] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // ===================== DATA PROCESSING =====================

  const analytics = useMemo(() => {
    if (!userData || userData.length === 0) return null;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const stuckThresholdDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const normalizePriority = (priority) =>
      priority ? priority.toString().trim().toLowerCase() : "";

    const filterByDate = (task) => {
      if (timeRange === "all") return true;
      const taskDate = new Date(task.taskDate);
      if (timeRange === "weekly") return taskDate >= oneWeekAgo;
      if (timeRange === "monthly") return taskDate >= oneMonthAgo;
      return true;
    };

    const filterTask = (task) => {
      if (!filterByDate(task)) return false;

      const taskCategory = (task.category || "General").toLowerCase();
      const taskPriority = normalizePriority(task.priority);

      if (selectedCategory !== "all" && taskCategory !== selectedCategory.toLowerCase()) return false;
      if (selectedPriority !== "all" && taskPriority !== normalizePriority(selectedPriority)) return false;

      return true;
    };

    let totalTasks = 0, completedTasks = 0, failedTasks = 0, activeTasks = 0;
    let newTasks = 0, rejectedTasks = 0, overdueTasks = 0;
    let recentCompleted = 0, recentFailed = 0, recentOverdue = 0;
    let includedEmployees = 0;

    const categoryMap = {};
    const priorityMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const employeePerformance = [];
    const overloadEmployees = [];
    const stuckTasks = [];

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayDistribution = new Array(7).fill(0);

    const employeeOptions = userData
      .map((emp) => ({ id: emp._id || emp.id, name: emp.firstName || emp.email || "Employee" }))
      .filter((emp) => emp.id);

    const categoryOptions = Array.from(
      new Set(
        userData.flatMap((emp) =>
          (emp.tasks || []).map((task) => (task.category || "General"))
        )
      )
    ).sort((a, b) => a.localeCompare(b));

    // Monthly distribution (last 6 months)
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(d.toLocaleString("default", { month: "short" }));
    }
    const monthCompleted = new Array(6).fill(0);
    const monthFailed = new Array(6).fill(0);
    const monthTotal = new Array(6).fill(0);

    // Status for pie-like visual
    const statusCounts = { completed: 0, failed: 0, active: 0, newTask: 0, rejected: 0 };

    userData.forEach((emp) => {
      const empId = emp._id || emp.id;
      if (selectedEmployee !== "all" && empId !== selectedEmployee) return;

      includedEmployees++;
      let empCompleted = 0, empFailed = 0, empTotal = 0, empActive = 0;

      emp.tasks?.forEach((task) => {
        if (!filterTask(task)) return;
        empTotal++;
        totalTasks++;

        if (task.completed) { completedTasks++; empCompleted++; statusCounts.completed++; }
        if (task.failed) { failedTasks++; empFailed++; statusCounts.failed++; }
        if (task.active) { activeTasks++; empActive++; statusCounts.active++; }
        if (task.newTask) { newTasks++; statusCounts.newTask++; }
        if (task.rejected) { rejectedTasks++; statusCounts.rejected++; }

        // Overdue check
        const taskDate = new Date(task.taskDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);
        if (taskDate < today && (task.active || task.newTask)) overdueTasks++;

        // Recent baseline data (last 14 days) for short-term forecast cards
        if (taskDate >= twoWeeksAgo) {
          if (task.completed) recentCompleted++;
          if (task.failed) recentFailed++;
          if (taskDate < today && (task.active || task.newTask)) recentOverdue++;
        }

        // Category
        const cat = task.category || "General";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;

        // Priority
        if (task.priority && Object.prototype.hasOwnProperty.call(priorityMap, task.priority)) {
          priorityMap[task.priority]++;
        }

        // Day distribution
        const day = new Date(task.taskDate).getDay();
        if (!isNaN(day)) dayDistribution[day]++;

        // Monthly distribution by taskDate
        const tDate = new Date(task.taskDate);
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          if (tDate >= monthStart && tDate <= monthEnd) {
            monthTotal[5 - i]++;
            if (task.completed) monthCompleted[5 - i]++;
            if (task.failed) monthFailed[5 - i]++;
          }
        }
      });

      const pendingLoad = empActive + (empTotal - empCompleted - empFailed - empActive);
      if (pendingLoad > 6) {
        overloadEmployees.push({
          id: empId,
          name: emp.firstName,
          email: emp.email,
          pendingLoad,
        });
      }

      (emp.tasks || []).forEach((task) => {
        if (!filterTask(task)) return;
        const taskDate = new Date(task.taskDate);
        if ((task.active || task.newTask) && taskDate < stuckThresholdDate) {
          stuckTasks.push({
            employeeName: emp.firstName,
            title: task.taskTitle || task.title || task.taskDescription || "Untitled task",
            daysOpen: Math.max(1, Math.floor((now.getTime() - taskDate.getTime()) / (24 * 60 * 60 * 1000))),
            priority: task.priority || "-",
          });
        }
      });

      employeePerformance.push({
        name: emp.firstName,
        email: emp.email,
        total: empTotal,
        completed: empCompleted,
        failed: empFailed,
        active: empActive,
        completionRate: empTotal > 0 ? Math.round((empCompleted / empTotal) * 100) : 0,
        score: empTotal > 0 ? Math.min(100, Math.max(0, Math.round(((empCompleted * 2 - empFailed) / empTotal) * 50 + 50))) : 50,
      });
    });

    employeePerformance.sort((a, b) => b.score - a.score);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const failureRate = totalTasks > 0 ? Math.round((failedTasks / totalTasks) * 100) : 0;

    const forecast = {
      completedNext7Days: Math.round((recentCompleted / 14) * 7),
      failedNext7Days: Math.round((recentFailed / 14) * 7),
      overdueNext7Days: Math.round((recentOverdue / 14) * 7),
    };

    const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxCategoryCount = Math.max(...topCategories.map(([, v]) => v), 1);

    return {
      totalTasks, completedTasks, failedTasks, activeTasks, newTasks,
      rejectedTasks, overdueTasks, completionRate, failureRate,
      topCategories, maxCategoryCount, priorityMap, employeePerformance,
      dayDistribution, dayLabels, monthLabels, monthCompleted, monthFailed,
      monthTotal, statusCounts,
      totalEmployees: includedEmployees,
      employeeOptions,
      categoryOptions,
      overloadEmployees: overloadEmployees.sort((a, b) => b.pendingLoad - a.pendingLoad).slice(0, 5),
      stuckTasks: stuckTasks.sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 6),
      forecast,
    };
  }, [userData, timeRange, selectedEmployee, selectedCategory, selectedPriority]);

  // ===================== EMPTY STATE =====================

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 size={36} className="text-indigo-400" />
        </div>
        <p className="text-lg font-semibold text-gray-500">No Analytics Data Yet</p>
        <p className="text-sm text-gray-400 mt-1">Create employees and assign tasks to see reports</p>
      </div>
    );
  }

  const maxDay = Math.max(...analytics.dayDistribution, 1);
  const maxMonth = Math.max(...analytics.monthTotal, 1);
  const totalPriority = Object.values(analytics.priorityMap).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-5">

      {/* ============================================================ */}
      {/* TIME RANGE TOGGLE                                            */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-slate-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Analytics Dashboard</h3>
            <p className="text-xs text-gray-400">Real-time performance insights</p>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
          {[
            { key: "weekly", label: "7 Days", icon: <Gauge size={12} /> },
            { key: "monthly", label: "30 Days", icon: <Calendar size={12} /> },
            { key: "all", label: "All Time", icon: <Globe size={12} /> },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTimeRange(opt.key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                timeRange === opt.key
                  ? "bg-slate-900 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white"
              }`}
            >
              <span className="mr-1">{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* GLOBAL FILTERS                                                */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Employees</option>
            {analytics.employeeOptions.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Categories</option>
            {analytics.categoryOptions.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KPI CARDS                                                     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Target size={22} />}
          label="Total Tasks"
          value={analytics.totalTasks}
          gradient="bg-indigo-500"
          shadowColor="shadow-indigo-200"
          trend={`${analytics.totalEmployees} employees`}
          trendIcon={<Users size={12} />}
        />
        <KpiCard
          icon={<CheckCircle2 size={22} />}
          label="Completed"
          value={analytics.completedTasks}
          gradient="bg-emerald-500"
          shadowColor="shadow-emerald-200"
          trend={`${analytics.completionRate}% rate`}
          trendIcon={<ArrowUpRight size={12} />}
          trendColor="text-emerald-600"
        />
        <KpiCard
          icon={<XCircle size={22} />}
          label="Failed"
          value={analytics.failedTasks}
          gradient="bg-rose-500"
          shadowColor="shadow-rose-200"
          trend={`${analytics.failureRate}% rate`}
          trendIcon={<ArrowDownRight size={12} />}
          trendColor="text-rose-500"
        />
        <KpiCard
          icon={<AlertTriangle size={22} />}
          label="Overdue"
          value={analytics.overdueTasks}
          gradient="bg-amber-500"
          shadowColor="shadow-amber-200"
          trend={`${analytics.activeTasks + analytics.newTasks} pending`}
          trendIcon={<Clock size={12} />}
          trendColor="text-amber-600"
        />
      </div>

      {/* ============================================================ */}
      {/* FORECAST + ALERTS                                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-700">7-Day Baseline Forecast</h4>
            <span className="text-[10px] text-indigo-500 font-semibold">ML-ready slot</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-emerald-50 py-3 border border-emerald-100">
              <p className="text-[11px] text-emerald-700 font-semibold">Expected Done</p>
              <p className="text-2xl font-extrabold text-emerald-600">{analytics.forecast.completedNext7Days}</p>
            </div>
            <div className="rounded-xl bg-rose-50 py-3 border border-rose-100">
              <p className="text-[11px] text-rose-700 font-semibold">Expected Failed</p>
              <p className="text-2xl font-extrabold text-rose-600">{analytics.forecast.failedNext7Days}</p>
            </div>
            <div className="rounded-xl bg-amber-50 py-3 border border-amber-100">
              <p className="text-[11px] text-amber-700 font-semibold">Expected Overdue</p>
              <p className="text-2xl font-extrabold text-amber-600">{analytics.forecast.overdueNext7Days}</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Computed from rolling 14-day averages. Replace with model API output later.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Bottleneck Alerts</h4>
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-[11px] font-bold text-amber-700 mb-1">Overloaded Employees</p>
              {analytics.overloadEmployees.length > 0 ? (
                <div className="space-y-1.5">
                  {analytics.overloadEmployees.map((emp) => (
                    <p key={emp.id} className="text-xs text-amber-800">
                      <span className="font-semibold">{emp.name}</span> - {emp.pendingLoad} pending
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-700">No overload risk detected for current filters.</p>
              )}
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
              <p className="text-[11px] font-bold text-rose-700 mb-1">Stuck Tasks (&gt; 7 days open)</p>
              {analytics.stuckTasks.length > 0 ? (
                <div className="space-y-1.5">
                  {analytics.stuckTasks.map((task, i) => (
                    <p key={`${task.employeeName}-${task.title}-${i}`} className="text-xs text-rose-800">
                      <span className="font-semibold">{task.employeeName}</span> - {task.title} ({task.daysOpen}d)
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-rose-700">No stuck tasks found in current selection.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COMPLETION RING + STATUS BREAKDOWN                            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-indigo-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-700">Completion Rate</h4>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#ringGrad)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${analytics.completionRate * 2.51} ${251 - analytics.completionRate * 2.51}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {analytics.completionRate}%
                </span>
                <span className="text-[10px] text-gray-400 font-medium">SUCCESS</span>
              </div>
            </div>
            <div className="space-y-2.5 flex-1 text-sm">
              {[
                { label: "Active", val: analytics.activeTasks, color: "bg-yellow-400", text: "text-yellow-700" },
                { label: "New", val: analytics.newTasks, color: "bg-sky-400", text: "text-sky-700" },
                { label: "Completed", val: analytics.completedTasks, color: "bg-emerald-400", text: "text-emerald-700" },
                { label: "Failed", val: analytics.failedTasks, color: "bg-rose-400", text: "text-rose-700" },
                { label: "Rejected", val: analytics.rejectedTasks, color: "bg-gray-400", text: "text-gray-700" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-gray-500 flex-1">{s.label}</span>
                  <span className={`font-bold ${s.text}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-700">Priority Distribution</h4>
          </div>
          <div className="space-y-4">
            {[
              { key: "Critical", color: "bg-red-500", bg: "bg-red-50" },
              { key: "High", color: "bg-orange-500", bg: "bg-orange-50" },
              { key: "Medium", color: "bg-amber-500", bg: "bg-amber-50" },
              { key: "Low", color: "bg-emerald-500", bg: "bg-emerald-50" },
            ].map(({ key, color, bg }) => {
              const count = analytics.priorityMap[key];
              const pct = Math.round((count / totalPriority) * 100);
              return (
                <div key={key} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <Circle size={10} className={key === "Critical" ? "text-red-500" : key === "High" ? "text-orange-500" : key === "Medium" ? "text-amber-500" : "text-emerald-500"} fill="currentColor" />
                      <span className="font-semibold text-gray-700">{key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${bg} font-bold text-gray-600`}>{count}</span>
                      <span className="text-gray-400 text-xs w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-700 ease-out group-hover:opacity-90`}
                      style={{ width: `${pct}%`, minWidth: count > 0 ? "12px" : "0px" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHARTS ROW                                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays size={16} className="text-blue-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-700">Tasks by Day of Week</h4>
          </div>
          <div className="flex gap-3 h-44 px-1">
            {analytics.dayLabels.map((day, i) => {
              const val = analytics.dayDistribution[i];
              const height = (val / maxDay) * 100;
              const isMax = val === maxDay && val > 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5 group h-full pt-4">
                  <span className={`text-xs font-bold transition-all ${isMax ? "text-blue-600" : "text-gray-400"} group-hover:text-blue-600`}>
                    {val}
                  </span>
                  <div className="w-full bg-blue-50 rounded-xl relative overflow-hidden flex-1 min-h-[4px]">
                    <div
                      className={`absolute bottom-0 w-full rounded-xl transition-all duration-700 ease-out group-hover:opacity-80 ${
                        isMax ? "bg-blue-600" : "bg-slate-300"
                      }`}
                      style={{ height: `${height}%`, minHeight: val > 0 ? "10px" : "0px" }}
                    />
                  </div>
                  <span className={`text-xs font-semibold transition-all ${isMax ? "text-blue-600" : "text-gray-400"}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-700">Monthly Trend</h4>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Failed
              </span>
            </div>
          </div>
          <div className="flex gap-3 h-40 px-1">
            {analytics.monthLabels.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1.5 group h-full pt-4">
                <div className="w-full flex gap-1 items-stretch flex-1">
                  <div className="flex-1 bg-emerald-50 rounded-lg relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-emerald-500 rounded-lg transition-all duration-700 group-hover:opacity-80"
                      style={{ height: `${(analytics.monthCompleted[i] / maxMonth) * 100}%`, minHeight: analytics.monthCompleted[i] > 0 ? "8px" : "0px" }}
                    />
                  </div>
                  <div className="flex-1 bg-rose-50 rounded-lg relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-rose-500 rounded-lg transition-all duration-700 group-hover:opacity-80"
                      style={{ height: `${(analytics.monthFailed[i] / maxMonth) * 100}%`, minHeight: analytics.monthFailed[i] > 0 ? "8px" : "0px" }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-700 transition mt-2">{month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CATEGORY BREAKDOWN                                            */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <Layers size={16} className="text-violet-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-700">Task Categories</h4>
          <span className="ml-auto text-xs text-gray-400">{analytics.topCategories.length} categories</span>
        </div>
        {analytics.topCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {analytics.topCategories.map(([category, count], i) => {
              const gradients = [
                "bg-indigo-500",
                "bg-blue-500",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-rose-500",
                "bg-purple-500",
              ];
              const pct = Math.round((count / analytics.totalTasks) * 100);
              return (
                <div key={category} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-semibold">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">{count}</span>
                      <span className="text-xs text-gray-400">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${gradients[i % gradients.length]} rounded-full transition-all duration-700 group-hover:shadow-sm`}
                      style={{ width: `${(count / analytics.maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">No task categories found</p>
        )}
      </div>

      {/* ============================================================ */}
      {/* EMPLOYEE LEADERBOARD                                          */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="p-6 pb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Award size={16} className="text-amber-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-700">Performance Leaderboard</h4>
          <span className="ml-auto text-xs text-gray-400">{analytics.employeePerformance.length} employees</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-8 bg-slate-50 text-gray-400 text-[11px] font-bold uppercase tracking-wider px-6 py-3">
            <div className="col-span-2">Employee</div>
            <div className="text-center">Total</div>
            <div className="text-center">Completed</div>
            <div className="text-center">Failed</div>
            <div className="text-center">Active</div>
            <div className="text-center">Rate</div>
            <div className="text-center">Score</div>
          </div>
          {analytics.employeePerformance.map((emp, i) => {
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={emp.email}
                className={`grid grid-cols-8 items-center px-6 py-3.5 transition-all hover:bg-indigo-50/40 ${
                  i < analytics.employeePerformance.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="col-span-2 flex items-center gap-3">
                  {i < 3 ? (
                    <span className="text-xl w-8 text-center">{medals[i]}</span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                      {i + 1}
                    </span>
                  )}
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                    <p className="text-[11px] text-gray-400">{emp.email}</p>
                  </div>
                </div>
                <div className="text-center font-bold text-gray-600">{emp.total}</div>
                <div className="text-center font-bold text-emerald-600">{emp.completed}</div>
                <div className="text-center font-bold text-rose-500">{emp.failed}</div>
                <div className="text-center font-bold text-amber-500">{emp.active}</div>
                <div className="text-center">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    emp.completionRate >= 70
                      ? "bg-emerald-100 text-emerald-700"
                      : emp.completionRate >= 40
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}>
                    {emp.completionRate}%
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-20 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          emp.score >= 70
                            ? "bg-emerald-500"
                            : emp.score >= 40
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${emp.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-gray-600 w-6">{emp.score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile */}
        <div className="md:hidden px-4 pb-4 space-y-3">
          {analytics.employeePerformance.map((emp, i) => {
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={emp.email}
                className={`rounded-xl p-4 border ${
                  i === 0 ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {i < 3 ? (
                    <span className="text-2xl">{medals[i]}</span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{emp.name}</p>
                    <p className="text-[11px] text-gray-400">{emp.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    emp.completionRate >= 70 ? "bg-emerald-100 text-emerald-700" : emp.completionRate >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {emp.completionRate}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                  {[
                    { l: "Total", v: emp.total, c: "text-gray-700" },
                    { l: "Done", v: emp.completed, c: "text-emerald-600" },
                    { l: "Failed", v: emp.failed, c: "text-rose-500" },
                    { l: "Active", v: emp.active, c: "text-amber-500" },
                  ].map((s) => (
                    <div key={s.l} className="bg-white rounded-lg py-1.5 border border-gray-100">
                      <p className="text-gray-400 text-[10px]">{s.l}</p>
                      <p className={`font-extrabold ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-semibold w-8">Score</span>
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        emp.score >= 70 ? "bg-emerald-500" : emp.score >= 40 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${emp.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-gray-600 w-6">{emp.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ===================== KPI CARD =====================

const KpiCard = ({ icon, label, value, gradient, shadowColor, trend, trendIcon, trendColor = "text-gray-500" }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-extrabold text-gray-800 tracking-tight">{value}</p>
    <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
    {trend && (
      <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${trendColor}`}>
        {trendIcon}
        <span>{trend}</span>
      </div>
    )}
  </div>
);

export default ReportsAnalytics;
