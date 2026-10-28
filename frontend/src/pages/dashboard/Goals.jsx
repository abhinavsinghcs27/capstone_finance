import { useEffect, useState } from "react";
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Calculator,
  RefreshCw,
  X,
  Clock,
  PiggyBank,
  ChevronRight,
  Layers,
} from "lucide-react";
import api from "../../services/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const CATEGORIES = [
  "Retirement",
  "Real Estate",
  "Safety",
  "Lifestyle",
  "Education",
  "Wealth",
  "Vehicle",
  "Other",
];

const PRIORITIES = ["Urgent", "High", "Medium", "Low"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const emptyGoalForm = {
  title: "",
  category: "Wealth",
  target_amount: "",
  current_amount: "",
  target_year: new Date().getFullYear() + 3,
  target_month: "December",
  priority: "High",
  monthly_sip: "",
  expected_return: 12.0,
  notes: "",
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addFundAmount, setAddFundAmount] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [form, setForm] = useState(emptyGoalForm);
  const [isSaving, setIsSaving] = useState(false);

  // SIP Calculator State
  const [calcInitial, setCalcInitial] = useState(50000);
  const [calcMonthly, setCalcMonthly] = useState(15000);
  const [calcCagr, setCalcCagr] = useState(12.0);
  const [calcYears, setCalcYears] = useState(5);
  const [calcResult, setCalcResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "";

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/user-data/goals?email=${encodeURIComponent(email)}`);
      if (res.data?.success) {
        setGoals(res.data.goals || []);
      }
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [email]);

  const handleOpenCreateModal = () => {
    setEditingGoalId(null);
    setForm(emptyGoalForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (g) => {
    setEditingGoalId(g.id);
    setForm({
      title: g.title || "",
      category: g.category || "Wealth",
      target_amount: g.target_amount || "",
      current_amount: g.current_amount || "",
      target_year: g.target_year || new Date().getFullYear() + 3,
      target_month: g.target_month || "December",
      priority: g.priority || "High",
      monthly_sip: g.monthly_sip || "",
      expected_return: g.expected_return || 12.0,
      notes: g.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.target_amount) return;

    setIsSaving(true);
    try {
      const goalPayload = {
        ...(editingGoalId ? { id: editingGoalId } : {}),
        title: form.title.trim(),
        category: form.category,
        target_amount: parseFloat(form.target_amount) || 0,
        current_amount: parseFloat(form.current_amount) || 0,
        target_year: parseInt(form.target_year) || new Date().getFullYear() + 3,
        target_month: form.target_month,
        priority: form.priority,
        monthly_sip: parseFloat(form.monthly_sip) || 0,
        expected_return: parseFloat(form.expected_return) || 12.0,
        notes: form.notes.trim(),
      };

      const res = await api.post("/user-data/goals", {
        email,
        goal: goalPayload,
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        fetchGoals();
      }
    } catch (err) {
      console.error("Failed to save goal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this financial goal?")) return;
    try {
      const res = await api.delete(`/user-data/goals/${goalId}?email=${encodeURIComponent(email)}`);
      if (res.data?.success) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !addFundAmount) return;
    const addAmt = parseFloat(addFundAmount) || 0;
    if (addAmt <= 0) return;

    setIsSaving(true);
    try {
      const updatedGoal = {
        ...selectedGoal,
        current_amount: (selectedGoal.current_amount || 0) + addAmt,
      };

      const res = await api.post("/user-data/goals", {
        email,
        goal: updatedGoal,
      });

      if (res.data?.success) {
        setIsFundModalOpen(false);
        setAddFundAmount("");
        setSelectedGoal(null);
        fetchGoals();
      }
    } catch (err) {
      console.error("Failed to update goal funds:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateSIP = async () => {
    setIsSimulating(true);
    try {
      const res = await api.post("/user-data/goals/simulate-sip", {
        initial_investment: calcInitial,
        monthly_sip: calcMonthly,
        annual_cagr: calcCagr,
        years: calcYears,
        inflation_rate: 6.0,
      });
      if (res.data?.success) {
        setCalcResult(res.data.simulation);
      }
    } catch (err) {
      console.error("SIP simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run simulation initially
  useEffect(() => {
    handleSimulateSIP();
  }, [calcInitial, calcMonthly, calcCagr, calcYears]);

  // Aggregate stats
  const totalTarget = goals.reduce((acc, g) => acc + (parseFloat(g.target_amount) || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (parseFloat(g.current_amount) || 0), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const totalMonthlySip = goals.reduce((acc, g) => acc + (parseFloat(g.monthly_sip) || 0), 0);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Financial Milestones & Goals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#07111f] p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Target size={16} />
            <span>Autonomous Wealth Milestone Tracker</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
            Financial Goals & Milestones
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Map, fund, and compound towards your life goals with disciplined monthly SIP commitments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-[#07111f] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 self-start md:self-auto"
        >
          <Plus size={16} />
          Create New Goal
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Target */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Target Capital</span>
            <Target size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#07111f]">
            {formatCurrency(totalTarget)}
          </div>
          <p className="mt-1 text-xs text-slate-500">{goals.length} Active Financial Milestones</p>
        </div>

        {/* Current Accumulated */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Capital Funded</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              {overallPct}% Achieved
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {formatCurrency(totalSaved)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Remaining: <strong className="text-slate-800">{formatCurrency(Math.max(0, totalTarget - totalSaved))}</strong>
          </p>
        </div>

        {/* Total Monthly SIP */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Monthly Commitment</span>
            <PiggyBank size={16} className="text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#07111f]">
            {formatCurrency(totalMonthlySip)}
            <span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Aggregate SIPs across all goals</p>
        </div>

        {/* Overall Completion Gauge */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Portfolio Progress</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-[#07111f]">
            {overallPct}%
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#07111f]">Active Milestones</h3>
            <p className="text-xs text-slate-500">
              Track progress, inject additional capital, and automate monthly contributions.
            </p>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Target size={40} className="text-slate-300" />
            <h4 className="mt-3 text-sm font-bold text-slate-800">No Goals Created Yet</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Define your first milestone like an Emergency Fund, Real Estate Purchase, or Retirement Target.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-[#07111f] shadow-sm transition hover:bg-emerald-400"
            >
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {goals.map((g) => {
              const targetAmt = parseFloat(g.target_amount) || 0;
              const currentAmt = parseFloat(g.current_amount) || 0;
              const pct = targetAmt > 0 ? Math.min(100, Math.round((currentAmt / targetAmt) * 100)) : 0;
              const currentYear = new Date().getFullYear();
              const yearsRemaining = Math.max(0, (g.target_year || currentYear) - currentYear);

              return (
                <div
                  key={g.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    {/* Top Badges & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                          {g.category}
                        </span>

                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                            g.priority === "Urgent"
                              ? "bg-rose-100 text-rose-700"
                              : g.priority === "High"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {g.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(g)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                          title="Edit Goal"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGoal(g.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete Goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Goal Title */}
                    <h4 className="mt-3 text-base font-extrabold text-[#07111f] leading-snug">
                      {g.title}
                    </h4>

                    {g.notes && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {g.notes}
                      </p>
                    )}

                    {/* Progress Bar & Percent */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          {formatCurrency(currentAmt)}
                        </span>
                        <span className="font-extrabold text-[#07111f]">
                          {formatCurrency(targetAmt)}
                        </span>
                      </div>

                      <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100
                              ? "bg-emerald-500"
                              : pct >= 50
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-emerald-600">{pct}% Funded</span>
                        <span>{formatCurrency(Math.max(0, targetAmt - currentAmt))} to go</span>
                      </div>
                    </div>

                    {/* Meta Specs Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50/70 p-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Target Timeline
                        </span>
                        <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} className="text-slate-400" />
                          {g.target_month} {g.target_year} ({yearsRemaining}y)
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Monthly SIP
                        </span>
                        <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <PiggyBank size={12} className="text-emerald-500" />
                          {formatCurrency(g.monthly_sip)}/mo
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Quick Allocate Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      CAGR Est: <strong className="text-slate-700">{g.expected_return || 12}%</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGoal(g);
                        setAddFundAmount("");
                        setIsFundModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
                    >
                      <Plus size={13} />
                      Add Savings
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SIP & Inflation-Adjusted Future Wealth Simulator */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#07111f] flex items-center gap-2">
              <Calculator size={18} className="text-blue-600" />
              Goal Trajectory & SIP Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Calculate the compounded future value of monthly SIPs with 6.0% inflation discounting.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Controls (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Initial Lump-Sum Investment:</span>
                <span className="font-bold text-[#07111f]">{formatCurrency(calcInitial)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={calcInitial}
                onChange={(e) => setCalcInitial(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Monthly SIP Amount:</span>
                <span className="font-bold text-[#07111f]">{formatCurrency(calcMonthly)}/mo</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={calcMonthly}
                onChange={(e) => setCalcMonthly(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Expected Annual Return (CAGR):</span>
                <span className="font-bold text-[#07111f]">{calcCagr}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="0.5"
                value={calcCagr}
                onChange={(e) => setCalcCagr(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Time Horizon:</span>
                <span className="font-bold text-[#07111f]">{calcYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={calcYears}
                onChange={(e) => setCalcYears(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-[#07111f] p-6 text-white">
            {calcResult ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Estimated Future Corpus ({calcYears} Years)
                  </span>
                  <div className="mt-1 text-3xl font-black text-white">
                    {formatCurrency(calcResult.future_corpus)}
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Wealth Multiplier: <strong className="text-emerald-400">{calcResult.wealth_multiplier}x</strong> your total deposits
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400">Total Invested:</span>
                    <div className="font-bold text-slate-100">{formatCurrency(calcResult.total_invested)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Compound Returns:</span>
                    <div className="font-bold text-emerald-400">+{formatCurrency(calcResult.wealth_gain)}</div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-800/60 p-3 text-xs border border-slate-700">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Inflation-Adjusted Purchasing Power (6% inflation):</span>
                    <strong className="text-amber-400">{formatCurrency(calcResult.inflation_adjusted_value)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#07111f]">
                {editingGoalId ? "Edit Financial Milestone" : "Create Financial Milestone"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Emergency Fund, House Down Payment"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Priority Level</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1000000"
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Current Saved (₹)</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={form.current_amount}
                    onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Target Month</label>
                  <select
                    value={form.target_month}
                    onChange={(e) => setForm({ ...form, target_month: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Target Year</label>
                  <input
                    type="number"
                    value={form.target_year}
                    onChange={(e) => setForm({ ...form, target_year: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Monthly SIP Contribution (₹)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={form.monthly_sip}
                    onChange={(e) => setForm({ ...form, monthly_sip: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Expected CAGR (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.expected_return}
                    onChange={(e) => setForm({ ...form, expected_return: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Strategy / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or fund allocation strategy..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-[#07111f] shadow-md transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingGoalId ? "Update Goal" : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD SAVINGS MODAL */}
      {isFundModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#07111f]">
                Add Funds to {selectedGoal.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFunds} className="mt-4 space-y-3 text-xs">
              <p className="text-slate-500">
                Currently Saved: <strong className="text-slate-800">{formatCurrency(selectedGoal.current_amount)}</strong> of {formatCurrency(selectedGoal.target_amount)}
              </p>

              <div>
                <label className="font-semibold text-slate-700">Deposit Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={addFundAmount}
                  onChange={(e) => setAddFundAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !addFundAmount}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-[#07111f] shadow-md transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSaving ? "Depositing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

