import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  FileUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";


// ------------------------------------------------------------
// Initial data
// ------------------------------------------------------------
// Kept empty for now.
// Real transactions will come from the backend later.

const initialTransactions = [];

const categories = [
  "Income",
  "Housing",
  "Food",
  "Utilities",
  "Dining",
  "Investment",
  "Transport",
  "Shopping",
  "Other",
];


function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}


function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function TypeIcon({ type }) {
  if (type === "income") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <ArrowDownLeft size={19} />
      </div>
    );
  }

  if (type === "investment") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Wallet size={19} />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
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
  const [transactions, setTransactions] = useState(initialTransactions);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [form, setForm] = useState(getDefaultForm());

  const [deleteId, setDeleteId] = useState(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const [importedTransactions, setImportedTransactions] = useState([]);


  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------

  const summary = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((total, item) => total + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((total, item) => total + item.amount, 0);

    const investments = transactions
      .filter((item) => item.type === "investment")
      .reduce((total, item) => total + item.amount, 0);

    return {
      income,
      expenses,
      investments,
      net: income - expenses - investments,
      count: transactions.length,
    };
  }, [transactions]);


  // ------------------------------------------------------------
  // Search and filters
  // ------------------------------------------------------------

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        transaction.description.toLowerCase().includes(searchValue) ||
        transaction.category.toLowerCase().includes(searchValue) ||
        transaction.note.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);


  // ------------------------------------------------------------
  // Add / Edit transaction
  // ------------------------------------------------------------

  function openAddModal() {
    setEditingTransaction(null);
    setForm(getDefaultForm());
    setIsModalOpen(true);
  }


  function openEditModal(transaction) {
    setEditingTransaction(transaction);

    setForm({
      description: transaction.description,
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note || "",
    });

    setIsModalOpen(true);
  }


  function closeModal() {
    setIsModalOpen(false);
    setEditingTransaction(null);
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
    }

    if (type === "investment") {
      category = "Investment";
    }

    if (
      type === "expense" &&
      (category === "Income" || category === "Investment")
    ) {
      category = "Food";
    }

    setForm((current) => ({
      ...current,
      type,
      category,
    }));
  }


  function handleSubmit(event) {
    event.preventDefault();

    const description = form.description.trim();
    const amount = Number(form.amount);

    if (!description || !amount || amount <= 0 || !form.date) {
      return;
    }

    const transaction = {
      id: editingTransaction
        ? editingTransaction.id
        : Date.now(),
      description,
      amount,
      type: form.type,
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    };

    if (editingTransaction) {
      setTransactions((current) =>
        current.map((item) =>
          item.id === editingTransaction.id
            ? transaction
            : item
        )
      );
    } else {
      setTransactions((current) => [
        transaction,
        ...current,
      ]);
    }

    closeModal();
  }


  // ------------------------------------------------------------
  // Delete transaction
  // ------------------------------------------------------------

  function handleDelete() {
    setTransactions((current) =>
      current.filter((item) => item.id !== deleteId)
    );

    setDeleteId(null);
  }


  // ------------------------------------------------------------
  // Statement import
  // ------------------------------------------------------------

  function openImportModal() {
    setSelectedFile(null);
    setImportedTransactions([]);
    setIsParsing(false);
    setIsImportOpen(true);
  }


  function closeImportModal() {
    setIsImportOpen(false);
    setSelectedFile(null);
    setImportedTransactions([]);
    setIsParsing(false);
  }


  function handleFileSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".csv",
      ".xlsx",
    ];

    const extension = `.${file.name
      .split(".")
      .pop()
      .toLowerCase()}`;

    if (!allowedExtensions.includes(extension)) {
      alert("Please upload a PDF, CSV or XLSX file.");
      return;
    }

    setSelectedFile(file);
    setImportedTransactions([]);
  }


  function processStatement() {
    if (!selectedFile) {
      return;
    }

    setIsParsing(true);

    /*
     * This is intentionally empty for now.
     *
     * The backend team will later provide:
     *
     * POST /api/statements/upload
     *
     * The response will contain the extracted
     * transactions and profile information.
     */

    setTimeout(() => {
      setImportedTransactions([]);
      setIsParsing(false);
    }, 1000);
  }


  function addImportedTransactions() {
    if (!importedTransactions.length) {
      return;
    }

    setTransactions((current) => [
      ...importedTransactions,
      ...current,
    ]);

    closeImportModal();
  }


  const deleteTransaction = transactions.find(
    (item) => item.id === deleteId
  );


  return (
    <div className="min-h-full bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto w-full max-w-[1500px]">

        {/* -------------------------------------------------- */}
        {/* Page Header */}
        {/* -------------------------------------------------- */}

        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Financial activity
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f]">
              Transactions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review your income, expenses and investments in one place.
            </p>

          </div>


          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              type="button"
              onClick={openImportModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <FileUp size={18} />
              Import statement
            </button>


            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#102039]"
            >
              <Plus size={18} />
              Add transaction
            </button>

          </div>

        </div>


        {/* -------------------------------------------------- */}
        {/* Summary Cards */}
        {/* -------------------------------------------------- */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <span className="text-sm font-medium text-slate-500">
                Total income
              </span>

              <TypeIcon type="income" />

            </div>

            <p className="text-2xl font-semibold text-[#07111f]">
              {formatCurrency(summary.income)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Money received this month
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <span className="text-sm font-medium text-slate-500">
                Total expenses
              </span>

              <TypeIcon type="expense" />

            </div>

            <p className="text-2xl font-semibold text-[#07111f]">
              {formatCurrency(summary.expenses)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Spending recorded this month
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <span className="text-sm font-medium text-slate-500">
                Investments
              </span>

              <TypeIcon type="investment" />

            </div>

            <p className="text-2xl font-semibold text-[#07111f]">
              {formatCurrency(summary.investments)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Investment transactions
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <span className="text-sm font-medium text-slate-500">
                Net cash flow
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Wallet size={18} />
              </div>

            </div>

            <p
              className={`text-2xl font-semibold ${
                summary.net >= 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {formatCurrency(summary.net)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Income minus expenses and investments
            </p>

          </div>

        </div>


        {/* -------------------------------------------------- */}
        {/* Transactions */}
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
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search transactions..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />

              </div>


              <div className="flex flex-col gap-2 sm:flex-row">

                <div className="relative">

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(event.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-600 outline-none focus:border-emerald-400 sm:w-40"
                  >
                    <option value="all">
                      All types
                    </option>

                    <option value="income">
                      Income
                    </option>

                    <option value="expense">
                      Expense
                    </option>

                    <option value="investment">
                      Investment
                    </option>

                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>


                <div className="relative">

                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-600 outline-none focus:border-emerald-400 sm:w-40"
                  >

                    <option value="all">
                      All categories
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
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


          {/* Empty State */}

          {filteredTransactions.length === 0 && (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wallet size={26} />
              </div>

              <h3 className="text-base font-semibold text-[#07111f]">
                No transactions yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Your transactions will appear here once you add one manually
                or import a financial statement.
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

          {filteredTransactions.length > 0 && (

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Transaction
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredTransactions.map((transaction) => (

                    <tr
                      key={transaction.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <TypeIcon
                            type={transaction.type}
                          />

                          <div>

                            <p className="text-sm font-medium text-[#07111f]">
                              {transaction.description}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {transaction.note ||
                                (transaction.type === "income"
                                  ? "Money received"
                                  : transaction.type === "investment"
                                    ? "Investment"
                                    : "Money spent")}
                            </p>

                          </div>

                        </div>

                      </td>


                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(transaction.date)}
                      </td>


                      <td className="px-6 py-4">

                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {transaction.category}
                        </span>

                      </td>


                      <td className="px-6 py-4 text-right">

                        <span
                          className={`text-sm font-semibold ${
                            transaction.type === "income"
                              ? "text-emerald-600"
                              : "text-[#07111f]"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            transaction.amount
                          )}
                        </span>

                      </td>


                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(transaction)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                            aria-label="Edit transaction"
                          >
                            <Pencil size={16} />
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(transaction.id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                            aria-label="Delete transaction"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}


          {/* Mobile List */}

          {filteredTransactions.length > 0 && (

            <div className="md:hidden">

              {filteredTransactions.map((transaction) => (

                <div
                  key={transaction.id}
                  className="border-b border-slate-100 p-4 last:border-0"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <TypeIcon
                        type={transaction.type}
                      />

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-[#07111f]">
                          {transaction.description}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {transaction.category} ·{" "}
                          {formatDate(transaction.date)}
                        </p>

                      </div>

                    </div>


                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-[#07111f]"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}
                      {formatCurrency(
                        transaction.amount
                      )}
                    </span>

                  </div>


                  <div className="mt-3 flex justify-end gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(transaction)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setDeleteId(transaction.id)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-500"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}


          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">

            <p className="text-xs text-slate-400">
              Showing {filteredTransactions.length} of{" "}
              {summary.count} transactions
            </p>

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* ADD / EDIT TRANSACTION MODAL */}
      {/* ====================================================== */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold text-[#07111f]">
                  {editingTransaction
                    ? "Edit transaction"
                    : "Add transaction"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editingTransaction
                    ? "Update the transaction details."
                    : "Add a transaction to your financial activity."}
                </p>

              </div>


              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="e.g. Grocery shopping"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />

              </div>


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleFormChange}
                      placeholder="0"
                      min="1"
                      step="1"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      required
                    />

                  </div>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Date
                  </label>

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
                  Transaction type
                </label>

                <div className="relative">

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleTypeChange}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-[#07111f] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >

                    <option value="expense">
                      Expense
                    </option>

                    <option value="income">
                      Income
                    </option>

                    <option value="investment">
                      Investment
                    </option>

                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <div className="relative">

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-[#07111f] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
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
                  Note
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Add any additional details..."
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
                  className="rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#102039]"
                >
                  {editingTransaction
                    ? "Save changes"
                    : "Add transaction"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ====================================================== */}
      {/* IMPORT STATEMENT MODAL */}
      {/* ====================================================== */}

      {isImportOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold text-[#07111f]">
                  Import statement
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Upload a financial statement to extract transactions.
                </p>

              </div>


              <button
                type="button"
                onClick={closeImportModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>

            </div>


            <div className="p-6">

              {!selectedFile && (

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                    <FileUp size={24} />
                  </div>

                  <h3 className="text-sm font-semibold text-[#07111f]">
                    Upload your financial statement
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Click to browse your files
                  </p>

                  <div className="mt-4 flex gap-2">

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      PDF
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      CSV
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      XLSX
                    </span>

                  </div>


                  <input
                    type="file"
                    accept=".pdf,.csv,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                </label>

              )}


              {selectedFile &&
                !isParsing &&
                importedTransactions.length === 0 && (

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
                        onClick={() =>
                          setSelectedFile(null)
                        }
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

                  <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />

                  <h3 className="text-base font-semibold text-[#07111f]">
                    Processing your statement
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Reading and organizing your financial data...
                  </p>


                  <div className="mx-auto mt-6 max-w-sm space-y-3 text-left">

                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Reading statement data
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Identifying transactions
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Categorizing financial activity
                    </div>

                  </div>

                </div>

              )}


              {importedTransactions.length > 0 &&
                !isParsing && (

                  <div>

                    <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3">

                      <p className="text-sm font-medium text-emerald-700">
                        Statement processed successfully
                      </p>

                      <p className="mt-1 text-xs text-emerald-600">
                        Review the extracted transactions before adding them.
                      </p>

                    </div>


                    <div className="overflow-hidden rounded-xl border border-slate-200">

                      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Extracted transactions
                        </p>

                      </div>


                      <div className="divide-y divide-slate-100">

                        {importedTransactions.map(
                          (transaction) => (

                            <div
                              key={transaction.id}
                              className="flex items-center justify-between gap-4 px-4 py-4"
                            >

                              <div className="flex min-w-0 items-center gap-3">

                                <TypeIcon
                                  type={transaction.type}
                                />

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-medium text-[#07111f]">
                                    {transaction.description}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {transaction.category} ·{" "}
                                    {formatDate(
                                      transaction.date
                                    )}
                                  </p>

                                </div>

                              </div>


                              <p
                                className={`shrink-0 text-sm font-semibold ${
                                  transaction.type === "income"
                                    ? "text-emerald-600"
                                    : "text-[#07111f]"
                                }`}
                              >
                                {transaction.type === "income"
                                  ? "+"
                                  : "-"}
                                {formatCurrency(
                                  transaction.amount
                                )}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>


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
                        onClick={addImportedTransactions}
                        className="rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039]"
                      >
                        Add extracted transactions
                      </button>

                    </div>

                  </div>

                )}

            </div>

          </div>

        </div>

      )}


      {/* ====================================================== */}
      {/* DELETE CONFIRMATION */}
      {/* ====================================================== */}

      {deleteTransaction && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Trash2 size={20} />
            </div>


            <h2 className="text-lg font-semibold text-[#07111f]">
              Delete transaction?
            </h2>


            <p className="mt-2 text-sm leading-6 text-slate-500">

              This will remove{" "}

              <span className="font-medium text-slate-700">
                {deleteTransaction.description}
              </span>

              {" "}from your transaction list.

            </p>


            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-600"
              >
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