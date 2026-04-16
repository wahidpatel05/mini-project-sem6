import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";

const AllTask = () => {

  const [userData] = useContext(AuthContext);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-4 md:p-6 mt-6">

      {/* ================= Header ================= */}

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-lg md:text-xl font-bold text-indigo-600">
          Team Task Overview
        </h2>

        <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
          Live Data
        </span>

      </div>

      {/* ================= Desktop Table ================= */}

      <div className="hidden md:block">

        <div className="grid grid-cols-5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 font-semibold text-sm p-3">

          <div>Employee</div>
          <div className="text-center">New</div>
          <div className="text-center">Active</div>
          <div className="text-center">Completed</div>
          <div className="text-center">Failed</div>

        </div>

        <div className="divide-y mt-2">

          {userData?.length > 0 ? (
            userData.map((emp) => (

              <div
                key={emp._id}
                className="
                grid grid-cols-5 items-center
                p-3 rounded-lg
                hover:bg-indigo-50 transition
              "
              >

                <div className="font-medium text-gray-800">
                  {emp.firstName}
                </div>

                <div className="text-center text-sky-600 font-semibold">
                  {emp.taskCounts?.newTask || 0}
                </div>

                <div className="text-center text-yellow-600 font-semibold">
                  {emp.taskCounts?.active || 0}
                </div>

                <div className="text-center text-emerald-600 font-semibold">
                  {emp.taskCounts?.completed || 0}
                </div>

                <div className="text-center text-rose-600 font-semibold">
                  {emp.taskCounts?.failed || 0}
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No employees found
            </div>
          )}

        </div>

      </div>

      {/* ================= Mobile Cards ================= */}

      <div className="md:hidden space-y-3">

        {userData?.length > 0 ? (
          userData.map((emp) => (

            <div
              key={emp._id}
              className="bg-white rounded-xl border shadow p-4"
            >

              <h3 className="font-semibold text-indigo-700 mb-3">
                {emp.firstName}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">

                <Stat label="New" value={emp.taskCounts?.newTask} color="text-sky-600" />
                <Stat label="Active" value={emp.taskCounts?.active} color="text-yellow-600" />
                <Stat label="Completed" value={emp.taskCounts?.completed} color="text-emerald-600" />
                <Stat label="Failed" value={emp.taskCounts?.failed} color="text-rose-600" />

              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No employees found
          </div>
        )}

      </div>

    </div>
  );
};

/* ================= Small Component ================= */

const Stat = ({ label, value, color }) => {
  return (
    <div className="flex justify-between bg-gray-50 p-2 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${color}`}>
        {value || 0}
      </span>
    </div>
  );
};

export default AllTask;
