import React, { useState } from "react";
import { apiService } from "../../utils/apiService";

const PasswordChangeModal = ({ employee, onClose, onSuccess, isFirstLogin = false }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!isFirstLogin && !oldPassword) {
      setError("Old password is required");
      return;
    }

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    if (newPassword.length < 3) {
      setError("New password must be at least 3 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isFirstLogin && newPassword === oldPassword) {
      setError("New password must be different from old password");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.changePassword(
        employee._id,
        isFirstLogin ? "" : oldPassword,
        newPassword
      );

      if (response.message) {
        setSuccess("Password changed successfully.");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 ${isFirstLogin ? "bg-black/70" : "bg-black/50"} flex items-center justify-center z-50 ${isFirstLogin ? "pointer-events-auto" : ""}`} onClick={!isFirstLogin ? onClose : undefined}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <h2 className={`text-2xl font-bold mb-2 ${isFirstLogin ? "text-red-600" : "text-blue-600"}`}>
          {isFirstLogin ? "🔐 First Time Password Change" : "🔑 Change Password"}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {isFirstLogin
            ? "You must change your password on your first login for security"
            : "Update your password to keep your account secure"}
        </p>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          {/* Old Password */}
          {!isFirstLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full p-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                disabled={loading}
              />
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">At least 3 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            {!isFirstLogin && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 ${
                isFirstLogin
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
