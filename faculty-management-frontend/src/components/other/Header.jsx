import React from "react";
import { LogOut, User } from "lucide-react";

const Header = (props) => {

  const logOutUser = () => {
    props.changeUser();
  };

  const username = props.data?.firstName || "Admin";
  const role = props.data ? "Employee" : "Admin";

  return (
    <div
      className="
      flex flex-col sm:flex-row
      sm:items-center sm:justify-between
      gap-3
      bg-white/80 backdrop-blur-xl
      px-4 sm:px-6 py-4
      rounded-2xl shadow-md
      border border-gray-200
    "
    >
      {/* ================= LEFT ================= */}

      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
          {username.charAt(0).toUpperCase()}
        </div>

        {/* Greeting */}
        <div>

          <p className="text-xs text-gray-500">
            Welcome back
          </p>

          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            {username}
          </h1>

          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
            {role}
          </span>

        </div>

      </div>

      {/* ================= RIGHT ================= */}

      <button
        onClick={logOutUser}
        className="
        flex items-center gap-2
        bg-rose-600 hover:bg-rose-700
        text-white
        px-4 py-2 rounded-lg
        font-semibold text-sm
        transition shadow-md
      "
      >
        <LogOut size={16} />
        Logout
      </button>

    </div>
  );
};

export default Header;
