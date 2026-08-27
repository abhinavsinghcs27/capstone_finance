import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import { signupUser, googleLogin } from "./authService";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const data = await signupUser({ name, email, password });

      if (!data.success) {
        setError(data.message || "Signup failed.");
        return;
      }

      saveUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    }
  };

  const handleGoogle = async (response) => {
    try {
      const data = await googleLogin(response.credential);

      if (!data.success) {
        setError(data.message || "Google signup failed.");
        return;
      }

      saveUser(data.user);
    } catch (err) {
      console.error("Google signup error:", err);
      setError(err.response?.data?.message || err.message || "Google signup failed. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(7,17,31,0.08)] sm:p-10">

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-emerald-600">
            Get started
          </p>
          <h1 className="text-3xl font-semibold text-[#07111f]">
            Create your FinanceAI account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Start understanding your finances with intelligent insights.
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
            onError={() => setError("Google signup failed.")}
            width="100%"
          />
        </div>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">OR</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSignup}>
          <label className="text-sm font-medium text-slate-700">
            Full name
          </label>

          <div className="relative mt-2">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <label className="mt-5 block text-sm font-medium text-slate-700">
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

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative mt-2">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
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

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Confirm password
          </label>

          <div className="relative mt-2">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm outline-none focus:border-emerald-500"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#0c1b2d]"
          >
            Create account
            <ArrowRight size={17} />
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-emerald-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;