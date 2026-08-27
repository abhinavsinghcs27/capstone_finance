import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import { login, googleLogin } from "./authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const data = await login({ email, password });

      if (!data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      saveUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login.");
    }
  };

  const handleGoogle = async (response) => {
    try {
      const data = await googleLogin(response.credential);

      if (!data.success) {
        setError(data.message || "Google login failed.");
        return;
      }

      saveUser(data.user);
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.response?.data?.message || err.message || "Google login failed. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(7,17,31,0.08)] sm:p-10">

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-emerald-600">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold text-[#07111f]">
            Sign in to FinanceAI
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Continue to your financial intelligence dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setError("Google login failed.")}
            width="100%"
          />
        </div>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleLogin}>
          <label className="text-sm font-medium text-slate-700">
            Email address
          </label>

          <div className="relative mt-2">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>

            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-emerald-600"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative mt-2">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm outline-none focus:border-emerald-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#0c1b2d]"
          >
            Sign in
            <ArrowRight size={17} />
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="font-semibold text-emerald-600"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;