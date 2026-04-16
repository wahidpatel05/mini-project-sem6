import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";

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
    <div className="ui-shell flex items-center justify-center px-4 py-10">
      
      

      <div className="w-full max-w-md ui-card p-6 md:p-8">

        {/* ================= Header ================= */}

        <div className="text-center mb-6">

          <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <ShieldCheck size={20} className="text-slate-700" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>

          <p className="text-gray-600 text-sm">
            Login to access your dashboard
          </p>

        </div>

        {/* ================= Error ================= */}

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* ================= Form ================= */}

        <form onSubmit={submitHandler} className="space-y-5">

          {/* Email */}

          <div className="relative">

            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              disabled={loading}
              className="
              w-full pl-10 pr-4 py-3
              rounded-lg border border-slate-300 bg-white
              focus:ring-2 focus:ring-slate-300
              outline-none transition
            "
            />

          </div>

          {/* Password */}

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              className="
              w-full pl-10 pr-10 py-3
              rounded-lg border border-slate-300 bg-white
              focus:ring-2 focus:ring-slate-300
              outline-none transition
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

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className={`
            w-full py-3 rounded-lg font-semibold
            flex items-center justify-center gap-2
            transition
            ${
              loading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }
          `}
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* ================= Footer ================= */}

        <p className="text-center text-sm text-gray-600 mt-6">

          Don’t have access?{" "}
          <span
            onClick={handleSignupClick}
            className="text-slate-900 font-semibold cursor-pointer hover:underline"
          >
            Contact Admin
          </span>

        </p>

      </div>

    </div>
  );
}

export default Login;
