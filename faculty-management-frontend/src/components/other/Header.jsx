import React from "react";
import { LogOut, GraduationCap } from "lucide-react";

const Header = (props) => {
  const username = props.data?.firstName || "Admin";
  const role = props.data ? "Faculty" : "Admin";

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 h-14">

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <GraduationCap size={16} color="#fff" />
        </div>
        <span className="font-bold text-base tracking-tight hidden sm:block" style={{ color: "var(--text)" }}>
          Faculty Management
        </span>
      </div>

      {/* ── User + Logout ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          {/* Name + Role */}
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {username}
            </p>
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={props.changeUser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-[0.97]"
          style={{
            background: "rgba(239,68,68,0.08)",
            color: "var(--danger)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Header;
