import React, { useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthProvider";

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay: i * 0.05, ease: "easeOut" },
  }),
};

const AllTask = () => {

  const [userData] = useContext(AuthContext);

  return (
    <div>

      {/* Desktop Table */}
      <div className="hidden md:block">

        <div
          className="grid grid-cols-5 rounded-lg text-sm font-semibold p-3"
          style={{ background: "var(--surface-soft)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          <div>Employee</div>
          <div className="text-center">New</div>
          <div className="text-center">Active</div>
          <div className="text-center">Completed</div>
          <div className="text-center">Failed</div>
        </div>

        <div className="mt-1">
          {userData?.length > 0 ? (
            userData.map((emp, i) => (
              <motion.div
                key={emp._id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-5 items-center p-3 rounded-lg transition-colors"
                style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="font-medium text-sm" style={{ color: "var(--text)" }}>
                  {emp.firstName}
                </div>
                <div className="text-center text-sm font-semibold" style={{ color: "#2563EB" }}>
                  {emp.taskCounts?.newTask || 0}
                </div>
                <div className="text-center text-sm font-semibold" style={{ color: "#F59E0B" }}>
                  {emp.taskCounts?.active || 0}
                </div>
                <div className="text-center text-sm font-semibold" style={{ color: "#10B981" }}>
                  {emp.taskCounts?.completed || 0}
                </div>
                <div className="text-center text-sm font-semibold" style={{ color: "#EF4444" }}>
                  {emp.taskCounts?.failed || 0}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-sm" style={{ color: "var(--text-muted)" }}>
              No employees found
            </div>
          )}
        </div>

      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {userData?.length > 0 ? (
          userData.map((emp, i) => (
            <motion.div
              key={emp._id}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              className="ui-card p-4"
            >
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>
                {emp.firstName}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Stat label="New"       value={emp.taskCounts?.newTask}   color="#2563EB" />
                <Stat label="Active"    value={emp.taskCounts?.active}    color="#F59E0B" />
                <Stat label="Completed" value={emp.taskCounts?.completed} color="#10B981" />
                <Stat label="Failed"    value={emp.taskCounts?.failed}    color="#EF4444" />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6 text-sm" style={{ color: "var(--text-muted)" }}>
            No employees found
          </div>
        )}
      </div>

    </div>
  );
};

const Stat = ({ label, value, color }) => (
  <div
    className="flex justify-between items-center p-2 rounded-lg text-sm"
    style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
  >
    <span style={{ color: "var(--text-muted)" }}>{label}</span>
    <span className="font-semibold" style={{ color }}>{value || 0}</span>
  </div>
);

export default AllTask;

