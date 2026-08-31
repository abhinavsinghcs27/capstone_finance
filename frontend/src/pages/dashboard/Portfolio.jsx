import { useMemo, useState } from "react";
import {
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

const initialHoldings = [];

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
  }).format(value);
}


function Portfolio() {
  const [holdings, setHoldings] = useState(initialHoldings);
  const [month, setMonth] = useState("August 2026");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [form, setForm] = useState(emptyForm);


  const summary = useMemo(() => {
    const invested = holdings.reduce(
      (sum, item) => sum + item.invested,
      0
    );

    const currentValue = holdings.reduce(
      (sum, item) => sum + item.currentValue,
      0
    );

    return {
      invested,
      currentValue,
      returns: currentValue - invested,
      count: holdings.length,
    };
  }, [holdings]);


  const allocation = useMemo(() => {
    return assetTypes
      .map((type) => ({
        type,
        value: holdings
          .filter((item) => item.type === type)
          .reduce((sum, item) => sum + item.currentValue, 0),
      }))
      .filter((item) => item.value > 0);
  }, [holdings]);


  function openAddModal() {
    setEditingHolding(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }


  function openEditModal(holding) {
    setEditingHolding(holding);

    setForm({
      name: holding.name,
      type: holding.type,
      invested: String(holding.invested),
      currentValue: String(holding.currentValue),
    });

    setIsModalOpen(true);
  }


  function closeModal() {
    setIsModalOpen(false);
    setEditingHolding(null);
    setForm(emptyForm);
  }


  function handleSubmit(event) {
    event.preventDefault();

    const invested = Number(form.invested);
    const currentValue = Number(form.currentValue);

    if (
      !form.name.trim() ||
      !invested ||
      invested < 0 ||
      !currentValue ||
      currentValue < 0
    ) {
      return;
    }

    const holding = {
      id: editingHolding
        ? editingHolding.id
        : Date.now(),
      name: form.name.trim(),
      type: form.type,
      invested,
      currentValue,
    };

    setHoldings((current) =>
      editingHolding
        ? current.map((item) =>
            item.id === editingHolding.id
              ? holding
              : item
          )
        : [holding, ...current]
    );

    closeModal();
  }


  function deleteHolding(id) {
    setHoldings((current) =>
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
              Wealth overview
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f]">
              Portfolio
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track your investments, allocation and portfolio performance.
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
              Add investment
            </button>

          </div>
        </div>


        {/* Summary */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Portfolio value
            </p>

            <p className="mt-3 text-2xl font-semibold text-[#07111f]">
              {formatCurrency(summary.currentValue)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current value of investments
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Invested amount
            </p>

            <p className="mt-3 text-2xl font-semibold text-[#07111f]">
              {formatCurrency(summary.invested)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total amount invested
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Overall returns
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={18} />
              </div>
            </div>

            <p
              className={`mt-3 text-2xl font-semibold ${
                summary.returns >= 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {formatCurrency(summary.returns)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current value minus invested amount
            </p>
          </div>

        </div>


        {/* Portfolio content */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Allocation */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <h2 className="text-base font-semibold text-[#07111f]">
              Asset allocation
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Distribution across asset types.
            </p>


            {allocation.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Wallet size={24} />
                </div>

                <p className="text-sm font-medium text-[#07111f]">
                  No investments yet
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  Add your investments to see the portfolio allocation.
                </p>

              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {allocation.map((item) => {
                  const percentage =
                    summary.currentValue > 0
                      ? (item.value / summary.currentValue) * 100
                      : 0;

                  return (
                    <div key={item.type}>

                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-600">
                          {item.type}
                        </span>

                        <span className="font-medium text-[#07111f]">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatCurrency(item.value)}
                      </p>

                    </div>
                  );
                })}
              </div>
            )}

          </div>


          {/* Holdings */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

            <div className="border-b border-slate-100 px-5 py-5">
              <h2 className="text-base font-semibold text-[#07111f]">
                Holdings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your individual investments and their current values.
              </p>
            </div>


            {holdings.length === 0 ? (
              <div className="px-6 py-20 text-center">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Wallet size={26} />
                </div>

                <h3 className="text-base font-semibold text-[#07111f]">
                  No holdings yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Add your investments to start tracking your portfolio.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#07111f] px-5 py-3 text-sm font-medium text-white hover:bg-[#102039]"
                >
                  <Plus size={17} />
                  Add investment
                </button>

              </div>
            ) : (
              <div className="divide-y divide-slate-100">

                {holdings.map((holding) => {
                  const returns =
                    holding.currentValue - holding.invested;

                  return (
                    <div
                      key={holding.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>
                        <p className="font-medium text-[#07111f]">
                          {holding.name}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                          {holding.type}
                        </span>
                      </div>


                      <div className="grid grid-cols-3 items-center gap-5 text-right">

                        <div>
                          <p className="text-xs text-slate-400">
                            Invested
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#07111f]">
                            {formatCurrency(holding.invested)}
                          </p>
                        </div>


                        <div>
                          <p className="text-xs text-slate-400">
                            Current
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#07111f]">
                            {formatCurrency(holding.currentValue)}
                          </p>
                        </div>


                        <div>
                          <p className="text-xs text-slate-400">
                            Returns
                          </p>

                          <p
                            className={`mt-1 text-sm font-medium ${
                              returns >= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {formatCurrency(returns)}
                          </p>
                        </div>

                      </div>


                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(holding)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteHolding(holding.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

      </div>


      {/* Add / Edit modal */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="text-xl font-semibold text-[#07111f]">
                  {editingHolding
                    ? "Edit investment"
                    : "Add investment"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Enter your investment details.
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
                  Investment name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. HDFC Index Fund"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>


              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Asset type
                </label>

                <div className="relative">

                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value,
                      })
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-[#07111f] outline-none focus:border-emerald-400"
                  >
                    {assetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>
              </div>


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Invested amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.invested}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        invested: e.target.value,
                      })
                    }
                    placeholder="₹0"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400"
                    required
                  />
                </div>


                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Current value
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.currentValue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currentValue: e.target.value,
                      })
                    }
                    placeholder="₹0"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#07111f] outline-none placeholder:text-slate-400 focus:border-emerald-400"
                    required
                  />
                </div>

              </div>


              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

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
                  {editingHolding
                    ? "Save changes"
                    : "Add investment"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Portfolio;