import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { apiService } from "../../utils/apiService";
import { Trash2, AlertTriangle } from "lucide-react";

const DeleteEmployee = ({ employeeId }) => {

  const [, , { refreshEmployees }] =
    useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {

    setLoading(true);

    try {
      await apiService.deleteEmployee(employeeId);
      await refreshEmployees();
      setShowConfirm(false);

    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= Trigger Button ================= */}

      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={`
        flex items-center gap-1
        px-3 py-1.5 rounded-lg text-xs font-semibold
        transition
        ${
          loading
            ? "bg-rose-300 cursor-not-allowed"
            : "bg-rose-600 hover:bg-rose-700 text-white shadow"
        }
      `}
      >
        <Trash2 size={14} />
        Delete
      </button>

      {/* ================= Confirmation Modal ================= */}

      {showConfirm && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">

              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="text-red-600" size={20} />
              </div>

              <h2 className="text-lg font-bold text-red-600">
                Delete Employee
              </h2>

            </div>

            {/* Warning Text */}
            <p className="text-gray-700 text-sm mb-5">
              This action is permanent and will remove the employee and all
              associated tasks from the system.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">

              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="
                flex-1 py-2 rounded-lg
                bg-gray-200 hover:bg-gray-300
                font-semibold text-sm
              "
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className={`
                flex-1 py-2 rounded-lg font-semibold text-sm
                transition
                ${
                  loading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }
              `}
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default DeleteEmployee;
