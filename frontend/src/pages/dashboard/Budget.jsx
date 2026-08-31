import { useMemo, useState } from "react";
import {
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

const initialBudgets = [];

const categories = [
  "Housing",
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Dining",
  "Entertainment",
  "Other",
];

const emptyForm = {
  category: "Food",
  limit: "",
};


function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}


function Budget() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [month, setMonth] = useState("August 2026");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const totalBudget = useMemo(
    () => budgets.reduce((sum, item) => sum + item.limit, 0),
    [budgets]
  );

  const totalSpent = useMemo(
    () => budgets.reduce((sum, item) => sum + item.spent, 0),
    [budgets]
  );

  const remaining = totalBudget - totalSpent;

  function openAddModal() {
    setEditingBudget(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(budget) {
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      limit: String(budget.limit),
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingBudget(null);
    setForm(emptyForm);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const limit = Number(form.limit);

    if (!limit || limit <= 0) return;

    if (editingBudget) {
      setBudgets((current) =>
        current.map((item) =>
          item.id === editingBudget.id
            ? { ...item, category: form.category, limit }
            : item
        )
      );
    } else {
      setBudgets((current) => [
        ...current,
        {
          id: Date.now(),
          category: form.category,
          limit,
          spent: 0,
        },
      ]);
    }

    closeModal();
  }

  function deleteBudget(id) {
    setBudgets((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="min-h-full bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* Header */}

        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Spending plan
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f]">
              Budget
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Set spending limits and keep track of your monthly budget.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-600 outline-none focus:border-emerald-400"
              >
                <option>August 2026</option>
                <option>July 2026</option>
                <option>June 2026</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039]"
            >
              <Plus size={18} />
              Add budget
            </button>

          </div>
        </div>


        {/* Summary */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total budget
            </p>

            <p className="mt-3 text-2xl font-semibold text-[#07111f]">
              {formatCurrency(totalBudget)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Planned spending
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total spent
            </p>

            <p className="mt-3 text-2xl font-semibold text-[#07111f]">
              {formatCurrency(totalSpent)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Spending recorded
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Remaining
            </p>

            <p
              className={`mt-3 text-2xl font-semibold ${
                remaining >= 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {formatCurrency(remaining)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Available budget
            </p>
          </div>

        </div>


        {/* Category budgets */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5">
            <h2 className="text-base font-semibold text-[#07111f]">
              Category budgets
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage your spending limits for {month}.
            </p>
          </div>


          {budgets.length === 0 ? (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wallet size={26} />
              </div>

              <h3 className="text-base font-semibold text-[#07111f]">
                No budgets set yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Create category budgets to start tracking your monthly
                spending.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039]"
              >
                <Plus size={17} />
                Create your first budget
              </button>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {budgets.map((budget) => {
                const percentage = budget.limit
                  ? Math.min(
                      (budget.spent / budget.limit) * 100,
                      100
                    )
                  : 0;

                const overBudget =
                  budget.spent > budget.limit;

                return (
                  <div
                    key={budget.id}
                    className="p-5"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="font-medium text-[#07111f]">
                          {budget.category}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatCurrency(budget.spent)} spent of{" "}
                          {formatCurrency(budget.limit)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(budget)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteBudget(budget.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>


                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          overBudget
                            ? "bg-red-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>


      {/* Add / Edit modal */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold text-[#07111f]">
                  {editingBudget
                    ? "Edit budget"
                    : "Add budget"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set a monthly spending limit.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
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
                  Monthly limit
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={form.limit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        limit: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>


              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039]"
                >
                  {editingBudget
                    ? "Save changes"
                    : "Add budget"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Budget;