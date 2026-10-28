import { useEffect, useState } from "react";
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Building,
  RefreshCw,
  Sliders,
  DollarSign,
  Bot,
  Info,
} from "lucide-react";
import api from "../../services/api";
import AIChatModal from "../../components/common/AIChatModal";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function TaxSimulator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");

  // Input states
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [isSalaried, setIsSalaried] = useState(true);
  const [sec80c, setSec80c] = useState(150000);
  const [sec80d, setSec80d] = useState(25000);
  const [hra, setHra] = useState(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [nps, setNps] = useState(0);
  const [otherExemptions, setOtherExemptions] = useState(0);

  // Result state
  const [taxResult, setTaxResult] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "";

  // Initial load
  useEffect(() => {
    async function loadInitialProfile() {
      setIsLoading(true);
      try {
        const res = await api.get(`/user-data/tax-calculator?email=${encodeURIComponent(email)}`);
        if (res.data?.success) {
          setTaxResult(res.data);
          if (res.data.gross_income) {
            setGrossIncome(res.data.gross_income);
          }
          if (res.data.old_regime?.deductions?.section_80c) {
            setSec80c(res.data.old_regime.deductions.section_80c);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial tax profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialProfile();
  }, [email]);

  // Recalculate on input changes
  const runSimulation = async (customGross = grossIncome) => {
    setIsSimulating(true);
    try {
      const payload = {
        gross_income: Number(customGross),
        sec_80c: Number(sec80c),
        sec_80d: Number(sec80d),
        hra: Number(hra),
        home_loan_interest_24b: Number(homeLoanInterest),
        nps_80ccd_1b: Number(nps),
        other_exemptions: Number(otherExemptions),
        is_salaried: isSalaried,
      };
      const res = await api.post("/user-data/tax-calculator/simulate", payload);
      if (res.data?.success) {
        setTaxResult(res.data);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGrossSlider = (val) => {
    setGrossIncome(val);
    runSimulation(val);
  };

  const handleAskAITax = () => {
    const prompt = `I have a gross annual salary of ${formatCurrency(grossIncome)}. Under the Old Regime I have ₹${sec80c} in 80C, ₹${sec80d} in 80D, and ₹${homeLoanInterest} in Home Loan interest. Currently, the ${taxResult?.recommended_regime || "New Regime"} is recommended. What specific tax-saving investments or structuring strategies can I implement to minimize my tax liability legally under Indian tax laws?`;
    setChatPrompt(prompt);
    setIsChatOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Indian Income Tax Simulator (FY 2024-25)...</p>
      </div>
    );
  }

  const oldReg = taxResult?.old_regime || {};
  const newReg = taxResult?.new_regime || {};
  const isNewBetter = taxResult?.recommended_regime === "New Regime";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#07111f] p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <Calculator size={16} />
            <span>Finance Act 2024 Compliance & Optimization</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
            Indian Income Tax Simulator
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Compare Old vs. New Tax Regime (Section 115BAC) slabs, evaluate 80C/80D/HRA deductions, and minimize your tax burden.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAskAITax}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-[#07111f] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 md:self-auto"
        >
          <Bot size={16} />
          Ask AI Tax Strategist
        </button>
      </div>

      {/* Recommended Verdict Banner */}
      {taxResult && (
        <div
          className={`rounded-3xl border p-6 transition-all shadow-sm ${
            isNewBetter
              ? "border-emerald-200 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white"
              : "border-indigo-200 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-white"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={13} /> Recommended: {taxResult.recommended_regime}
              </span>
              <h2 className="text-xl font-extrabold text-[#07111f]">
                {taxResult.headline}
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                {taxResult.reason}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shrink-0 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Tax Delta</p>
                <p className="text-2xl font-black text-emerald-600">
                  {taxResult.annual_savings > 0 ? `+${formatCurrency(taxResult.annual_savings)}` : "₹0"}
                </p>
                <p className="text-[10px] text-slate-500">annual savings</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Inputs Simulator & Side-by-Side Comparison */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        {/* Left Column: Interactive Input Controls */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Parameter Simulation</p>
              <h3 className="text-lg font-bold text-[#07111f]">Income & Deductions</h3>
            </div>
            <button
              type="button"
              onClick={() => runSimulation()}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <RefreshCw size={13} className={isSimulating ? "animate-spin" : ""} />
              Recalculate
            </button>
          </div>

          {/* Gross Annual Income */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <label htmlFor="gross-income">Gross Annual Salary / Inflow</label>
              <span className="font-extrabold text-emerald-700 font-mono text-sm">
                {formatCurrency(grossIncome)}
              </span>
            </div>
            <input
              id="gross-income"
              type="range"
              min="300000"
              max="5000000"
              step="50000"
              value={grossIncome}
              onChange={(e) => handleGrossSlider(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹3 Lakh</span>
              <span>₹25 Lakh</span>
              <span>₹50 Lakh</span>
            </div>
          </div>

          {/* Salaried Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
            <div>
              <span className="font-bold text-[#07111f]">Salaried Employee</span>
              <p className="text-[11px] text-slate-500">Eligible for Standard Deduction (₹75k New / ₹50k Old)</p>
            </div>
            <input
              type="checkbox"
              checked={isSalaried}
              onChange={(e) => {
                setIsSalaried(e.target.checked);
                runSimulation();
              }}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          {/* Chapter VI-A Deductions Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              Old Regime Deductions
            </div>

            {/* Section 80C */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Section 80C (PPF, ELSS, EPF, LIC)</span>
                <span className="font-bold text-[#07111f]">{formatCurrency(sec80c)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="150000"
                step="5000"
                value={sec80c}
                onChange={(e) => {
                  setSec80c(Number(e.target.value));
                  runSimulation();
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Max limit: ₹1,50,000</span>
            </div>

            {/* Section 80D (Health Insurance) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Section 80D (Health Insurance)</span>
                <span className="font-bold text-[#07111f]">{formatCurrency(sec80d)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="75000"
                step="5000"
                value={sec80d}
                onChange={(e) => {
                  setSec80d(Number(e.target.value));
                  runSimulation();
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Self: ₹25k + Parents: up to ₹50k</span>
            </div>

            {/* Section 24(b) Home Loan Interest */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Home Loan Interest — Sec 24(b)</span>
                <span className="font-bold text-[#07111f]">{formatCurrency(homeLoanInterest)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="10000"
                value={homeLoanInterest}
                onChange={(e) => {
                  setHomeLoanInterest(Number(e.target.value));
                  runSimulation();
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Max limit: ₹2,00,000</span>
            </div>

            {/* NPS 80CCD(1B) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>NPS Additional — Sec 80CCD(1B)</span>
                <span className="font-bold text-[#07111f]">{formatCurrency(nps)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="5000"
                value={nps}
                onChange={(e) => {
                  setNps(Number(e.target.value));
                  runSimulation();
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Max limit: ₹50,000</span>
            </div>

            {/* HRA Exemption */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>HRA (House Rent Allowance Exemption)</span>
                <span className="font-bold text-[#07111f]">{formatCurrency(hra)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="300000"
                step="10000"
                value={hra}
                onChange={(e) => {
                  setHra(Number(e.target.value));
                  runSimulation();
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Side-by-Side Cards */}
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* New Regime Card */}
            <div
              className={`rounded-3xl border p-6 shadow-sm transition-all relative ${
                isNewBetter
                  ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white"
              }`}
            >
              {isNewBetter && (
                <span className="absolute -top-3 right-6 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Best Value
                </span>
              )}

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Default Regime</span>
                  <h3 className="text-lg font-black text-[#07111f]">New Tax Regime</h3>
                  <p className="text-[11px] text-slate-400">Sec 115BAC (Budget 2024 Slabs)</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Effective Rate</p>
                  <p className="text-base font-bold text-slate-800">{newReg.effective_tax_rate}%</p>
                </div>
              </div>

              {/* Total Payable Stat */}
              <div className="my-5 rounded-2xl bg-slate-50 p-4 text-center">
                <span className="text-xs font-semibold text-slate-500">Total Tax Payable (inc. 4% Cess)</span>
                <p className="mt-1 text-3xl font-black text-[#07111f]">
                  {formatCurrency(newReg.total_tax)}
                </p>
                {newReg.rebate_87a > 0 && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-600">
                    🎉 ₹{newReg.rebate_87a.toLocaleString("en-IN")} Rebate u/s 87A applied (Zero Tax!)
                  </p>
                )}
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Gross Salary</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(newReg.gross_income)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Standard Deduction</span>
                  <span className="font-semibold text-emerald-600">-{formatCurrency(newReg.standard_deduction)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Chapter VI-A Deductions</span>
                  <span className="text-slate-400 italic">Not Allowed</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600 font-bold">
                  <span>Taxable Income</span>
                  <span className="text-slate-900">{formatCurrency(newReg.taxable_income)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Base Tax</span>
                  <span>{formatCurrency(newReg.base_tax)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Health & Edu Cess (4%)</span>
                  <span>{formatCurrency(newReg.cess_4_pct)}</span>
                </div>
              </div>

              {/* Slabs breakdown */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Applied Slabs</p>
                <div className="space-y-1.5 text-[11px]">
                  {newReg.slab_breakdown?.length === 0 ? (
                    <p className="text-slate-400 italic">No tax applicable in any slab.</p>
                  ) : (
                    newReg.slab_breakdown?.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>{s.slab}</span>
                        <span className="font-mono font-medium">{formatCurrency(s.tax)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Old Regime Card */}
            <div
              className={`rounded-3xl border p-6 shadow-sm transition-all relative ${
                !isNewBetter
                  ? "border-indigo-500 bg-white ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white"
              }`}
            >
              {!isNewBetter && (
                <span className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Best Value
                </span>
              )}

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Optional Regime</span>
                  <h3 className="text-lg font-black text-[#07111f]">Old Tax Regime</h3>
                  <p className="text-[11px] text-slate-400">With 80C, 80D, HRA & Home Loan</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Effective Rate</p>
                  <p className="text-base font-bold text-slate-800">{oldReg.effective_tax_rate}%</p>
                </div>
              </div>

              {/* Total Payable Stat */}
              <div className="my-5 rounded-2xl bg-slate-50 p-4 text-center">
                <span className="text-xs font-semibold text-slate-500">Total Tax Payable (inc. 4% Cess)</span>
                <p className="mt-1 text-3xl font-black text-[#07111f]">
                  {formatCurrency(oldReg.total_tax)}
                </p>
                {oldReg.rebate_87a > 0 && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-600">
                    🎉 ₹{oldReg.rebate_87a.toLocaleString("en-IN")} Rebate u/s 87A applied!
                  </p>
                )}
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Gross Salary</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(oldReg.gross_income)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Standard Deduction</span>
                  <span className="font-semibold text-emerald-600">-{formatCurrency(oldReg.standard_deduction)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Chapter VI-A Deductions Claimed</span>
                  <span className="font-semibold text-emerald-600">
                    -{formatCurrency((oldReg.deductions?.total_deductions || 0) - (oldReg.standard_deduction || 0))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600 font-bold">
                  <span>Taxable Income</span>
                  <span className="text-slate-900">{formatCurrency(oldReg.taxable_income)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Base Tax</span>
                  <span>{formatCurrency(oldReg.base_tax)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Health & Edu Cess (4%)</span>
                  <span>{formatCurrency(oldReg.cess_4_pct)}</span>
                </div>
              </div>

              {/* Slabs breakdown */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Applied Slabs</p>
                <div className="space-y-1.5 text-[11px]">
                  {oldReg.slab_breakdown?.length === 0 ? (
                    <p className="text-slate-400 italic">No tax applicable in any slab.</p>
                  ) : (
                    oldReg.slab_breakdown?.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>{s.slab}</span>
                        <span className="font-mono font-medium">{formatCurrency(s.tax)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Educational Tax Planning Tip Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#07111f]">
              <Info size={16} className="text-emerald-600" />
              <span>How to Choose: The Breakeven Deduction Rule</span>
            </div>
            <p className="leading-relaxed">
              If your total deductions (80C + 80D + HRA + Home Loan Interest + Standard Deduction) exceed <strong>₹3,75,000 to ₹4,25,000</strong> per year, the <strong>Old Tax Regime</strong> usually yields higher savings. If your deductions are below this threshold, the <strong>New Tax Regime</strong> is more lucrative and eliminates paperwork proofs.
            </p>
          </div>
        </div>
      </div>

      {/* AI Chat Modal Integration */}
      <AIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialPrompt={chatPrompt}
      />
    </div>
  );
}

