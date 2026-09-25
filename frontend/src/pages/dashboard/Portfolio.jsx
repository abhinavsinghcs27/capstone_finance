import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Search,
  ChevronDown,
  ShieldCheck,
  Zap,
  Target,
  AlertTriangle,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Plus,
  Trash2,
  X,
  Building2,
  PieChart,
  BarChart2,
} from "lucide-react";
import api from "../../services/api";
import AIChatModal from "../../components/common/AIChatModal";

const assetTypes = [
  "Equity",
  "Mutual Funds",
  "Fixed Deposit",
  "Gold",
  "Other",
];

const emptyForm = {
  name: "",
  type: "Equity",
  invested: "",
  currentValue: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function Portfolio() {
  // Holdings & Portfolio State
  const [holdings, setHoldings] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Market & Recommendation State
  const [indices, setIndices] = useState([]);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState("Moderate");
  const [activeTab, setActiveTab] = useState("recommendations"); // 'recommendations' | 'watchlist' | 'holdings'
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [searchWatchlist, setSearchWatchlist] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");

  // Load user profile & initial holdings
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const email = savedUser.email || "";

    api
      .get("/user-data", { params: email ? { email } : {} })
      .then((res) => {
        if (res.data?.user) {
          setUserProfile(res.data.user);
          const risk = res.data.user.risk_tolerance || "Moderate";
          setSelectedRisk(risk);

          // Populate initial holdings from profile if empty
          const u = res.data.user;
          const initial = [];
          if (Number(u.stocks) > 0) {
            initial.push({
              id: "stock-1",
              name: "Indian Equities Portfolio",
              type: "Equity",
              invested: Number(u.stocks) * 0.9,
              currentValue: Number(u.stocks),
            });
          }
          if (Number(u.mutual_funds) > 0) {
            initial.push({
              id: "mf-1",
              name: "Diversified Mutual Funds (SIPs)",
              type: "Mutual Funds",
              invested: Number(u.mutual_funds) * 0.88,
              currentValue: Number(u.mutual_funds),
            });
          }
          if (Number(u.fixed_deposit) > 0) {
            initial.push({
              id: "fd-1",
              name: "Bank Fixed Deposits",
              type: "Fixed Deposit",
              invested: Number(u.fixed_deposit),
              currentValue: Number(u.fixed_deposit) * 1.065,
            });
          }
          if (Number(u.gold) > 0) {
            initial.push({
              id: "gold-1",
              name: "Sovereign Gold Bonds / Gold",
              type: "Gold",
              invested: Number(u.gold) * 0.92,
              currentValue: Number(u.gold),
            });
          }
          setHoldings(initial);
        }
      })
      .catch((err) => console.log(err));

    fetchMarketData(selectedRisk);
  }, []);

  const fetchMarketData = async (risk = selectedRisk) => {
    setIsLoadingRecs(true);
    try {
      // 1. Fetch indices
      const indRes = await api.get("/user-data/market/indices");
      if (indRes.data?.success && indRes.data.indices) {
        setIndices(indRes.data.indices);
      }

      // 2. Fetch stock recommendations
      const recRes = await api.get("/user-data/stock-recommendations", {
        params: { risk_level: risk },
      });
      if (recRes.data?.success && recRes.data.data) {
        setRecommendationsData(recRes.data.data);
      }

      // 3. Fetch full watchlist
      const watchRes = await api.get("/user-data/market/stocks");
      if (watchRes.data?.success && watchRes.data.stocks) {
        setWatchlist(watchRes.data.stocks);
      }
    } catch (err) {
      console.error("Error loading market data:", err);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleRiskChange = (newRisk) => {
    setSelectedRisk(newRisk);
    fetchMarketData(newRisk);
  };

  const handleAskCopilot = (stock) => {
    setChatPrompt(
      `Give me a detailed technical & fundamental analysis for ${stock.company_name || stock.name} (${stock.symbol}). What are the key support levels, risks, and upside catalysts?`
    );
    setIsChatOpen(true);
  };

  // Portfolio summary
  const summary = useMemo(() => {
    const invested = holdings.reduce((sum, item) => sum + item.invested, 0);
    const currentValue = holdings.reduce((sum, item) => sum + item.currentValue, 0);
    const returns = currentValue - invested;
    const returnsPct = invested > 0 ? (returns / invested) * 100 : 0;

    return {
      invested,
      currentValue,
      returns,
      returnsPct,
      count: holdings.length,
    };
  }, [holdings]);

  // Allocation breakdown
  const allocation = useMemo(() => {
    return assetTypes
      .map((type) => {
        const val = holdings
          .filter((item) => item.type === type)
          .reduce((sum, item) => sum + item.currentValue, 0);
        return {
          type,
          value: val,
          pct: summary.currentValue > 0 ? (val / summary.currentValue) * 100 : 0,
        };
      })
      .filter((item) => item.value > 0);
  }, [holdings, summary.currentValue]);

  // Filtered watchlist
  const filteredWatchlist = useMemo(() => {
    return watchlist.filter((item) => {
      const q = searchWatchlist.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.symbol.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q)
      );
    });
  }, [watchlist, searchWatchlist]);

  // Holding Modal handlers
  function openAddModal() {
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyForm);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((curr) => ({ ...curr, [name]: value }));
  }

  function handleHoldingSubmit(e) {
    e.preventDefault();
    const invested = Number(form.invested);
    const currentValue = Number(form.currentValue);
    if (!form.name.trim() || invested <= 0 || currentValue <= 0) return;

    const newHolding = {
      id: `holding-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      invested,
      currentValue,
    };

    setHoldings((curr) => [newHolding, ...curr]);
    closeModal();
  }

  function deleteHolding(id) {
    setHoldings((curr) => curr.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-full bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* ====================================================== */}
        {/* LIVE BENCHMARK TICKER BAR */}
        {/* ====================================================== */}
        <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm scrollbar-none">
          <div className="flex items-center justify-between gap-6 min-w-[700px]">
            <div className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Indian Markets
            </div>

            <div className="flex items-center gap-6">
              {indices.map((idx, index) => {
                const isPositive = idx.change_pct >= 0;
                return (
                  <div key={index} className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-700">{idx.name}</span>
                    <span className="text-xs font-bold text-[#07111f]">
                      ₹{idx.price ? idx.price.toLocaleString("en-IN") : "—"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                        isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {isPositive ? "+" : ""}
                      {idx.change_pct}%
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => fetchMarketData()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Refresh Market Data"
            >
              <RefreshCw size={14} className={isLoadingRecs ? "animate-spin text-emerald-600" : ""} />
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* PAGE HEADER */}
        {/* ====================================================== */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Sparkles size={13} />
              Real-Time Stock Recommendations & Portfolio
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f]">
              Investment Intelligence
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Real-time NSE/BSE stock recommendations powered by Groq GPT-OSS-20B and technical momentum screening.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setChatPrompt("Give me a comprehensive stock portfolio recommendation strategy for the Indian market.");
                setIsChatOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#102039]"
            >
              <Bot size={17} />
              Ask AI Stock Advisor
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* PORTFOLIO METRICS OVERVIEW */}
        {/* ====================================================== */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Portfolio Value</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet size={17} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#07111f]">{formatCurrency(summary.currentValue)}</p>
            <p className="mt-1 text-xs text-slate-400">Invested: {formatCurrency(summary.invested)}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Gain / Loss</span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  summary.returns >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                {summary.returns >= 0 ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
              </div>
            </div>
            <p className={`text-2xl font-bold ${summary.returns >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {summary.returns >= 0 ? "+" : ""}
              {formatCurrency(summary.returns)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Return: {summary.returnsPct >= 0 ? "+" : ""}
              {summary.returnsPct.toFixed(2)}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Risk Profile</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={17} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#07111f]">{selectedRisk}</p>
            <p className="mt-1 text-xs text-slate-400">Matched with AI stock screener</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Market Posture</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Zap size={17} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#07111f]">
              {recommendationsData?.market_sentiment || "Bullish"}
            </p>
            <p className="mt-1 text-xs text-slate-400">NIFTY technical momentum</p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* TAB CONTROLS */}
        {/* ====================================================== */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {[
              { id: "recommendations", label: "AI Recommendations", icon: Sparkles },
              { id: "watchlist", label: "Live Technical Screener", icon: BarChart2 },
              { id: "holdings", label: "My Holdings & Allocation", icon: PieChart },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#07111f] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "recommendations" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Risk Filter:</span>
              {["Conservative", "Moderate", "Aggressive"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRiskChange(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    selectedRisk === r
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================== */}
        {/* TAB 1: AI REAL-TIME RECOMMENDATIONS */}
        {/* ====================================================== */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            {/* Market Commentary Banner */}
            {recommendationsData?.market_overview && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Sparkles size={15} className="text-emerald-600" />
                  <span>AI Market Commentary ({selectedRisk} Profile)</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{recommendationsData.market_overview}</p>
              </div>
            )}

            {/* Recommendation Cards Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {isLoadingRecs ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white p-6" />
                ))
              ) : (
                recommendationsData?.recommendations?.map((rec, index) => {
                  const isBuy = rec.action === "BUY" || rec.action === "ACCUMULATE";

                  return (
                    <div
                      key={index}
                      className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              {rec.sector}
                            </span>
                            <h3 className="mt-0.5 text-lg font-bold text-[#07111f]">{rec.company_name}</h3>
                            <span className="font-mono text-xs text-slate-400">{rec.symbol}.NS</span>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                              isBuy
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {rec.action}
                          </span>
                        </div>

                        {/* Price & Target Grid */}
                        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                          <div>
                            <span className="text-[10px] uppercase font-medium text-slate-400">CMP</span>
                            <p className="text-xs font-bold text-[#07111f]">₹{rec.cmp?.toLocaleString("en-IN")}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-medium text-emerald-600">Target</span>
                            <p className="text-xs font-bold text-emerald-700">
                              ₹{rec.target_price?.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-medium text-rose-500">Stop Loss</span>
                            <p className="text-xs font-bold text-rose-600">
                              ₹{rec.stop_loss?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        {/* Upside Badge & Horizon */}
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-600">
                            Upside: {rec.potential_upside_pct || "+12%"}
                          </span>
                          <span className="text-slate-400">{rec.time_horizon}</span>
                        </div>

                        {/* Technical Signal */}
                        {rec.technical_signal && (
                          <div className="mt-3 rounded-xl bg-slate-100/70 p-2 text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-800">Signal:</span> {rec.technical_signal}
                          </div>
                        )}

                        {/* AI Thesis */}
                        <p className="mt-3 text-xs leading-relaxed text-slate-500">{rec.thesis}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAskCopilot(rec)}
                        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Bot size={14} className="text-emerald-600" />
                        Analyze with AI Copilot
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 2: LIVE TECHNICAL SCREENER */}
        {/* ====================================================== */}
        {activeTab === "watchlist" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 sm:flex sm:items-center sm:justify-between">
              <div className="relative w-full max-w-sm">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchWatchlist}
                  onChange={(e) => setSearchWatchlist(e.target.value)}
                  placeholder="Filter by stock, sector or symbol..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none focus:border-emerald-400 focus:bg-white"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400 sm:mt-0">
                Showing {filteredWatchlist.length} screened NSE/BSE equities
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Stock Name</th>
                    <th className="px-6 py-4">Sector</th>
                    <th className="px-6 py-4 text-right">Price (CMP)</th>
                    <th className="px-6 py-4 text-right">24h Change</th>
                    <th className="px-6 py-4 text-center">RSI (14)</th>
                    <th className="px-6 py-4 text-center">Trend Structure</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredWatchlist.map((stock, idx) => {
                    const isPositive = stock.change >= 0;
                    return (
                      <tr key={idx} className="transition hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-[#07111f]">{stock.name}</p>
                            <p className="font-mono text-[11px] text-slate-400">{stock.symbol}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600">{stock.sector}</td>

                        <td className="px-6 py-4 text-right font-bold text-[#07111f]">
                          ₹{stock.price ? stock.price.toLocaleString("en-IN") : "—"}
                        </td>

                        <td className="px-6 py-4 text-right font-semibold">
                          <span
                            className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-bold ${
                              isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {stock.change_pct}%
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              stock.rsi <= 38
                                ? "bg-emerald-100 text-emerald-800"
                                : stock.rsi >= 65
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {stock.rsi} ({stock.rsi_status})
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
                              stock.trend === "Bullish"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : stock.trend === "Bearish"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {stock.trend}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleAskCopilot(stock)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Bot size={13} className="text-emerald-600" />
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 3: USER HOLDINGS & ALLOCATION */}
        {/* ====================================================== */}
        {activeTab === "holdings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-[#07111f]">Portfolio Holdings</h3>
                <p className="text-xs text-slate-500">Track and manage your asset allocation.</p>
              </div>
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#07111f] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={15} />
                Add Holding
              </button>
            </div>

            {/* Asset Allocation Pills */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {allocation.map((item) => (
                <div key={item.type} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400">{item.type}</span>
                  <p className="mt-1 text-lg font-bold text-[#07111f]">{formatCurrency(item.value)}</p>
                  <p className="mt-0.5 text-xs text-emerald-600 font-semibold">{item.pct.toFixed(1)}% of total</p>
                </div>
              ))}
            </div>

            {/* Holdings Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Asset Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Invested</th>
                      <th className="px-6 py-4 text-right">Current Value</th>
                      <th className="px-6 py-4 text-right">P&L</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {holdings.map((h) => {
                      const pnl = h.currentValue - h.invested;
                      const isProfit = pnl >= 0;
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-bold text-[#07111f]">{h.name}</td>
                          <td className="px-6 py-4 text-slate-500">{h.type}</td>
                          <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(h.invested)}</td>
                          <td className="px-6 py-4 text-right font-bold text-[#07111f]">
                            {formatCurrency(h.currentValue)}
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
                            {isProfit ? "+" : ""}
                            {formatCurrency(pnl)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteHolding(h.id)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================== */}
      {/* ADD HOLDING MODAL */}
      {/* ====================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#07111f]">Add Portfolio Holding</h2>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleHoldingSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. HDFC Bank, Parag Parikh Flexi Cap"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-emerald-400"
                >
                  {assetTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invested Amount (₹)</label>
                  <input
                    type="number"
                    name="invested"
                    value={form.invested}
                    onChange={handleFormChange}
                    min="1"
                    placeholder="25000"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Value (₹)</label>
                  <input
                    type="number"
                    name="currentValue"
                    value={form.currentValue}
                    onChange={handleFormChange}
                    min="1"
                    placeholder="28500"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-emerald-400"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#07111f] px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Add Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI CHAT MODAL */}
      <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} initialPrompt={chatPrompt} />
    </div>
  );
}

export default Portfolio;