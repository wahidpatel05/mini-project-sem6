import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap } from "lucide-react";

function Login({ handleLogin }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await handleLogin(email, password);
    } catch {
      setErrorMsg("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    setErrorMsg("Only Admin can create new accounts");
    setTimeout(() => setErrorMsg(""), 3000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--accent)" }}
          >
            <GraduationCap size={24} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Faculty Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Card */}
        <div className="ui-card p-6 md:p-8">

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg text-sm text-center"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                Email address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center justify-center pointer-events-none w-5 h-5 bg-white bg-opacity-75 rounded z-10">
                  <Mail size={16} style={{ color: "var(--text-muted)" }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  disabled={loading}
                  className="input-ui"
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center justify-center pointer-events-none w-5 h-5 bg-white bg-opacity-75 rounded z-10">
                  <Lock size={16} style={{ color: "var(--text-muted)" }} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="input-ui pr-10"
                  style={{ paddingLeft: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
              style={
                loading
                  ? { background: "var(--surface-soft)", color: "var(--text-muted)", cursor: "not-allowed" }
                  : { background: "var(--accent)", color: "#fff" }
              }
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#1d4ed8"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent)"; }}
            >
              <LogIn size={17} />
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have access?{" "}
            <span
              onClick={handleSignupClick}
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Contact Admin
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
