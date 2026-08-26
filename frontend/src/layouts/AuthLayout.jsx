import { motion } from "framer-motion";
import {
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";

function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#07111f] text-white lg:grid lg:grid-cols-[1.15fr_0.85fr]">

      {/* LEFT SIDE */}
      <section className="relative hidden overflow-hidden lg:flex">

        {/* Background glow */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07111f]">
              <BrainCircuit size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Finance<span className="text-emerald-400">AI</span>
              </h1>

              <p className="text-xs text-slate-400">
                Intelligent Financial Platform
              </p>
            </div>
          </div>

          {/* Hero */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
              <Sparkles size={15} className="text-emerald-400" />
              AI-powered financial intelligence
            </div>

            <h2 className="text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
              Make smarter
              <span className="block text-emerald-400">
                financial decisions.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              Understand your money, measure your financial risk and turn
              complex financial data into actionable insights.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<TrendingUp size={18} />}
                title="Smart Analytics"
                text="Understand your financial trends."
              />

              <FeatureCard
                icon={<ShieldCheck size={18} />}
                title="Risk Intelligence"
                text="Know your financial risk before it matters."
              />
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-slate-500">
            Your data. Your decisions. Powered by intelligence.
          </p>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 py-12 text-[#07111f]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
        {icon}
      </div>

      <h3 className="font-medium text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

export default AuthLayout;