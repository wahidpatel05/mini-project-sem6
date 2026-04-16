import React, { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import EditEmployeeModal from "../other/EditEmployeeModal";
import DeleteEmployee from "../other/DeleteEmployee";
import { Search, User } from "lucide-react";

const EmployeeList = () => {

  const [userData] = useContext(AuthContext);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= Search Filter ================= */

  const filteredEmployees = useMemo(() => {

    if (!userData) return [];

    return userData.filter((emp) =>
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  }, [userData, searchTerm]);

  /* ================= UI ================= */

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-4 md:p-6">

      {/* ================= Header ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-indigo-600">
            Employee Directory
          </h2>
          <p className="text-sm text-gray-500">
            Manage company staff accounts
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

      </div>

      {/* ================= Employee Grid ================= */}

      {filteredEmployees.length === 0 ? (

        <div className="text-center py-10 text-gray-500">
          No employees found
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filteredEmployees.map((emp) => (

            <div
              key={emp._id}
              className="
              bg-white rounded-xl border
              shadow-sm hover:shadow-md
              transition p-4
            "
            >

              {/* Employee Header */}
              <div className="flex items-center gap-3 mb-3">

                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  {emp.firstName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {emp.firstName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {emp.email}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">

                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm transition"
                >
                  Edit
                </button>

                <DeleteEmployee employeeId={emp._id} />

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ================= Edit Modal ================= */}

      {selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

    </div>
  );
};

export default EmployeeList;
