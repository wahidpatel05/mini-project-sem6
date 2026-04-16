import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { apiService } from "../../utils/apiService";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const CreateEmployee = () => {

  const [, , { refreshEmployees }] =
    useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= Validation ================= */

  const validateInputs = () => {

    if (!firstName.trim()) {
      setError("Employee name is required");
      return false;
    }

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter valid email address");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 3) {
      setError("Password must be at least 3 characters");
      return false;
    }

    return true;
  };

  /* ================= Submit ================= */

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInputs()) return;

    setLoading(true);

    try {
      await apiService.createEmployee(firstName, email, password);

      await refreshEmployees();

      setFirstName("");
      setEmail("");
      setPassword("");

    } catch (err) {
      setError(err.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div
      className="
      bg-white/80 backdrop-blur-xl
      rounded-2xl shadow-xl border
      border-gray-200
      p-4 md:p-6
      max-w-xl
    "
    >
      {/* ================= Header ================= */}

      <div className="flex items-center gap-2 mb-5">

        <div className="p-2 bg-indigo-100 rounded-lg">
          <UserPlus size={20} className="text-indigo-600" />
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-bold text-indigo-600">
            Create Employee
          </h2>
          <p className="text-xs text-gray-500">
            Add new staff member to system
          </p>
        </div>

      </div>

      {/* ================= Error ================= */}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* ================= Form ================= */}

      <form onSubmit={submitHandler} className="space-y-4">

        {/* Name */}

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Employee Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter full name"
            disabled={loading}
            className="
            w-full p-3 rounded-lg
            border bg-gray-50
            focus:ring-2 focus:ring-indigo-400
            outline-none transition
          "
          />
        </div>

        {/* Email */}

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@company.com"
            disabled={loading}
            className="
            w-full p-3 rounded-lg
            border bg-gray-50
            focus:ring-2 focus:ring-indigo-400
            outline-none transition
          "
          />
        </div>

        {/* Password */}

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Temporary Password
          </label>

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 3 characters"
              disabled={loading}
              className="
              w-full p-3 rounded-lg
              border bg-gray-50
              focus:ring-2 focus:ring-indigo-400
              outline-none transition
              pr-10
            "
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

        {/* Submit Button */}

        <button
          type="submit"
          disabled={loading}
          className={`
          w-full py-3 rounded-lg font-semibold
          flex items-center justify-center gap-2
          transition
          ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          }
        `}
        >
          {loading ? "Creating..." : "Add Employee"}
        </button>

      </form>

    </div>
  );
};

export default CreateEmployee;
