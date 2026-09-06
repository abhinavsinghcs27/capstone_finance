import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Pencil,
  Save,
  WalletCards,
  TrendingUp,
  ReceiptText,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  PiggyBank
} from "lucide-react";

const ExtractedDataPreview = ({
  data = {},
  onConfirm,
  onBack,
  isSaving = false,
}) => {
  const profile = data?.extraction_profile || data || {};
  const docInfo = data?.document_info || {};
  const transactions = data?.sample_transactions || data?.simple_transactions || [];

  const [financialData, setFinancialData] = useState({
    monthlyIncome: Number(profile.monthly_income ?? profile.monthlyIncome ?? 0),
    otherIncome: Number(profile.other_income ?? profile.otherIncome ?? 0),
    fixedExpenses: Number(profile.fixed_expenses ?? profile.fixedExpenses ?? 0),
    variableExpenses: Number(profile.variable_expenses ?? profile.variableExpenses ?? 0),
    existingDebt: Number(profile.existing_debt ?? profile.existingDebt ?? 0),
    currentSavings: Number(profile.current_savings ?? profile.currentSavings ?? 0),
    emergencyFund: Number(profile.emergency_fund ?? profile.emergencyFund ?? 0),
    mutualFunds: Number(profile.mutual_funds ?? profile.mutualFunds ?? 0),
    stocks: Number(profile.stocks ?? 0),
    fixedDeposit: Number(profile.fixed_deposit ?? profile.fixedDeposit ?? 0),
    gold: Number(profile.gold ?? 0),
    riskTolerance: profile.risk_tolerance || profile.riskTolerance || "Moderate",
    dependents: Number(profile.dependents ?? 1),
    insurance: profile.insurance || "Standard Life & Health",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const prof = data?.extraction_profile || data || {};
    setFinancialData({
      monthlyIncome: Number(prof.monthly_income ?? prof.monthlyIncome ?? 0),
      otherIncome: Number(prof.other_income ?? prof.otherIncome ?? 0),
      fixedExpenses: Number(prof.fixed_expenses ?? prof.fixedExpenses ?? 0),
      variableExpenses: Number(prof.variable_expenses ?? prof.variableExpenses ?? 0),
      existingDebt: Number(prof.existing_debt ?? prof.existingDebt ?? 0),
      currentSavings: Number(prof.current_savings ?? prof.currentSavings ?? 0),
      emergencyFund: Number(prof.emergency_fund ?? prof.emergencyFund ?? 0),
      mutualFunds: Number(prof.mutual_funds ?? prof.mutualFunds ?? 0),
      stocks: Number(prof.stocks ?? 0),
      fixedDeposit: Number(prof.fixed_deposit ?? prof.fixedDeposit ?? 0),
      gold: Number(prof.gold ?? 0),
      riskTolerance: prof.risk_tolerance || prof.riskTolerance || "Moderate",
      dependents: Number(prof.dependents ?? 1),
      insurance: prof.insurance || "Standard Life & Health",
    });
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFinancialData((prev) => ({
      ...prev,
      [name]: name === "riskTolerance" || name === "insurance" ? value : Number(value || 0),
    }));
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(financialData);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Salary":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Other Inflow":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "Fixed Expense":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Variable Spend":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Investment":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* ================= HEADER & DOCUMENT INFO ================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 size={14} />
              Extraction Complete
            </span>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#07111f] sm:text-3xl">
              Review Extracted Financial Data
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              We parsed your document and synthesized the key financial profile indicators below.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {docInfo.detect_bank && (
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                <Building2 size={16} className="text-slate-500" />
                <span>{docInfo.detect_bank}</span>
              </div>
            )}
            {docInfo.statement_period && (
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                <Calendar size={16} className="text-slate-500" />
                <span>{docInfo.statement_period}</span>
              </div>
            )}
            {docInfo.filename && (
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                <FileText size={16} className="text-slate-500" />
                <span className="max-w-[150px] truncate">{docInfo.filename}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
              <WalletCards size={16} className="text-emerald-600" />
              Monthly Income
            </div>
            <div className="mt-2 text-xl font-bold text-[#07111f]">
              {formatCurrency(financialData.monthlyIncome)}
            </div>
            {financialData.otherIncome > 0 && (
              <div className="mt-1 text-[11px] text-emerald-700">
                + {formatCurrency(financialData.otherIncome)} other inflow
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-rose-800">
              <ReceiptText size={16} className="text-rose-600" />
              Total Outflow
            </div>
            <div className="mt-2 text-xl font-bold text-[#07111f]">
              {formatCurrency(
                financialData.fixedExpenses + financialData.variableExpenses + financialData.existingDebt
              )}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Fixed: {formatCurrency(financialData.fixedExpenses)} | Var: {formatCurrency(financialData.variableExpenses)}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-800">
              <TrendingUp size={16} className="text-indigo-600" />
              Investments (MF/Stocks)
            </div>
            <div className="mt-2 text-xl font-bold text-[#07111f]">
              {formatCurrency(financialData.mutualFunds + financialData.stocks)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              MF: {formatCurrency(financialData.mutualFunds)} | Stocks: {formatCurrency(financialData.stocks)}
            </div>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-teal-800">
              <PiggyBank size={16} className="text-teal-600" />
              Savings & Liquid
            </div>
            <div className="mt-2 text-xl font-bold text-[#07111f]">
              {formatCurrency(financialData.currentSavings)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Emergency fund: {formatCurrency(financialData.emergencyFund)}
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDITABLE PROFILE PARAMETERS ================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#07111f]">
              Financial Profile Parameters
            </h3>
            <p className="text-xs text-slate-500 sm:text-sm">
              {isEditing
                ? "Modify any detected parameter below if needed."
                : "Parsed parameters to sync to your FinanceAI profile."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-[#07111f] transition hover:bg-slate-100"
          >
            <Pencil size={15} />
            {isEditing ? "Done editing" : "Edit values"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "monthlyIncome", label: "Monthly Income", icon: WalletCards },
            { key: "otherIncome", label: "Other Inflows / Interest", icon: ArrowDownLeft },
            { key: "fixedExpenses", label: "Fixed Expenses (Rent/Bills)", icon: ReceiptText },
            { key: "variableExpenses", label: "Variable Spending (Food/UPI)", icon: CreditCard },
            { key: "existingDebt", label: "Existing Debt / EMIs", icon: ArrowUpRight },
            { key: "currentSavings", label: "Closing / Current Savings", icon: PiggyBank },
            { key: "emergencyFund", label: "Emergency Reserve", icon: ShieldCheck },
            { key: "mutualFunds", label: "Mutual Funds Inflows", icon: TrendingUp },
            { key: "stocks", label: "Stocks / Equity Inflows", icon: TrendingUp },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div
                key={field.key}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Icon size={16} />
                  <span>{field.label}</span>
                </div>

                {isEditing ? (
                  <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                    <span className="text-xs font-semibold text-slate-400">₹</span>
                    <input
                      type="number"
                      name={field.key}
                      value={financialData[field.key]}
                      onChange={handleChange}
                      min="0"
                      className="w-full bg-transparent px-2 text-sm font-semibold text-[#07111f] outline-none"
                    />
                  </div>
                ) : (
                  <div className="mt-2 text-base font-semibold text-[#07111f]">
                    {formatCurrency(financialData[field.key])}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SAMPLE TRANSACTIONS ================= */}
      {transactions.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#07111f]">
                Parsed Sample Transactions
              </h3>
              <p className="text-xs text-slate-500 sm:text-sm">
                Showing top categorized transactions extracted from your document.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {transactions.length} transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {transactions.map((txn, index) => (
                  <tr key={index} className="hover:bg-slate-50/70">
                    <td className="py-3 text-slate-500">{txn.date || "-"}</td>
                    <td className="py-3 font-medium text-[#07111f] max-w-xs truncate">
                      {txn.description}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${getCategoryBadgeClass(
                          txn.category
                        )}`}
                      >
                        {txn.category}
                      </span>
                    </td>
                    <td
                      className={`py-3 text-right font-semibold ${
                        txn.type === "CREDIT"
                          ? "text-emerald-600"
                          : "text-slate-800"
                      }`}
                    >
                      {txn.type === "CREDIT" ? "+" : "-"}{" "}
                      {formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Upload another statement
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#142033] disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? "Syncing profile..." : "Confirm & Sync Profile"}
        </button>
      </div>
    </div>
  );
};

export default ExtractedDataPreview;