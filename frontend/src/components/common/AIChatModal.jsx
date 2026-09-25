import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  Loader2,
  Trash2,
  Minimize2,
  Maximize2,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  Wallet,
} from "lucide-react";
import api from "../../services/api";

const QUICK_PROMPTS = [
  { text: "How is my overall financial health?", icon: TrendingUp },
  { text: "Where can I cut expenses this month?", icon: PiggyBank },
  { text: "Is my emergency fund sufficient?", icon: ShieldCheck },
  { text: "Analyze my recent transactions ledger", icon: Wallet },
];

export default function AIChatModal({ isOpen, onClose, initialPrompt = "" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your **FinanceAI Advisor**, powered by Groq. I have real-time access to your profile and transaction ledger. How can I help optimize your finances today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const email = savedUser.email || "";

      // Convert history for backend (excluding the last one we just added)
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
        throw new Error(res.data?.message || "Failed to get AI response");
      }
    } catch (err) {
      console.error("AI Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ *Sorry, I encountered an error connecting to the AI model. Please ensure your Groq configuration is active and try again.*",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation cleared. How else can I assist with your financial planning?",
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <div
        className={`w-full transition-all duration-300 ease-in-out ${
          isMinimized
            ? "h-14 w-80 overflow-hidden"
            : "h-[620px] max-h-[85vh] w-[92vw] sm:w-[440px]"
        } flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#07111f] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-400">
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">FinanceAI Advisor</h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  GPT-OSS-20B
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Live Financial Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                      msg.role === "user"
                        ? "bg-[#07111f] text-white rounded-br-none"
                        : "border border-slate-200 bg-white text-slate-800 shadow-sm rounded-bl-none prose prose-sm prose-slate"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700 mt-0.5">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Bot size={15} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm text-xs text-slate-500">
                    <Loader2 size={14} className="animate-spin text-emerald-600" />
                    <span>Analyzing finances & generating advice...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts (if fewer than 4 user messages) */}
            {messages.length < 5 && (
              <div className="border-t border-slate-100 bg-white px-3 py-2">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Suggested Questions
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_PROMPTS.map((qp, idx) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(qp.text)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Icon size={12} className="text-emerald-600" />
                        {qp.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="border-t border-slate-100 bg-white p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about budget, SIPs, taxes, debt..."
                  className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#07111f] text-white transition hover:bg-slate-800 disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
