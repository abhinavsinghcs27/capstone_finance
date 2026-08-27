import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  CheckCircle2,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import { forgotPassword } from "./authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await forgotPassword(email);

      setSubmitted(true);
    } catch (err) {
      console.error("Password reset error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to process your request. Please try again.",
      );
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(7,17,31,0.08)] sm:p-10"
      >
        {!submitted ? (
          <>
            {/* Back */}
            <Link
              to="/auth/login"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#07111f]"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Mail size={22} />
              </div>

              <p className="mb-3 text-sm font-medium text-emerald-600">
                Password recovery
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[#07111f]">
                Forgot your password?
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="forgot-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0c1b2d] hover:shadow-lg"
              >
                Send reset instructions

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </form>

            {/* Login */}
            <p className="mt-7 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/auth/login"
                className="font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                Sign in
              </Link>
            </p>
          </>
        ) : (
          /* Success */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#07111f]">
              Check your inbox
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              If an account exists for{" "}
              <span className="font-medium text-slate-700">
                {email}
              </span>
              , you'll receive password reset instructions shortly.
            </p>

            <Link
              to="/auth/login"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0c1b2d] hover:shadow-lg"
            >
              Back to sign in
              <ArrowRight size={17} />
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs leading-5 text-slate-400">
        We'll only use your email to help recover your account.
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;