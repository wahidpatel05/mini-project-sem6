import React from "react";
import { LogOut } from "lucide-react";

const Header = (props) => {

  const logOutUser = () => {
    props.changeUser();
  };

  const username = props.data?.firstName || "Admin";
  const role = props.data ? "Employee" : "Admin";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 rounded-md border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
        >
          {username.charAt(0).toUpperCase()}
        </div>

        {/* Greeting */}
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Welcome back
          </p>
          <h1 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text)" }}>
            {username}
          </h1>
          <span
            className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            {role}
          </span>
        </div>

      </div>

      {/* ================= RIGHT ================= */}
      <button
        onClick={logOutUser}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all active:scale-[0.98]"
        style={{ background: "rgba(244,63,94,0.15)", color: "#F43F5E", border: "1px solid rgba(244,63,94,0.25)" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.25)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(244,63,94,0.15)"}
      >
        <LogOut size={16} />
        Logout
      </button>

    </div>
  );
};

export default Header;
