import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Trash2,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  Wallet,
  Calculator,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import api from "../../services/api";
import FormattedAIMessage from "../../components/common/FormattedAIMessage";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const STRATEGY_PROMPTS = [
  {
    category: "Wealth & FIRE",
    prompts: [
      "How can I reach a ₹2 Crore retirement corpus?",
      "Recommend a monthly SIP allocation for 12% annual CAGR.",
      "Calculate my FIRE age based on my current savings rate.",
    ],
  },
  {
    category: "Expense Optimization",
    prompts: [
      "Where can I cut discretionary spending this month?",
      "Analyze my 50/30/20 budget adherence and leakage.",
      "How much will I save if I trim dining and subscriptions by 20%?",
    ],
  },
  {
    category: "Debt & Major Purchases",
    prompts: [
      "Can I safely afford a new vehicle with a ₹16,000 monthly EMI?",
      "What is the fastest debt-snowball strategy for my existing loans?",
      "Is my emergency liquidity buffer sufficient for my family size?",
    ],
  },
];

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Greetings! I am your **Autonomous Financial Copilot**, powered by real-time financial intelligence. I have live access to your cash flows, emergency reserves, budget envelopes, and debt obligations.\n\nAsk me anything about affordability, compound investment growth, or expense reduction strategies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Scenario Simulator interactive state
  const [simCutSpend, setSimCutSpend] = useState(3000);
  const [simYears, setSimYears] = useState(10);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/user-data/profile?email=${encodeURIComponent(email)}`);
        if (res.data?.success) {
          setProfileData(res.data);
        }
      } catch (err) {
        console.error("Failed to load profile context for Copilot:", err);
      }
    };
    fetchProfile();
  }, [email]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post("/user-data/ai-chat", {
        email,
        message: text,
        conversation_history: conversationHistory,
      });

      if (res.data?.success && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.reply },
        ]);
      } else {
        throw new Error(res.data?.message || "Failed to receive AI response");
      }
    } catch (err) {
      console.error("AI Copilot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ I encountered an error connecting to the intelligence engine. Please ensure your backend is active or try rephrasing your query.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation cleared. How can I assist you with your financial planning today?",
      },
    ]);
  };

  // Compound growth calculator: Monthly SIP of simCutSpend over simYears at 12% CAGR
  const calculateCompoundWealth = (monthly, years, rate = 0.12) => {
    const r = rate / 12;
    const n = years * 12;
    if (r === 0) return monthly * n;
    return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  };

  const projectedCorpus = calculateCompoundWealth(simCutSpend, simYears);
  const totalPrincipalInvested = simCutSpend * simYears * 12;
  const compoundGain = Math.max(0, projectedCorpus - totalPrincipalInvested);

  const userData = profileData?.user || {};
  const evalData = profileData?.evaluation || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[#07111f] p-6 text-white md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <BrainCircuit size={16} />
            <span>Autonomous Financial Copilot</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
            AI Advisory & Wealth Copilot
          </h1>
          <p className="mt-1 text-xs text-slate-300">
            Context-aware conversational planning powered by your real-time financial ledger and macro models.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 self-start md:self-auto"
        >
          <Trash2 size={14} />
          Reset Chat
        </button>
      </div>

      {/* Main Copilot Workspace Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Chat Workspace (7 cols) */}
        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-7 h-[700px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#07111f] text-emerald-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#07111f]">Financial Strategy Assistant</h3>
                <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Context Attached (INR Models)
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#07111f] text-emerald-400 shadow-sm">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#00353f] text-white font-medium rounded-tr-none shadow-md shadow-[#00353f]/15"
                      : "border border-slate-200/90 bg-white text-slate-800 rounded-tl-none shadow-xs"
                  }`}
                >
                  <FormattedAIMessage content={msg.content} isUser={msg.role === "user"} />
                </div>

                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#07111f] text-emerald-400">
                  <Bot size={16} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                  <span>Synthesizing portfolio projections & budget rules...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-slate-100 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. 'Can I afford to invest ₹15,000 more in mutual funds each month?'..."
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-[#07111f] placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-[#07111f] shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Real-time Telemetry & Scenario Sandbox (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Real-time Telemetry Snapshot */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-[#07111f] flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                Live Context Ingested
              </h4>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Real-time
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Monthly Income</span>
                <div className="mt-1 font-black text-slate-800">
                  {formatCurrency(userData.monthly_income)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Fixed Outflows</span>
                <div className="mt-1 font-black text-slate-800">
                  {formatCurrency(userData.fixed_expenses)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Liquid Reserves</span>
                <div className="mt-1 font-black text-slate-800">
                  {formatCurrency(userData.current_savings || userData.emergency_fund)}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Audit Health Score</span>
                <div className="mt-1 font-black text-emerald-600">
                  {evalData.health_score?.score || 78}/100
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Scenario Sandbox */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-[#07111f] flex items-center gap-2">
                <Calculator size={16} className="text-blue-600" />
                Scenario Compound Simulator
              </h4>
              <span className="text-[10px] font-bold text-slate-400">@ 12% CAGR</span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Redirect Monthly Savings:</span>
                  <span className="font-bold text-[#07111f]">{formatCurrency(simCutSpend)}/mo</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="30000"
                  step="500"
                  value={simCutSpend}
                  onChange={(e) => setSimCutSpend(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Investment Horizon:</span>
                  <span className="font-bold text-[#07111f]">{simYears} Years</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="25"
                  step="1"
                  value={simYears}
                  onChange={(e) => setSimYears(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="rounded-2xl bg-[#07111f] p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Projected Wealth Created
                </span>
                <div className="mt-1 text-2xl font-black text-white">
                  {formatCurrency(projectedCorpus)}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-300">
                  <span>Invested: {formatCurrency(totalPrincipalInvested)}</span>
                  <span className="font-bold text-emerald-400">
                    Gain: +{formatCurrency(compoundGain)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Strategy Starters */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#07111f] flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-amber-500" />
              Strategic Prompt Starters
            </h4>

            <div className="space-y-3">
              {STRATEGY_PROMPTS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {group.category}
                  </span>
                  <div className="space-y-1">
                    {group.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleSendMessage(p)}
                        className="w-full text-left rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px] font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900 transition flex items-center justify-between group"
                      >
                        <span className="truncate">{p}</span>
                        <ChevronRight
                          size={12}
                          className="shrink-0 text-slate-400 group-hover:text-emerald-600 transition"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

