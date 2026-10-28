import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  ArrowRight,
  TrendingDown,
  Info,
  BadgeAlert,
  Check,
} from "lucide-react";
import api from "../../services/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function RiskIntelligence() {
  const [riskData, setRiskData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "";

  const fetchRiskData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/user-data/risk-intelligence?email=${encodeURIComponent(email)}`);
      if (res.data?.success) {
        setRiskData(res.data);
      }
    } catch (err) {
      console.error("Failed to load risk intelligence:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, [email]);

  const handleResolveFlag = async (flagId, resolution) => {
    setActionLoadingId(flagId);
    try {
      const res = await api.post("/user-data/risk-intelligence/resolve", {
        flag_id: flagId,
        resolution: resolution,
      });
      if (res.data?.success) {
        // Update local state smoothly
        setRiskData((prev) => {
          if (!prev) return prev;
          const updatedFlags = prev.flags.map((f) =>
            f.id === flagId ? { ...f, status: resolution } : f
          );
          const unresolved = updatedFlags.filter((f) => f.status === "unresolved");
          return {
            ...prev,
            flags: updatedFlags,
            unresolved_count: unresolved.length,
          };
        });
      }
    } catch (err) {
      console.error("Failed to resolve flag:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Running AI Risk & AML Detection Engines...</p>
      </div>
    );
  }

  const flags = riskData?.flags || [];
  const vectors = riskData?.risk_vectors || {};
  const overallScore = riskData?.overall_risk_score || 95;
  const rating = riskData?.risk_rating || "Low Risk";
  const grade = riskData?.risk_grade || "A+";

  const filteredFlags = flags.filter((f) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unresolved") return f.status === "unresolved";
    if (activeFilter === "high") return f.severity === "High";
    if (activeFilter === "aml") return f.risk_vector?.includes("AML");
    if (activeFilter === "outlier") return f.risk_vector?.includes("Outlier");
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#07111f] p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ShieldCheck size={16} />
            <span>Autonomous Security & Compliance Engine</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
            Risk Intelligence & AML Safeguards
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Heuristic fraud screening, sub-threshold structuring detection, and abnormal expenditure surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRiskData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <RefreshCw size={14} />
            Re-run Audit
          </button>
        </div>
      </div>

      {/* Top Level Risk Gauges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Composite Risk Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Overall Risk Score</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                overallScore >= 85
                  ? "bg-emerald-100 text-emerald-700"
                  : overallScore >= 70
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              Grade {grade}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#07111f]">{overallScore}</span>
            <span className="text-xs font-bold text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">{rating}</p>
        </div>

        {/* Velocity Risk */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Velocity Vector</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {vectors.velocity_risk?.score || 100}/100
            </span>
          </div>
          <div className="mt-2 text-xl font-black text-[#07111f]">
            {vectors.velocity_risk?.status || "Normal"}
          </div>
          <p className="mt-1 text-xs text-slate-500">{vectors.velocity_risk?.description}</p>
        </div>

        {/* AML Structuring Vector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>AML Structuring</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                (vectors.aml_structuring_risk?.score || 100) >= 80
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {vectors.aml_structuring_risk?.score || 100}/100
            </span>
          </div>
          <div className="mt-2 text-xl font-black text-[#07111f]">
            {vectors.aml_structuring_risk?.status || "Clean"}
          </div>
          <p className="mt-1 text-xs text-slate-500">{vectors.aml_structuring_risk?.description}</p>
        </div>

        {/* Action Pending Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Pending Alerts</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              Action
            </span>
          </div>
          <div className="mt-2 text-3xl font-black text-[#07111f]">
            {riskData?.unresolved_count || 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">Unresolved anomaly notifications</p>
        </div>
      </div>

      {/* Flagged Transactions & Behavioral Alerts */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-base font-bold text-[#07111f] flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-500" />
              Behavioral Alerts & Audit Flags
            </h3>
            <p className="text-xs text-slate-500">
              Transactions flagged by algorithmic outlier heuristics or statutory AML thresholds.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: `All (${flags.length})` },
              { id: "unresolved", label: `Pending (${riskData?.unresolved_count || 0})` },
              { id: "high", label: "High Severity" },
              { id: "aml", label: "AML Signatures" },
              { id: "outlier", label: "Outliers" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeFilter === tab.id
                    ? "bg-[#07111f] text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="mt-6 space-y-4">
          {filteredFlags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 size={40} className="text-emerald-500" />
              <h4 className="mt-2 text-sm font-bold text-slate-800">No Risk Flags in this View</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                All reviewed transactions comply with security guidelines.
              </p>
            </div>
          ) : (
            filteredFlags.map((flag) => {
              const isPending = flag.status === "unresolved";
              const isActioning = actionLoadingId === flag.id;

              return (
                <div
                  key={flag.id}
                  className={`rounded-2xl border p-5 transition ${
                    flag.severity === "High"
                      ? "border-rose-200 bg-rose-50/30"
                      : flag.severity === "Medium"
                      ? "border-amber-200 bg-amber-50/20"
                      : "border-slate-200 bg-slate-50/40"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            flag.severity === "High"
                              ? "bg-rose-100 text-rose-700"
                              : flag.severity === "Medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {flag.severity} Severity
                        </span>

                        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {flag.risk_vector}
                        </span>

                        {flag.status === "verified" && (
                          <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <Check size={10} /> Verified Legitimate
                          </span>
                        )}

                        {flag.status === "disputed" && (
                          <span className="flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            <XCircle size={10} /> Disputed
                          </span>
                        )}

                        {flag.status === "dismissed" && (
                          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            Dismissed
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-black text-[#07111f]">
                        {flag.description}{" "}
                        <span className="font-semibold text-slate-500 text-xs">
                          ({flag.date || "Recent"})
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{flag.reason}</p>
                      <p className="text-[11px] font-medium text-slate-500">
                        <strong>Remediation:</strong> {flag.remediation}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-black text-[#07111f]">
                          {formatCurrency(flag.amount)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {flag.category}
                        </span>
                      </div>

                      {/* Resolution Action Buttons */}
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => handleResolveFlag(flag.id, "verified")}
                              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => handleResolveFlag(flag.id, "disputed")}
                              className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 shadow-sm transition hover:bg-rose-100 disabled:opacity-50"
                            >
                              Dispute
                            </button>
                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => handleResolveFlag(flag.id, "dismissed")}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => handleResolveFlag(flag.id, "unresolved")}
                            className="text-[11px] font-semibold text-slate-400 underline hover:text-slate-600"
                          >
                            Reset Status
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Regulatory Context Footer Banner */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <h5 className="font-bold text-slate-800">Regulatory Framework & AML Compliance Architecture</h5>
            <p>
              In accordance with Prevention of Money Laundering Act (PMLA) Section 12 and RBI Fair Practice guidelines,
              financial intelligence engines monitor transaction patterns for artificial splitting (smurfing) below statutory
              thresholds (₹50,000 PAN quotes and ₹2,00,000 cash reporting limits). Flags are heuristic advisories designed to safeguard personal liquidity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

