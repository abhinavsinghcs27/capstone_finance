import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Target,
  FileText,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import api from "../../services/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function FinancialHealthReportModal({ isOpen, onClose, userEmail }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const email = userEmail || JSON.parse(localStorage.getItem("user") || "{}").email || "";
        const res = await api.get("/user-data/report", {
          params: email ? { email } : {},
        });
        if (res.data?.success) {
          setReport(res.data);
        } else {
          setError("Could not generate financial health report.");
        }
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError("Failed to fetch financial audit data from the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleOpenPrintView = () => {
    const email = userEmail || JSON.parse(localStorage.getItem("user") || "{}").email || "";
    const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
    const reportUrl = `${baseUrl}/user-data/report/html?email=${encodeURIComponent(email)}`;
    window.open(reportUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Financial_Report_${report.report_meta?.report_id || "FinanceAI"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* ============================================================ */}
        {/* MODAL TOP HEADER */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#07111f]">Financial Health Audit Report</h2>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Certified AI Audit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Report ID: {report?.report_meta?.report_id || "Generating..."} • {report?.report_meta?.generated_at}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenPrintView}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              title="Open print view or save as PDF"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              title="Download structured JSON"
            >
              <Download size={14} />
              JSON
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ml-2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MODAL SCROLLABLE CONTENT */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={36} className="animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium">Synthesizing comprehensive financial health diagnostics...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle size={36} className="text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700">{error}</p>
            </div>
          ) : report ? (
            <>
              {/* 1. EXECUTIVE SCORECARD BANNER */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#07111f] via-slate-900 to-slate-800 p-6 text-white shadow-md">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-3xl font-black text-white shadow-lg shadow-emerald-500/30">
                      {report.audit_score?.overall_score}
                      <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#07111f] text-xs font-bold text-emerald-400 border border-emerald-500/50">
                        {report.audit_score?.grade}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Composite Health Rating
                        </span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {report.audit_score?.overall_score >= 80
                          ? "Excellent Financial Health"
                          : report.audit_score?.overall_score >= 60
                          ? "Good Financial Health"
                          : "Needs Attention & Optimization"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-300 max-w-xl">
                        {report.audit_score?.verdict}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 border-t border-slate-700/60 pt-4 md:border-t-0 md:pt-0">
                    <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Risk Profile</p>
                      <p className="text-sm font-black text-emerald-300">{report.report_meta?.risk_tolerance}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Net Worth</p>
                      <p className="text-sm font-black text-white">
                        {formatCurrency(report.balance_sheet?.total_net_worth)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. FOUR DIAGNOSTIC PILLARS */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Diagnostic Pillar Breakdown (25 pts each)
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {report.audit_score?.pillars?.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700 truncate">{p.name}</span>
                        <span className="font-extrabold text-emerald-600">{p.score}/{p.max_score}</span>
                      </div>
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${(p.score / p.max_score) * 100}%` }}
                        />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>{p.metric}</span>
                        <span className="font-semibold text-slate-700">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. CASH FLOW & BALANCE SHEET METRICS */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Cash Flow Summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#07111f] flex items-center gap-2">
                      <ArrowUpRight size={16} className="text-emerald-500" />
                      Monthly Cash Flow Velocity
                    </h4>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {report.cash_flow?.savings_rate}% Savings Rate
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Total Inflow (Income)</span>
                      <span className="font-bold text-[#07111f]">{formatCurrency(report.cash_flow?.monthly_income)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Fixed & Essential Outflows</span>
                      <span className="font-bold text-slate-700">{formatCurrency(report.cash_flow?.fixed_expenses)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Variable / Discretionary</span>
                      <span className="font-bold text-slate-700">{formatCurrency(report.cash_flow?.variable_expenses)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Debt & EMI Obligations</span>
                      <span className="font-bold text-rose-600">{formatCurrency(report.cash_flow?.debt_emi)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-extrabold text-sm text-[#07111f]">
                      <span>Net Cash Retained</span>
                      <span className="text-emerald-600">{formatCurrency(report.cash_flow?.net_cash_flow)}</span>
                    </div>
                  </div>
                </div>

                {/* Asset Allocation & Net Worth */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#07111f] flex items-center gap-2">
                      <PieChart size={16} className="text-indigo-500" />
                      Asset Allocation & Reserves
                    </h4>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {formatCurrency(report.balance_sheet?.total_assets)} Total Assets
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Liquid Savings & Emergency Buffer</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(report.balance_sheet?.liquid_reserves)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Equity Stocks & ETFs</span>
                      <span className="font-bold text-[#07111f]">{formatCurrency(report.balance_sheet?.investments?.stocks)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Mutual Funds (SIPs)</span>
                      <span className="font-bold text-[#07111f]">{formatCurrency(report.balance_sheet?.investments?.mutual_funds)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Fixed Deposits & Gold</span>
                      <span className="font-bold text-[#07111f]">
                        {formatCurrency(Number(report.balance_sheet?.investments?.fixed_deposit || 0) + Number(report.balance_sheet?.investments?.gold || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 font-extrabold text-sm text-[#07111f]">
                      <span>Total Estimated Net Worth</span>
                      <span className="text-indigo-600">{formatCurrency(report.balance_sheet?.total_net_worth)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. BUDGET SPENDING DISCIPLINE TABLE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#07111f]">Category Budget Adherence</h4>
                  <span className="text-xs text-slate-400">
                    {report.budget_analysis?.over_budget_count === 0 ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} /> All categories within budget
                      </span>
                    ) : (
                      <span className="text-rose-500 font-semibold flex items-center gap-1">
                        <AlertTriangle size={13} /> {report.budget_analysis?.over_budget_count} categories over limit
                      </span>
                    )}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="pb-2 font-semibold">Category</th>
                        <th className="pb-2 font-semibold">Monthly Limit</th>
                        <th className="pb-2 font-semibold">Actual Spent</th>
                        <th className="pb-2 font-semibold">Remaining</th>
                        <th className="pb-2 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {report.budget_analysis?.categories?.slice(0, 6).map((b, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-bold text-[#07111f]">{b.category}</td>
                          <td className="py-2.5 text-slate-600">{formatCurrency(b.limit)}</td>
                          <td className="py-2.5 text-slate-600">{formatCurrency(b.spent)}</td>
                          <td className={`py-2.5 font-bold ${b.over_budget ? "text-rose-600" : "text-emerald-600"}`}>
                            {formatCurrency(b.remaining)}
                          </td>
                          <td className="py-2.5 text-right">
                            {b.over_budget ? (
                              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                                Over Budget ({b.actual_percentage}%)
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                Healthy ({b.actual_percentage}%)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. STRATEGIC AI ACTION PLAN MATRIX */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-[#07111f] flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  Prescriptive AI Action Plan
                </h4>

                <div className="space-y-2.5">
                  {report.action_matrix?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-xs ${
                        item.urgency === "High"
                          ? "border-rose-200 bg-rose-50/40"
                          : item.urgency === "Medium"
                          ? "border-amber-200 bg-amber-50/40"
                          : "border-blue-200 bg-blue-50/40"
                      }`}
                    >
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase shrink-0 ${
                          item.urgency === "High"
                            ? "bg-rose-100 text-rose-700"
                            : item.urgency === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.urgency}
                      </span>
                      <div className="flex-1">
                        <strong className="text-slate-800">{item.timeframe} — {item.category}:</strong>{" "}
                        <span className="text-slate-600">{item.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* ============================================================ */}
        {/* MODAL BOTTOM FOOTER */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 rounded-b-3xl">
          <p className="text-xs text-slate-400">
            Powered by FinanceAI Autonomous Financial Intelligence Engine
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
