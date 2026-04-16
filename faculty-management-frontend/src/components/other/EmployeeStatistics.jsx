import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, AlertTriangle, Lightbulb, Activity, CheckCircle, Clock } from "lucide-react";

const EmployeeStatistics = ({ data }) => {
  const { taskCounts } = data;

  const stats = useMemo(() => {
    if (!taskCounts) return { total: 0, completed: 0, failed: 0, rejected: 0, successRate: 0, active: 0 };

    const totalProcessed = taskCounts.completed + taskCounts.failed + taskCounts.rejected;
    const successRate = totalProcessed > 0 ? Math.round((taskCounts.completed / totalProcessed) * 100) : 0;
    
    return {
      totalProcessed,
      completed: taskCounts.completed,
      failed: taskCounts.failed,
      rejected: taskCounts.rejected,
      active: taskCounts.active,
      successRate,
    };
  }, [taskCounts]);

  const recommendations = useMemo(() => {
    const recs = [];
    const { totalProcessed, failed, rejected, active, successRate } = stats;

    if (totalProcessed === 0) {
      recs.push({
        icon: <Activity className="text-blue-500" size={18} />,
        title: "Welcome to the Team!",
        desc: "You haven't completed any tasks yet. Start with your 'New Tasks' and feel free to ask questions.",
        color: "blue"
      });
      return recs;
    }

    if (successRate >= 80) {
      recs.push({
        icon: <TrendingUp className="text-emerald-500" size={18} />,
        title: "Outstanding Performance",
        desc: "Your success rate is excellent! Keep up the great work and maintain your current time management strategies.",
        color: "emerald"
      });
    }

    if (failed > 0 && (failed / totalProcessed) > 0.2) {
      recs.push({
        icon: <AlertTriangle className="text-rose-500" size={18} />,
        title: "Reduce Failed Tasks",
        desc: "A noticeable portion of your tasks are falling through. Consider breaking large tasks into smaller steps or requesting deadline postpones earlier rather than waiting until the last minute.",
        color: "rose"
      });
    }

    if (rejected > 0 && (rejected / totalProcessed) > 0.15) {
      recs.push({
        icon: <Target className="text-amber-500" size={18} />,
        title: "Improve Task Acceptance",
        desc: "You have a high number of rejected tasks. Make sure to review task descriptions carefully or communicate blockers to the admin before rejecting them.",
        color: "amber"
      });
    }

    if (active >= 5) {
      recs.push({
        icon: <Clock className="text-purple-500" size={18} />,
        title: "Manage Workload",
        desc: "You have many active tasks simultaneously. Try to prioritize 'Critical' or 'High' priority tasks first, and avoid context-switching too frequently.",
        color: "purple"
      });
    }

    if (recs.length === 1 && successRate < 80) {
      recs.push({
        icon: <Lightbulb className="text-indigo-500" size={18} />,
        title: "Steady Improvement",
        desc: "Focus on completing one task at a time to build momentum and increase your overall success rate.",
        color: "indigo"
      });
    }

    return recs;
  }, [stats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 sm:p-6 rounded-xl mt-6 sm:mt-8"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Performance & Statistics</h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Insights based on your task history
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-opacity-10 p-3 rounded-lg" style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}>
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200 dark:text-gray-700" />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="150"
                strokeDashoffset={stats.totalProcessed > 0 ? 150 - (150 * stats.successRate) / 100 : 150}
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{stats.successRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Success Rate</p>
            <p className="text-xs mt-1" style={{ color: "var(--text)" }}>Based on {stats.totalProcessed} tasks processed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="flex items-start gap-4 p-4 rounded-lg"
            style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}
          >
            <div className={`p-2.5 rounded-full flex-shrink-0 bg-${rec.color}-500 bg-opacity-10`}>
              {rec.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>{rec.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{rec.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmployeeStatistics;
