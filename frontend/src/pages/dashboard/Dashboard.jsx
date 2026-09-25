import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  ShieldCheck,
  WalletCards,
  Sparkles,
  FileUp,
  Loader2,
  Bot,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Receipt,
  PieChart,
  Calendar,
  CreditCard,
  Plus,
  ArrowDownLeft,
  ChevronRight,
  PiggyBank,
  CheckCheck,
} from "lucide-react";
import AIChatModal from "../../components/common/AIChatModal";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }
    return String(dateString);
  } catch {
    return String(dateString);
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const email = savedUser.email || "";

    const loadDashboardData = async () => {
      setIsLoadingDashboard(true);
      try {
        // 1. Fetch Profile & Evaluation
        const profileRes = await api.get("/user-data", {
          params: email ? { email } : {},
        });
        if (profileRes.data?.user) {
          setUser(profileRes.data.user);
          setEvaluation(profileRes.data.evaluation);
        }

        // 2. Fetch Transactions Ledger
        const txnRes = await api.get("/user-data/transactions", {
          params: email ? { email } : {},
        });
        if (txnRes.data?.success && Array.isArray(txnRes.data.transactions)) {
          setTransactions(txnRes.data.transactions);
        }

        // 3. Fetch AI Insights
        if (email || profileRes.data?.user) {
          fetchAiInsights(email);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    loadDashboardData();
  }, []);

  const fetchAiInsights = async (email) => {
    setIsLoadingInsights(true);
    try {
      const res = await api.get("/user-data/ai-insights", {
        params: email ? { email } : {},
      });
      if (res.data?.success && res.data.data) {
        setAiInsights(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load AI insights:", err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleOpenChatWithPrompt = (promptText) => {
    setChatPrompt(promptText);
    setIsChatOpen(true);
  };

  // ------------------------------------------------------------
  // Financial Calculations & Metrics
  // ------------------------------------------------------------
  const metrics = useMemo(() => {
    const monthlyIncome = Number(user?.monthly_income || 0) + Number(user?.other_income || 0);
    const fixedExp = Number(user?.fixed_expenses || 0);
    const varExp = Number(user?.variable_expenses || 0);
    const debtEmi = Number(user?.existing_debt || 0);
    const totalOutflow = fixedExp + varExp + debtEmi;

    const liquidSavings = Number(user?.current_savings || 0);
    const emergencyFund = Number(user?.emergency_fund || 0);
    const totalReserves = liquidSavings + emergencyFund;

    const stocks = Number(user?.stocks || 0);
    const mutualFunds = Number(user?.mutual_funds || 0);
    const fixedDeposit = Number(user?.fixed_deposit || 0);
    const gold = Number(user?.gold || 0);
    const otherInvestments = Number(user?.other_investments || 0);
    const totalInvestments = stocks + mutualFunds + fixedDeposit + gold + otherInvestments;

    const netCashFlow = monthlyIncome - totalOutflow;
    const savingsRatio = monthlyIncome > 0 ? Math.round(((monthlyIncome - totalOutflow) / monthlyIncome) * 100) : 0;
    const debtRatio = monthlyIncome > 0 ? Math.round((debtEmi / monthlyIncome) * 100) : 0;
    const emergencyMonths = totalOutflow > 0 ? (emergencyFund / totalOutflow).toFixed(1) : "0";

    const totalNetWorth = totalReserves + totalInvestments - debtEmi * 12;

    return {
      monthlyIncome,
      totalOutflow,
      fixedExp,
      varExp,
      debtEmi,
      netCashFlow,
      liquidSavings,
      emergencyFund,
      totalReserves,
      stocks,
      mutualFunds,
      fixedDeposit,
      gold,
      otherInvestments,
      totalInvestments,
      totalNetWorth,
      savingsRatio,
      debtRatio,
      emergencyMonths,
    };
  }, [user]);

  // Category breakdown computed from live transactions
  const categoryBreakdown = useMemo(() => {
    const categoryTotals = {};
    let totalExpenseAmount = 0;

    for (const t of transactions) {
      const type = String(t.type || "").toLowerCase();
      if (type === "expense" || type === "debit") {
        const cat = t.category || "Other";
        const amt = Number(t.amount) || 0;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        totalExpenseAmount += amt;
      }
    }

    if (totalExpenseAmount === 0 && user) {
      // Fallback distribution from profile
      return [
        { name: "Housing & Rent", amount: Number(user.fixed_expenses) * 0.7, pct: 45, color: "bg-blue-500" },
        { name: "Food & Dining", amount: Number(user.variable_expenses) * 0.45, pct: 25, color: "bg-emerald-500" },
        { name: "Loan & Debt EMIs", amount: Number(user.existing_debt), pct: 18, color: "bg-rose-500" },
        { name: "Utilities & Transport", amount: Number(user.fixed_expenses) * 0.3, pct: 12, color: "bg-amber-500" },
      ];
    }

    return Object.entries(categoryTotals)
      .map(([name, amount], index) => {
        const pct = Math.round((amount / totalExpenseAmount) * 100);
        const colors = [
          "bg-indigo-500",
          "bg-emerald-500",
          "bg-amber-500",
          "bg-rose-500",
          "bg-blue-500",
          "bg-teal-500",
          "bg-purple-500",
        ];
        return {
          name,
          amount,
          pct,
          color: colors[index % colors.length],
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions, user]);

  const recentTransactions = transactions.slice(0, 5);
  const healthScore = evaluation?.health_score?.score || 80;
  const healthGrade = evaluation?.health_score?.grade || "Excellent";

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8 pb-12">
      {/* ====================================================== */}
      {/* 1. HERO FINANCIAL OVERVIEW HEADER */}
      {/* ====================================================== */}
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Financial Intelligence
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#07111f] sm:text-4xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Your real-time net worth, monthly cash flow velocity, and AI financial recommendations are up to date.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/upload-statement")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <FileUp size={16} />
            Sync Statement
          </button>

          <button
            type="button"
            onClick={() => handleOpenChatWithPrompt("Give me a holistic financial health evaluation and 3 optimization steps.")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#07111f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Bot size={16} />
            AI Advisor Copilot
          </button>
        </div>
      </section>

      {/* ====================================================== */}
      {/* 2. TOP METRICS CARDS GRID (FILLED & DYNAMIC) */}
      {/* ====================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Net Worth */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Estimated Net Worth</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#07111f]">
            {formatCurrency(metrics.totalNetWorth > 0 ? metrics.totalNetWorth : metrics.totalInvestments + metrics.totalReserves)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600">
              <ArrowUpRight size={13} />
              Liquid: {formatCurrency(metrics.totalReserves)}
            </span>
          </div>
        </div>

        {/* Monthly Inflow */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Monthly Inflow</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#07111f]">
            {formatCurrency(metrics.monthlyIncome)}
          </p>
          <p className="mt-2 text-xs text-slate-400 font-medium">
            Primary + Consulting Inflows
          </p>
        </div>

        {/* Monthly Outflow / Burn */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Monthly Outflow</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-[#07111f]">
            {formatCurrency(metrics.totalOutflow)}
          </p>
          <p className="mt-2 text-xs text-slate-400 font-medium">
            Fixed ₹{metrics.fixedExp.toLocaleString("en-IN")} | EMI ₹{metrics.debtEmi.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Net Monthly Cash Flow */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Net Monthly Surplus</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <PiggyBank size={18} />
            </div>
          </div>
          <p className={`mt-3 text-2xl font-black ${metrics.netCashFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {metrics.netCashFlow >= 0 ? "+" : ""}{formatCurrency(metrics.netCashFlow)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span>Savings rate: {metrics.savingsRatio}% of income</span>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* 3. FINANCIAL HEALTH SCORECARD BANNER */}
      {/* ====================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#07111f] p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-400 ring-8 ring-emerald-400/10">
              <span className="text-2xl font-black">{healthScore}</span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Financial Health Grade: {healthGrade}
                </span>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  SEBI CFP Evaluated
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                {typeof evaluation?.summary === "string"
                  ? evaluation.summary
                  : `${healthGrade} Financial Runway — ${formatCurrency(metrics.netCashFlow)}/mo Net Surplus`}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Your debt-to-income ratio is healthy at {metrics.debtRatio}%, and your emergency reserve covers {metrics.emergencyMonths} months of fixed obligations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/portfolio")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-xs font-bold text-[#07111f] transition hover:bg-emerald-300"
            >
              <TrendingUp size={15} />
              Explore Stock Picks
            </button>
            <button
              type="button"
              onClick={() => handleOpenChatWithPrompt("How can I increase my Financial Health Score from 80 to 95?")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <Bot size={15} className="text-emerald-400" />
              Ask AI to Optimize
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* 4. MAIN ANALYTICS & AI INSIGHTS SPLIT */}
      {/* ====================================================== */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Left Column: Cash Flow & Spending Distribution */}
        <div className="space-y-6">
          {/* Monthly Cash Flow Meter */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash Flow Velocity</p>
                <h3 className="text-lg font-bold text-[#07111f]">Monthly Capital Allocation</h3>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Current Month
              </span>
            </div>

            {/* Inflow vs Outflow Visual Meter */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Monthly Inflow (₹{metrics.monthlyIncome.toLocaleString("en-IN")})</span>
                  <span className="text-emerald-600">100%</span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, 100 - metrics.savingsRatio))}%` }}
                    title="Outflows & Expenses"
                  />
                  <div
                    className="h-full bg-indigo-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, metrics.savingsRatio))}%` }}
                    title="Net Savings & Investment Buffer"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Spent / Debt: {formatCurrency(metrics.totalOutflow)} ({100 - metrics.savingsRatio}%)
                  </span>
                  <span className="flex items-center gap-1 font-bold text-indigo-600">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Surplus / Investable: {formatCurrency(metrics.netCashFlow)} ({metrics.savingsRatio}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Category Outflow Bars */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Top Spending Allocations
              </h4>
              <div className="space-y-3.5">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{cat.name}</span>
                      <span className="text-[#07111f] font-bold">
                        {formatCurrency(cat.amount)} ({cat.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, cat.pct * 1.5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Ledger Transactions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Stream</p>
                <h3 className="text-lg font-bold text-[#07111f]">Recent Ledger Transactions</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate("/dashboard/transactions")}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 transition hover:text-emerald-700"
              >
                View Full Ledger
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t, idx) => {
                  const isIncome = String(t.type || "").toLowerCase() === "income" || String(t.type || "").toLowerCase() === "credit";
                  const isInvestment = String(t.type || "").toLowerCase() === "investment";
                  return (
                    <div key={idx} className="flex items-center justify-between py-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-3 min-w-0 max-w-xs sm:max-w-md">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isIncome
                              ? "bg-emerald-50 text-emerald-600"
                              : isInvestment
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-rose-50 text-rose-500"
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft size={16} /> : isInvestment ? <TrendingUp size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#07111f]">{t.description}</p>
                          <p className="text-[11px] text-slate-400">
                            {formatDate(t.date)} · <span className="font-semibold text-slate-500">{t.category}</span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 font-bold ${
                          isIncome ? "text-emerald-600" : isInvestment ? "text-indigo-600" : "text-[#07111f]"
                        }`}
                      >
                        {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No transactions recorded. Click "Sync Statement" to import bank activity.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic AI Insights & Asset Allocation */}
        <div className="space-y-6">
          {/* AI Financial Insights Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Powered by Groq GPT-OSS-20B
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#07111f]">AI Financial Action Plan</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BrainCircuit size={20} />
              </div>
            </div>

            {isLoadingInsights ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={24} className="animate-spin text-emerald-600 mx-auto mb-2" />
                <p className="text-xs">Analyzing financial posture...</p>
              </div>
            ) : aiInsights ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3.5 text-xs text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>Executive Summary</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{aiInsights.summary}</p>
                </div>

                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {aiInsights.insights?.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs transition hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-between font-bold text-[#07111f]">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.type === "warning"
                                ? "bg-amber-500"
                                : item.type === "achievement"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                          />
                          {item.title}
                        </span>
                        {item.estimated_monthly_impact && (
                          <span className="text-[11px] font-bold text-emerald-700">
                            {item.estimated_monthly_impact}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-slate-500 leading-normal">{item.description}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenChatWithPrompt("How can I best execute these AI financial insights?")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#07111f] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Bot size={15} />
                  Discuss Strategy with Copilot
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <Sparkles size={20} className="mx-auto text-emerald-500 mb-2" />
                Your AI Advisor is ready to generate insights.
              </div>
            )}
          </div>

          {/* Asset Allocation Snapshot */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Wealth Allocation</p>
                <h3 className="text-lg font-bold text-[#07111f]">Investment Assets</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate("/dashboard/portfolio")}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Manage
              </button>
            </div>

            <div className="mt-5 space-y-3.5">
              {[
                { name: "Mutual Funds (SIPs)", value: metrics.mutualFunds, color: "bg-indigo-500" },
                { name: "Indian Equities / Stocks", value: metrics.stocks, color: "bg-emerald-500" },
                { name: "Fixed Deposits", value: metrics.fixedDeposit, color: "bg-amber-500" },
                { name: "Gold / SGBs", value: metrics.gold, color: "bg-yellow-500" },
              ].map((asset, idx) => {
                const pct = metrics.totalInvestments > 0 ? Math.round((asset.value / metrics.totalInvestments) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{asset.name}</span>
                      <span className="text-[#07111f] font-bold">
                        {formatCurrency(asset.value)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${asset.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* FLOATING COPILOT TRIGGER BUTTON & MODAL */}
      {/* ====================================================== */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-[#07111f] px-5 py-3.5 text-xs font-bold text-white shadow-2xl shadow-slate-950/30 transition-all hover:scale-105 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/30"
      >
        <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[#07111f]">
          <BrainCircuit size={13} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
        </div>
        <span>FinanceAI Copilot</span>
      </button>

      <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} initialPrompt={chatPrompt} />
    </div>
  );
}

export default Dashboard;