import { useEffect, useState } from "react";
import {
  FileBarChart,
  Printer,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  PieChart,
  ExternalLink,
  ChevronRight,
  Download,
} from "lucide-react";
import api from "../../services/api";
import FinancialHealthReportModal from "../../components/common/FinancialHealthReportModal";
import FormattedAIMessage from "../../components/common/FormattedAIMessage";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "";

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/user-data/report?email=${encodeURIComponent(email)}`);
      if (res.data?.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error("Failed to load financial report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [email]);

  const handlePrintExport = () => {
    const printUrl = `${api.defaults.baseURL || "http://127.0.0.1:5000"}/user-data/report/html?email=${encodeURIComponent(
      email
    )}&autoprint=1`;
    window.open(printUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Generating Comprehensive Financial Audit...</p>
      </div>
    );
  }

  const audit = reportData?.audit_score || {};
  const cashFlow = reportData?.cash_flow || {};
  const balanceSheet = reportData?.balance_sheet || {};
  const pillars = audit.pillars || [];
  const actionMatrix = reportData?.action_matrix || [];
  const budgetAdherence = reportData?.budget_adherence || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#07111f] p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <FileBarChart size={16} />
            <span>Autonomous Financial Intelligence Audit</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
            Financial Health & Audit Reports
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Complete diagnostic evaluation of cash flow solvency, risk resilience, and strategic capital allocation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchReport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <RefreshCw size={14} />
            Recalculate
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20"
          >
            <Sparkles size={14} />
            Diagnostic View
          </button>

          <button
            type="button"
            onClick={handlePrintExport}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-[#07111f] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
          >
            <Printer size={15} />
            Export / Print PDF
          </button>
        </div>
      </div>

      {/* Audit Score & Top Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Score Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Overall Audit Score</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                audit.grade === "A"
                  ? "bg-emerald-100 text-emerald-700"
                  : audit.grade === "B"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              Grade {audit.grade || "B"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#07111f]">{audit.total_score || 0}</span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">{audit.status_label || "Financial Posture Evaluated"}</p>
        </div>

        {/* Net Monthly Cash Flow */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Net Monthly Surplus</span>
            {cashFlow.net_surplus >= 0 ? (
              <span className="flex items-center text-xs font-bold text-emerald-600">
                <ArrowUpRight size={14} /> Surplus
              </span>
            ) : (
              <span className="flex items-center text-xs font-bold text-rose-600">
                <ArrowDownRight size={14} /> Deficit
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-black text-[#07111f]">
            {formatCurrency(cashFlow.net_surplus)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Savings Rate: <strong className="text-slate-800">{cashFlow.savings_rate}%</strong>
          </p>
        </div>

        {/* Emergency Runway */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Emergency Runway</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              Liquidity
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#07111f]">
              {reportData?.key_ratios?.emergency_runway_months || 0}
            </span>
            <span className="text-xs font-medium text-slate-500">Months Buffer</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Target: <strong className="text-slate-800">6.0 Months</strong> of expenses
          </p>
        </div>

        {/* Debt-to-Income Ratio */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Debt-to-Income (DTI)</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                (reportData?.key_ratios?.dti_ratio || 0) < 30
                  ? "bg-emerald-100 text-emerald-700"
                  : (reportData?.key_ratios?.dti_ratio || 0) <= 40
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {(reportData?.key_ratios?.dti_ratio || 0) < 30 ? "Safe" : "Elevated"}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-[#07111f]">
            {reportData?.key_ratios?.dti_ratio || 0}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Monthly Debt EMIs: <strong className="text-slate-800">{formatCurrency(cashFlow.debt_obligations)}</strong>
          </p>
        </div>
      </div>

      {/* 4 Pillars Scoring */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#07111f]">4-Pillar Diagnostic Breakdown</h3>
            <p className="text-xs text-slate-500">
              Mathematical scoring across the four foundational pillars of wealth durability.
            </p>
          </div>
          <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200">
            Max 25 pts per pillar
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {pillars.map((pillar, idx) => {
            const pct = Math.min(100, Math.round((pillar.score / pillar.max) * 100));
            return (
              <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{pillar.name}</span>
                  <span className="text-xs font-extrabold text-[#07111f]">
                    {pillar.score} / {pillar.max} pts
                  </span>
                </div>

                <div className="mt-2.5 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{pillar.status}</span>
                  <span>{pct}% benchmark</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cash Flow vs Balance Sheet Deep Dive */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cash Flow Summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#07111f] flex items-center gap-2">
              <Wallet size={18} className="text-emerald-600" />
              Monthly Cash Inflow & Outflow
            </h3>
            <span className="text-xs font-bold text-slate-400">Monthly Run-rate</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/50 p-3 text-xs">
              <span className="font-semibold text-emerald-900">Total Monthly Inflows</span>
              <span className="font-extrabold text-emerald-800">
                {formatCurrency(cashFlow.monthly_inflow)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <span className="text-slate-600">Fixed Essential Expenses</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(cashFlow.fixed_expenses)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <span className="text-slate-600">Discretionary / Variable Spend</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(cashFlow.variable_expenses)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <span className="text-slate-600">Debt & EMI Payments</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(cashFlow.debt_obligations)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
              <span className="font-bold text-slate-900">Total Monthly Outflows</span>
              <span className="font-extrabold text-rose-600">
                {formatCurrency(cashFlow.total_outflow)}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Sheet Net Worth */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#07111f] flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Balance Sheet & Solvency
            </h3>
            <span className="text-xs font-bold text-slate-400">Net Position</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-3 text-xs">
              <span className="font-semibold text-blue-900">Liquid Cash & Reserves</span>
              <span className="font-extrabold text-blue-800">
                {formatCurrency(balanceSheet.liquid_reserves)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <span className="text-slate-600">Equity Investments (Stocks / Funds)</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(balanceSheet.equity_investments)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
              <span className="text-slate-600">Fixed Income & Gold Assets</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(balanceSheet.debt_and_gold)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-rose-50/50 p-3 text-xs">
              <span className="font-semibold text-rose-900">Reported Outstanding Debt</span>
              <span className="font-extrabold text-rose-700">
                {formatCurrency(balanceSheet.total_liabilities)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
              <span className="font-bold text-slate-900">Total Capital Solvency</span>
              <span className="font-extrabold text-emerald-600">
                {formatCurrency(balanceSheet.solvency_capital)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Adherence Ledger */}
      {budgetAdherence.tracked_categories?.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#07111f]">Budget Adherence & Spending Audit</h3>
              <p className="text-xs text-slate-500">Comparing active envelopes against actual transaction outflows.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {budgetAdherence.over_budget_count > 0 ? (
                <span className="text-rose-600 font-bold">
                  {budgetAdherence.over_budget_count} Categories Over Limit
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">All Budgets Within Limits</span>
              )}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Budget Limit</th>
                  <th className="py-2.5">Actual Spent</th>
                  <th className="py-2.5">Utilization</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {budgetAdherence.tracked_categories.map((b, idx) => {
                  const pct = b.budget > 0 ? Math.min(150, Math.round((b.spent / b.budget) * 100)) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-[#07111f]">{b.category}</td>
                      <td className="py-3">{formatCurrency(b.budget)}</td>
                      <td className="py-3 font-medium">{formatCurrency(b.spent)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                pct > 100 ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {b.over_budget ? (
                          <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            Over Budget
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Within Budget
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategic AI Action Plan */}
      {actionMatrix.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#07111f] flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Prescriptive Strategic Action Plan
              </h3>
              <p className="text-xs text-slate-500">Autonomous priority roadmap to elevate your audit score.</p>
            </div>
            <span className="rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              {actionMatrix.length} Action Items
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {actionMatrix.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 rounded-2xl border p-4 text-xs ${
                  item.urgency === "High"
                    ? "border-rose-200 bg-rose-50/40"
                    : item.urgency === "Medium"
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <span
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase shrink-0 ${
                    item.urgency === "High"
                      ? "bg-rose-100 text-rose-700"
                      : item.urgency === "Medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.urgency} Urgency
                </span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    {item.timeframe} — {item.category}
                  </div>
                  <div className="mt-1 text-slate-700 leading-relaxed">
                    <FormattedAIMessage content={item.action} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostic Modal */}
      <FinancialHealthReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={email}
      />
    </div>
  );
}

