import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { apiService } from "../../utils/apiService";
import { UserCog, Eye, EyeOff, Save, X } from "lucide-react";

const EditEmployeeModal = ({ employee, onClose }) => {

  const [, , { refreshEmployees }] =
    useContext(AuthContext);

  const [firstName, setFirstName] = useState(employee.firstName);
  const [email, setEmail] = useState(employee.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= Validation ================= */

  const validateForm = () => {

    if (!firstName.trim()) {
      setError("Employee name is required");
      return false;
    }

    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }

    if (password && password.length < 3) {
      setError("Password must be at least 3 characters");
      return false;
    }

    return true;
  };

  /* ================= Update Handler ================= */

  const handleUpdate = async (e) => {

    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {

      const payload = {
        firstName,
        email,
      };

      // Only update password if changed
      if (password) {
        payload.password = password;
      }

      await apiService.updateEmployee(employee._id, payload);
      await refreshEmployees();

      onClose();

    } catch (err) {
      setError(err.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6">

        {/* ================= Header ================= */}

        <div className="flex justify-between items-center mb-5">

          <div className="flex items-center gap-2">

            <div className="bg-indigo-100 p-2 rounded-lg">
              <UserCog size={20} className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-indigo-600">
                Edit Employee
              </h2>
              <p className="text-xs text-gray-500">
                Update staff account details
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

        </div>

        {/* ================= Error ================= */}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ================= Form ================= */}

        <form onSubmit={handleUpdate} className="space-y-4">

          {/* Name */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Employee Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              className="input-ui"
            />
          </div>

          {/* Email */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="input-ui"
            />
          </div>

          {/* Password */}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              New Password (Optional)
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                disabled={loading}
                className="input-ui pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>

          </div>

          {/* ================= Buttons ================= */}

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`
              flex-1 py-2 rounded-lg font-semibold
              flex items-center justify-center gap-2
              transition
              ${
                loading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
              }
            `}
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditEmployeeModal;
