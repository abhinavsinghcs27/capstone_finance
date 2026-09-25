import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  X,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Loader2,
  Sparkles,
  PieChart,
} from "lucide-react";
import api from "../../services/api";
import AIChatModal from "../../components/common/AIChatModal";

const categories = [
  "Food",
  "Housing",
  "Shopping",
  "Utilities",
  "Transport",
  "Dining",
  "Entertainment",
  "Health & Medical",
  "Education",
  "Travel",
  "Subscriptions",
  "Other",
];

const emptyForm = {
  category: "Food",
  limit: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [summaryData, setSummaryData] = useState({
    total_budget: 0,
    total_spent: 0,
    total_remaining: 0,
    over_budget_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // AI Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");

  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const email = savedUser.email || "";

      const res = await api.get("/user-data/budgets", {
        params: email ? { email } : {},
      });

      if (res.data?.success && Array.isArray(res.data.budgets)) {
        setBudgets(res.data.budgets);
        if (res.data.summary) {
          setSummaryData(res.data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const openAddModal = () => {
    setEditingBudget(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      limit: String(budget.limit),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limitNum = Number(form.limit);
    if (!limitNum || limitNum <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const email = savedUser.email || "";

      const res = await api.post("/user-data/budgets", {
        email,
        category: form.category,
        limit: limitNum,
      });

      if (res.data?.success) {
        setBudgets(res.data.budgets);
        if (res.data.summary) {
          setSummaryData(res.data.summary);
        }
        closeModal();
      }
    } catch (err) {
      console.error("Error saving budget:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async (categoryToDelete) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const email = savedUser.email || "";

      const res = await api.delete("/user-data/budgets", {
        params: { email, category: categoryToDelete },
      });

      if (res.data?.success) {
        setBudgets(res.data.budgets);
        if (res.data.summary) {
          setSummaryData(res.data.summary);
        }
      }
    } catch (err) {
      console.error("Error deleting budget limit:", err);
    }
  };

  const handleAskAI = (b) => {
    setChatPrompt(
      `My monthly budget for ${b.category} is ${formatCurrency(
        b.limit
      )}, but I have spent ${formatCurrency(
        b.spent
      )} (${b.percentage}%). What actionable recommendations do you have to lower my ${b.category} spending?`
    );
    setIsChatOpen(true);
  };

  const overBudgetCategories = useMemo(
    () => budgets.filter((b) => b.over_budget),
    [budgets]
  );

  return (
    <div className="min-h-full bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Live Ledger Spending Control
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f]">
              Monthly Budget Limits
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Category caps auto-synced with recorded transactions and statement uploads.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                setChatPrompt(
                  "Analyze my current monthly category budgets and transaction spending. Where am I overspending or under-budget?"
                );
                setIsChatOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              <BrainCircuit size={18} className="text-emerald-600" />
              AI Budget Advisor
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#102039]"
            >
              <Plus size={18} />
              Set Category Limit
            </button>
          </div>
        </div>

        {/* Over-budget Alert Banner */}
        {overBudgetCategories.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Budget Warning: {overBudgetCategories.length} {overBudgetCategories.length === 1 ? "category" : "categories"} exceeded cap
                </p>
                <p className="text-xs text-rose-700">
                  {overBudgetCategories.map((b) => b.category).join(", ")} exceed planned limits based on recorded expenses.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setChatPrompt(
                  `I have exceeded my spending limits in ${overBudgetCategories
                    .map((b) => `${b.category} (${formatCurrency(b.spent)} / ${formatCurrency(b.limit)})`)
                    .join(", ")}. What immediate adjustments should I make?`
                );
                setIsChatOpen(true);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              <Sparkles size={14} />
              Get Action Plan
            </button>
          </div>
        )}

        {/* Summary Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Planned Budget</p>
            <p className="mt-3 text-2xl font-semibold text-[#07111f]">
              {formatCurrency(summaryData.total_budget)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Sum of active category caps</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Actual Outflow Spent</p>
            <p className="mt-3 text-2xl font-semibold text-[#07111f]">
              {formatCurrency(summaryData.total_spent)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Calculated from live transactions</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Net Remaining Buffer</p>
            <p
              className={`mt-3 text-2xl font-semibold ${
                summaryData.total_remaining >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(summaryData.total_remaining)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {summaryData.total_remaining >= 0 ? "Under overall budget" : "Exceeded total target"}
            </p>
          </div>
        </div>

        {/* Category Budget List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-[#07111f]">
                Category Budgets & Progress
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Track spend progression against limits
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {budgets.length} Categories Active
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="mb-2 h-7 w-7 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Syncing live ledger spending...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wallet size={28} />
              </div>
              <h3 className="text-base font-semibold text-[#07111f]">
                No category budgets defined
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Set category limits to track monthly spending and get AI optimization alerts.
              </p>
              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039]"
              >
                <Plus size={17} />
                Set Your First Budget
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {budgets.map((budget) => {
                const percentage = Math.min(budget.percentage || 0, 100);
                const isOver = budget.over_budget;
                const isNearLimit = !isOver && percentage >= 80;

                return (
                  <div key={budget.id} className="p-5 transition hover:bg-slate-50/50">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#07111f]">{budget.category}</p>
                          {isOver && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              OVER BUDGET
                            </span>
                          )}
                          {isNearLimit && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              NEAR LIMIT (80%+)
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">
                            {formatCurrency(budget.spent)}
                          </span>{" "}
                          spent of {formatCurrency(budget.limit)} limit (
                          <span
                            className={
                              isOver
                                ? "font-bold text-rose-600"
                                : isNearLimit
                                ? "font-semibold text-amber-600"
                                : "text-slate-600"
                            }
                          >
                            {budget.actual_percentage}%
                          </span>
                          )
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOver && (
                          <button
                            type="button"
                            onClick={() => handleAskAI(budget)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <BrainCircuit size={14} />
                            Optimize
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(budget)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                          title="Edit Limit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBudget(budget.category)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition"
                          title="Delete Limit"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5">
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver
                              ? "bg-rose-500"
                              : isNearLimit
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Remaining: {formatCurrency(budget.remaining)}</span>
                        <span>{percentage}% Used</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Budget Limit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-[#07111f]">
                  {editingBudget ? "Edit Category Budget" : "Set Category Limit"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Specify a monthly target for spending control.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-[#07111f] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    disabled={!!editingBudget}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Monthly Limit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.limit}
                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                    placeholder="15000"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#102039] disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingBudget ? "Save Limit" : "Add Limit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Advisor Modal */}
      <AIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatPrompt}
      />
    </div>
  );
}

export default Budget;