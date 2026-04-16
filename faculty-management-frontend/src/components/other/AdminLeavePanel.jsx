import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, CalendarDays } from "lucide-react";
import { apiService } from "../../utils/apiService";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const AdminLeavePanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // requestId currently being processed

  const fetchRequests = async () => {
    try {
      const data = await apiService.getAllLeaveRequests();
      if (data.requests) setRequests(data.requests);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (employeeId, requestId, status) => {
    setActionId(requestId);
    try {
      const data = await apiService.updateLeaveStatus(employeeId, requestId, status);
      if (data.request) {
        // Optimistically remove the resolved request from the list
        setRequests((prev) => prev.filter((r) => String(r.requestId) !== String(requestId)));
      }
    } catch {
      // silently fail; the list will refresh on next fetch
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="ui-card p-5">
      <h3
        className="text-sm font-semibold mb-4 flex items-center gap-2"
        style={{ color: "var(--text)" }}
      >
        <CalendarDays size={15} style={{ color: "var(--accent)" }} />
        Pending Leave Requests
      </h3>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-lg" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          No pending leave requests.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Employee", "Dates", "Reason", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 px-3 text-xs font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {requests.map((req) => (
                  <motion.tr
                    key={req.requestId}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    {/* Employee */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                        >
                          {req.employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "var(--text)" }}>
                            {req.employeeName}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {req.employeeEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-3 whitespace-nowrap" style={{ color: "var(--text)" }}>
                      {formatDate(req.startDate)} — {formatDate(req.endDate)}
                    </td>

                    {/* Reason */}
                    <td
                      className="py-3 px-3 max-w-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                      title={req.reason}
                    >
                      {req.reason}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          disabled={actionId === req.requestId}
                          onClick={() => handleAction(req.employeeId, req.requestId, "approved")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                          style={{
                            background: "#DCFCE7",
                            color: "#16A34A",
                            opacity: actionId === req.requestId ? 0.6 : 1,
                          }}
                        >
                          <CheckCircle size={12} />
                          Approve
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          disabled={actionId === req.requestId}
                          onClick={() => handleAction(req.employeeId, req.requestId, "rejected")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition"
                          style={{
                            background: "#FEE2E2",
                            color: "var(--danger)",
                            opacity: actionId === req.requestId ? 0.6 : 1,
                          }}
                        >
                          <XCircle size={12} />
                          Reject
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLeavePanel;
