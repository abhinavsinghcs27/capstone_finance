import { useNavigate } from "react-router";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  ShieldCheck,
  WalletCards,
  Sparkles,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-[1500px]">

      {/* Welcome */}
      <section className="mb-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Financial Overview
              </p>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f] sm:text-4xl">
              Welcome to FinanceAI
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Your financial intelligence workspace is ready. Complete your
              profile to unlock personalized analytics, risk intelligence and
              AI-powered insights.
            </p>
          </div>

          <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm md:block">
            Profile setup · 0%
          </div>
        </div>
      </section>

      {/* Profile Setup */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#07111f] p-6 shadow-sm sm:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
              <Sparkles size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">
                Get started
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Build your financial profile
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Tell FinanceAI about your income, expenses, savings and
                investments. We'll use this information to personalize your
                financial intelligence.
              </p>
            </div>
          </div>

          <button
           type="button"
           onClick={() => {
             navigate("/profile-setup");
           }}
           className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07111f] transition hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-lg"
          >
          Complete profile

          <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
           />
          </button>

        </div>
      </section>

      {/* Overview Cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EmptyCard
          icon={WalletCards}
          title="Financial balance"
          description="Add your financial details to see your balance."
        />

        <EmptyCard
          icon={BarChart3}
          title="Cash flow"
          description="Your income and expenses will appear here."
        />

        <EmptyCard
          icon={BriefcaseBusiness}
          title="Investments"
          description="Your investment overview will appear here."
        />

        <EmptyCard
          icon={ShieldCheck}
          title="Financial health"
          description="Your personalized financial score will appear here."
        />
      </section>

      {/* Analytics */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

        {/* Chart Empty State */}
        <div className="min-h-[330px] rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Analytics
              </p>

              <h2 className="mt-2 text-lg font-semibold text-[#07111f]">
                Cash flow overview
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <BarChart3 size={19} />
            </div>
          </div>

          <div className="flex h-[220px] flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-300">
              <BarChart3 size={21} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#07111f]">
              No financial data yet
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              Your income and expense trends will appear here once your
              financial profile is completed.
            </p>
          </div>
        </div>

        {/* AI Empty State */}
        <div className="min-h-[330px] rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
                  FinanceAI
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#07111f]">
                  AI insights
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BrainCircuit size={19} />
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <Sparkles size={20} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#07111f]">
                Your AI advisor is waiting
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Complete your financial profile to receive personalized
                recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Empty States */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">

        <EmptyPanel
          icon={BriefcaseBusiness}
          eyebrow="Portfolio"
          title="Investment intelligence"
          description="Connect your investment information to understand allocation, performance and opportunities."
        />

        <EmptyPanel
          icon={ShieldCheck}
          eyebrow="Risk Intelligence"
          title="Understand your financial risk"
          description="FinanceAI will evaluate your financial position and highlight areas that need attention."
        />

      </section>
    </div>
  );
}

function EmptyCard({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
        <Icon size={19} />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-[#07111f]">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[#07111f]">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[8%] rounded-full bg-emerald-400" />
      </div>

      <p className="mt-2 text-right text-[11px] text-slate-400">
        Waiting for your data
      </p>
    </div>
  );
}

export default Dashboard;