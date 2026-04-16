import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Send, Clock } from "lucide-react";
import { apiService } from "../../utils/apiService";

const statusConfig = {
  pending:  { label: "Pending",  bg: "var(--warning)",  color: "#fff" },
  approved: { label: "Approved", bg: "#16A34A",          color: "#fff" },
  rejected: { label: "Rejected", bg: "var(--danger)",    color: "#fff" },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const MyLeave = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRequests = async () => {
    try {
      const data = await apiService.getMyLeaveRequests();
      if (data.leaveRequests) setRequests(data.leaveRequests);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate, reason } = form;

    if (!startDate || !endDate || !reason.trim()) {
      setFormError("All fields are required.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setFormError("Start date must be before or equal to end date.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiService.submitLeaveRequest(startDate, endDate, reason.trim());
      if (data.request) {
        setRequests((prev) => [data.request, ...prev]);
        setForm({ startDate: "", endDate: "", reason: "" });
        setSuccessMsg("Leave request submitted successfully.");
      } else {
        setFormError(data.message || "Submission failed.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Submit Form ── */}
      <div className="ui-card p-5">
        <h3
          className="text-sm font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text)" }}
        >
          <CalendarDays size={15} style={{ color: "var(--accent)" }} />
          Request Leave
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="px-3 py-2 rounded-md border text-sm outline-none transition"
                style={{
                  background: "var(--surface-soft)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate || new Date().toISOString().split("T")[0]}
                className="px-3 py-2 rounded-md border text-sm outline-none transition"
                style={{
                  background: "var(--surface-soft)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Reason
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe the reason for your leave…"
              className="px-3 py-2 rounded-md border text-sm outline-none transition resize-none"
              style={{
                background: "var(--surface-soft)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <AnimatePresence>
            {formError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
                style={{ color: "var(--danger)" }}
              >
                {formError}
              </motion.p>
            )}
            {successMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
                style={{ color: "#16A34A" }}
              >
                {successMsg}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition"
              style={{
                background: submitting ? "var(--accent-dim)" : "var(--accent)",
                color: submitting ? "var(--accent)" : "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              <Send size={13} />
              {submitting ? "Submitting…" : "Submit Request"}
            </motion.button>
          </div>
        </form>
      </div>

      {/* ── Leave History ── */}
      <div className="ui-card p-5">
        <h3
          className="text-sm font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text)" }}
        >
          <Clock size={15} style={{ color: "var(--accent)" }} />
          Leave History
        </h3>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
            No leave requests yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {requests.map((req) => {
              const cfg = statusConfig[req.status] || statusConfig.pending;
              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border"
                  style={{
                    background: "var(--surface-soft)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                      {formatDate(req.startDate)} — {formatDate(req.endDate)}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                      title={req.reason}
                    >
                      {req.reason}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeave;
