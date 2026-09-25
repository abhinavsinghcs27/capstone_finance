import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  FileUp,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";

const categories = [
  "Income",
  "Salary",
  "Other Inflow",
  "Housing",
  "Food",
  "Utilities",
  "Dining",
  "Investment",
  "Transport",
  "Shopping",
  "Fixed Expense",
  "Variable Spend",
  "Other",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return "";

  // Handle format variations like YYYY-MM-DD, DD/MM/YYYY, etc.
  try {
    const cleanStr = String(dateString).trim();
    if (cleanStr.includes("/")) {
      const parts = cleanStr.split("/");
      if (parts.length === 3) {
        // DD/MM/YYYY
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }
    }
    const date = new Date(cleanStr.includes("T") ? cleanStr : `${cleanStr}T00:00:00`);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return cleanStr;
  } catch {
    return String(dateString);
  }
}

function TypeIcon({ type }) {
  const normalized = String(type).toLowerCase();
  if (normalized === "income" || normalized === "credit") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <ArrowDownLeft size={19} />
      </div>
    );
  }

  if (normalized === "investment") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Wallet size={19} />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
      <ArrowUpRight size={19} />
    </div>
  );
}

function getDefaultForm() {
  return {
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    note: "",
  };
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(getDefaultForm());
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statement Import Modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImportSaving, setIsImportSaving] = useState(false);
  const [importError, setImportError] = useState("");
  const [importedTransactions, setImportedTransactions] = useState([]);

  const showToast = (message, type = "success") => {
    setToastMsg({ message, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const getSavedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const savedUser = getSavedUser();
      const email = savedUser.email || "";
      const res = await api.get("/user-data/transactions", {
        params: email ? { email } : {},
      });
      if (res.data && Array.isArray(res.data.transactions)) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ------------------------------------------------------------
  // Summary Metrics
  // ------------------------------------------------------------
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let investments = 0;

    for (const item of transactions) {
      const amt = Number(item.amount) || 0;
      const t = String(item.type).toLowerCase();
      if (t === "income" || t === "credit") {
        income += amt;
      } else if (t === "investment") {
        investments += amt;
      } else {
        expenses += amt;
      }
    }

    return {
      income,
      expenses,
      investments,
      net: income - expenses - investments,
      count: transactions.length,
    };
  }, [transactions]);

  // ------------------------------------------------------------
  // Search & Filter
  // ------------------------------------------------------------
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchValue = search.toLowerCase().trim();
      const desc = String(transaction.description || "").toLowerCase();
      const cat = String(transaction.category || "").toLowerCase();
      const note = String(transaction.note || "").toLowerCase();
      const src = String(transaction.source || "").toLowerCase();

      const matchesSearch =
        !searchValue ||
        desc.includes(searchValue) ||
        cat.includes(searchValue) ||
        note.includes(searchValue) ||
        src.includes(searchValue);

      const txnType = String(transaction.type || "").toLowerCase();
      const normalizedType =
        txnType === "credit" ? "income" : txnType === "debit" ? "expense" : txnType;

      const matchesType =
        typeFilter === "all" || normalizedType === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        String(transaction.category).toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  // ------------------------------------------------------------
  // Manual Add Modal Handlers
  // ------------------------------------------------------------
  function openAddModal() {
    setForm(getDefaultForm());
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(getDefaultForm());
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTypeChange(event) {
    const type = event.target.value;
    let category = form.category;

    if (type === "income") {
      category = "Income";
    } else if (type === "investment") {
      category = "Investment";
    } else if (type === "expense" && (category === "Income" || category === "Investment")) {
      category = "Food";
    }

    setForm((current) => ({
      ...current,
      type,
      category,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const description = form.description.trim();
    const amount = Number(form.amount);

    if (!description || !amount || amount <= 0 || !form.date) {
      return;
    }

    setIsSubmitting(true);
    try {
      const savedUser = getSavedUser();
      const email = savedUser.email || "user@example.com";
      const payload = {
        email,
        description,
        amount,
        type: form.type,
        category: form.category,
        date: form.date,
        note: form.note.trim(),
      };

      const res = await api.post("/user-data/transactions/new", payload);
      if (res.data?.success && res.data.transaction) {
        setTransactions((current) => [res.data.transaction, ...current]);
        showToast("Transaction added successfully!");
        closeModal();
      } else {
        throw new Error(res.data?.message || "Failed to add transaction");
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert(err.response?.data?.message || err.message || "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ------------------------------------------------------------
  // Delete Handler
  // ------------------------------------------------------------
  async function handleDelete() {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const savedUser = getSavedUser();
      const email = savedUser.email || "";
      const res = await api.delete(`/user-data/transactions/${deleteId}`, {
        params: email ? { email } : {},
      });

      if (res.data?.success) {
        setTransactions((current) => current.filter((item) => item.id !== deleteId));
        showToast("Transaction deleted successfully");
      } else {
        throw new Error(res.data?.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  // ------------------------------------------------------------
  // Import Modal Handlers
  // ------------------------------------------------------------
  function openImportModal() {
    setSelectedFile(null);
    setImportedTransactions([]);
    setIsParsing(false);
    setImportError("");
    setIsImportOpen(true);
  }

  function closeImportModal() {
    setIsImportOpen(false);
    setSelectedFile(null);
    setImportedTransactions([]);
    setIsParsing(false);
    setImportError("");
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = [".pdf", ".csv", ".xlsx", ".xls"];
    const extension = `.${file.name.split(".").pop().toLowerCase()}`;

    if (!allowedExtensions.includes(extension)) {
      setImportError("Please upload a valid PDF, CSV, or Excel file.");
      return;
    }

    setSelectedFile(file);
    setImportError("");
    setImportedTransactions([]);
  }

  async function processStatement() {
    if (!selectedFile) return;

    setIsParsing(true);
    setImportError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await api.post("/user-data/upload-statement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        const txns =
          res.data.transactions ||
          res.data.sample_transactions ||
          res.data.simple_transactions ||
          [];
        setImportedTransactions(txns);
      } else {
        throw new Error(res.data?.message || "Failed to parse statement");
      }
    } catch (err) {
      console.error("Statement parse error:", err);
      setImportError(
        err.response?.data?.message ||
        err.message ||
        "Could not parse statement. Please ensure it has standard columns."
      );
    } finally {
      setIsParsing(false);
    }
  }

  async function addImportedTransactions() {
    if (!importedTransactions.length) return;

    setIsImportSaving(true);
    try {
      const savedUser = getSavedUser();
      const email = savedUser.email || "user@example.com";

      const res = await api.post("/user-data/transactions", {
        email,
        transactions: importedTransactions,
      });

      if (res.data?.success) {
        showToast(`Imported ${res.data.count || importedTransactions.length} transactions successfully!`);
        closeImportModal();
        fetchTransactions();
      } else {
        throw new Error(res.data?.message || "Failed to save transactions");
      }
    } catch (err) {
      console.error("Bulk save error:", err);
      alert(err.response?.data?.message || err.message || "Failed to save imported transactions");
    } finally {
      setIsImportSaving(false);
    }
  }

  const deleteTransaction = transactions.find((item) => item.id === deleteId);

  return (
    <div className="min-h-full bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 shadow-lg shadow-emerald-900/10">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold text-emerald-900">{toastMsg.message}</span>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* Page Header */}
        {/* -------------------------------------------------- */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Sparkles size={13} />
              Financial Activity & Ledger
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f]">
              Transactions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Live interactive ledger of your income, expenses, and investments synced from statements and manual entries.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={openImportModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <FileUp size={18} />
              Import statement
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#102039]"
            >
              <Plus size={18} />
              Add transaction
            </button>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Summary Metric Cards */}
        {/* -------------------------------------------------- */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Income</span>
              <TypeIcon type="income" />
            </div>
            <p className="text-2xl font-bold text-[#07111f]">
              {formatCurrency(summary.income)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Total credits recorded</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Expenses</span>
              <TypeIcon type="expense" />
            </div>
            <p className="text-2xl font-bold text-[#07111f]">
              {formatCurrency(summary.expenses)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Total debits & spending</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Investments</span>
              <TypeIcon type="investment" />
            </div>
            <p className="text-2xl font-bold text-[#07111f]">
              {formatCurrency(summary.investments)}
            </p>
            <p className="mt-1 text-xs text-slate-400">SIPs, Stocks & Mutual Funds</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Net Cash Flow</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Wallet size={18} />
              </div>
            </div>
            <p
              className={`text-2xl font-bold ${
                summary.net >= 0 ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {formatCurrency(summary.net)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Income minus expenses & investments</p>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Ledger Table Container */}
        {/* -------------------------------------------------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search narration, category, notes..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 sm:w-44"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income (Credits)</option>
                    <option value="expense">Expense (Debits)</option>
                    <option value="investment">Investment</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400 sm:w-44"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-sm font-medium text-slate-500">Loading ledger transactions...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredTransactions.length === 0 && (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wallet size={26} />
              </div>
              <h3 className="text-base font-semibold text-[#07111f]">No transactions found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {transactions.length === 0
                  ? "Your ledger is empty. Upload a bank statement or add transactions manually to get started."
                  : "No transactions match your current search and filter criteria."}
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openImportModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <FileUp size={17} />
                  Import statement
                </button>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#102039]"
                >
                  <Plus size={17} />
                  Add transaction
                </button>
              </div>
            </div>
          )}

          {/* Desktop Table */}
          {!isLoading && filteredTransactions.length > 0 && (
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Transaction Narration
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Source
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((transaction) => {
                    const tType = String(transaction.type).toLowerCase();
                    const isIncome = tType === "income" || tType === "credit";
                    const isInvestment = tType === "investment";

                    return (
                      <tr
                        key={transaction.id || transaction._id}
                        className="transition hover:bg-slate-50/60"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <TypeIcon type={transaction.type} />
                            <div className="min-w-0 max-w-md">
                              <p className="truncate text-sm font-semibold text-[#07111f]">
                                {transaction.description}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {transaction.note ||
                                  (isIncome
                                    ? "Money received"
                                    : isInvestment
                                    ? "Investment allocation"
                                    : "Money spent")}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(transaction.date)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {transaction.category || "Other"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-semibold ${
                              transaction.source === "manual"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {transaction.source === "manual" ? "Manual Entry" : "Statement Upload"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span
                            className={`text-sm font-bold ${
                              isIncome ? "text-emerald-600" : "text-[#07111f]"
                            }`}
                          >
                            {isIncome ? "+" : "-"}{" "}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDeleteId(transaction.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Delete transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile List View */}
          {!isLoading && filteredTransactions.length > 0 && (
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredTransactions.map((transaction) => {
                const tType = String(transaction.type).toLowerCase();
                const isIncome = tType === "income" || tType === "credit";

                return (
                  <div key={transaction.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <TypeIcon type={transaction.type} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#07111f]">
                            {transaction.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {transaction.category} · {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 text-sm font-bold ${
                          isIncome ? "text-emerald-600" : "text-[#07111f]"
                        }`}
                      >
                        {isIncome ? "+" : "-"}{" "}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        {transaction.source === "manual" ? "Manual" : "Statement"}
                      </span>

                      <button
                        type="button"
                        onClick={() => setDeleteId(transaction.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-1.5 text-xs font-medium text-rose-600"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table Footer */}
          {!isLoading && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing {filteredTransactions.length} of {summary.count} total ledger transactions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* ADD MANUAL TRANSACTION MODAL */}
      {/* ====================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-[#07111f]">Add transaction</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add an ad-hoc transaction to your live ledger.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description / Narration
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="e.g. Grocery shopping - Blinkit"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      min="1"
                      step="any"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-[#07111f] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Transaction Type
                </label>
                <div className="relative">
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleTypeChange}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-[#07111f] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="expense">Expense (Debit)</option>
                    <option value="income">Income (Credit)</option>
                    <option value="investment">Investment (SIP/Stocks)</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-[#07111f] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
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
                  Note <span className="text-xs text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleFormChange}
                  rows="2"
                  placeholder="Optional context or memo..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#102039] disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save to ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* STATEMENT IMPORT MODAL */}
      {/* ====================================================== */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-[#07111f]">Import statement</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Upload a PDF, Excel, or CSV statement to extract transactions directly into your ledger.
                </p>
              </div>

              <button
                type="button"
                onClick={closeImportModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              {importError && (
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                  <AlertCircle size={18} className="shrink-0 text-rose-600" />
                  <p>{importError}</p>
                </div>
              )}

              {!selectedFile && (
                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                    <FileUp size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#07111f]">
                    Upload your financial statement
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">Click to browse your files</p>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                      PDF
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                      CSV
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                      XLSX
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              {selectedFile && !isParsing && importedTransactions.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <FileUp size={21} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#07111f]">
                        {selectedFile.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-white"
                    >
                      Change file
                    </button>
                    <button
                      type="button"
                      onClick={processStatement}
                      className="rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039]"
                    >
                      Process statement
                    </button>
                  </div>
                </div>
              )}

              {isParsing && (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-emerald-600" />
                  <h3 className="text-base font-semibold text-[#07111f]">
                    Processing your statement
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Extracting and categorizing transactions...
                  </p>
                </div>
              )}

              {importedTransactions.length > 0 && !isParsing && (
                <div>
                  <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span className="font-semibold">
                        Extracted {importedTransactions.length} transactions
                      </span>
                    </div>
                    <span>Ready to add</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200">
                    <div className="divide-y divide-slate-100">
                      {importedTransactions.slice(0, 15).map((txn, idx) => {
                        const isIncome = String(txn.type).toLowerCase() === "credit" || String(txn.type).toLowerCase() === "income";
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 text-xs">
                            <div className="min-w-0 max-w-xs">
                              <p className="truncate font-semibold text-[#07111f]">
                                {txn.description}
                              </p>
                              <p className="text-slate-400">
                                {txn.date} · {txn.category}
                              </p>
                            </div>
                            <span
                              className={`font-bold ${
                                isIncome ? "text-emerald-600" : "text-[#07111f]"
                              }`}
                            >
                              {isIncome ? "+" : "-"} {formatCurrency(txn.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {importedTransactions.length > 15 && (
                    <p className="mt-2 text-center text-xs text-slate-400">
                      ...and {importedTransactions.length - 15} more transactions
                    </p>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeImportModal}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isImportSaving}
                      onClick={addImportedTransactions}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039] disabled:opacity-50"
                    >
                      {isImportSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Add {importedTransactions.length} transactions to ledger
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ====================================================== */}
      {deleteTransaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Trash2 size={22} />
            </div>

            <h2 className="text-lg font-semibold text-[#07111f]">Delete transaction?</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-800">
                "{deleteTransaction.description}"
              </span>{" "}
              ({formatCurrency(deleteTransaction.amount)}) from your ledger?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;