import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  WalletCards,
  Target,
  TrendingUp,
} from "lucide-react";

function ProfileSetup() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    employmentType: "",
    financialGoals: "",
    maritalStatus: "",
    dependents: "",

    monthlyIncome: "",
    otherIncome: "",

    fixedExpenses: "",
    variableExpenses: "",
    existingDebt: "",

    currentSavings: "",
    emergencyFund: "",

    stocks: "",
    mutualFunds: "",
    fixedDeposit: "",
    gold: "",
    insurance: "",
    otherInvestments: "",

    riskTolerance: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch("http://127.0.0.1:5000/user-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save profile");
    }

    alert("Profile saved successfully!");
    navigate("/dashboard");
  } catch (error) {
    console.error("Profile save error:", error);
    alert(error.message || "Unable to save profile. Please try again.");
  }
};
  return (
    <div className="mx-auto w-full max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#07111f]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
          Financial profile
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#07111f] sm:text-4xl">
          Build your financial profile
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Tell FinanceAI about your income, expenses, savings, investments and
          financial goals to build your personalized financial profile.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#07111f]">
              Profile setup
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Complete your financial information
            </p>
          </div>

          <span className="text-xs font-semibold text-emerald-600">
            0% complete
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-0 rounded-full bg-emerald-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ================= PERSONAL ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={CheckCircle2}
            title="Personal"
            description="Basic information to personalize your financial experience."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <InputField
              label="Full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />

            <InputField
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              required
            />

            <SelectField
              label="Employment type"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              options={[
                ["", "Select employment type"],
                ["salaried", "Salaried"],
                ["self-employed", "Self-employed"],
                ["business", "Business"],
                ["student", "Student"],
                ["retired", "Retired"],
                ["other", "Other"],
              ]}
            />

            <SelectField
              label="Marital status"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={[
                ["", "Select marital status"],
                ["single", "Single"],
                ["married", "Married"],
                ["other", "Other"],
              ]}
            />

            <InputField
              label="No. of dependents"
              name="dependents"
              type="number"
              value={formData.dependents}
              onChange={handleChange}
              placeholder="0"
            />

            <SelectField
              label="Primary financial goal"
              name="financialGoals"
              value={formData.financialGoals}
              onChange={handleChange}
              options={[
                ["", "Select financial goal"],
                ["saving", "Build savings"],
                ["emergency", "Build emergency fund"],
                ["investment", "Grow investments"],
                ["debt-free", "Become debt free"],
                ["retirement", "Retirement planning"],
                ["wealth", "Long-term wealth creation"],
              ]}
            />

          </div>
        </section>

        {/* ================= INCOME ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={WalletCards}
            title="Income"
            description="Tell us about the money coming into your household each month."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <InputField
              label="Monthly income"
              name="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={handleChange}
              placeholder="₹ Enter amount"
              required
            />

            <InputField
              label="Other income sources"
              name="otherIncome"
              type="number"
              value={formData.otherIncome}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

          </div>
        </section>

        {/* ================= EXPENSES ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={BriefcaseBusiness}
            title="Expenses"
            description="Understand your regular spending and existing financial obligations."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <InputField
              label="Fixed monthly expenses"
              name="fixedExpenses"
              type="number"
              value={formData.fixedExpenses}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Variable expenses"
              name="variableExpenses"
              type="number"
              value={formData.variableExpenses}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Existing EMIs / debt"
              name="existingDebt"
              type="number"
              value={formData.existingDebt}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

          </div>
        </section>

        {/* ================= SAVINGS ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={Target}
            title="Savings"
            description="Help us understand your current savings position."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <InputField
              label="Current savings"
              name="currentSavings"
              type="number"
              value={formData.currentSavings}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Emergency fund"
              name="emergencyFund"
              type="number"
              value={formData.emergencyFund}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

          </div>
        </section>

        {/* ================= INVESTMENTS ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={TrendingUp}
            title="Investments"
            description="Add the approximate amount currently held in your investments."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <InputField
              label="Stocks"
              name="stocks"
              type="number"
              value={formData.stocks}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Mutual funds"
              name="mutualFunds"
              type="number"
              value={formData.mutualFunds}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Fixed deposits"
              name="fixedDeposit"
              type="number"
              value={formData.fixedDeposit}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Gold"
              name="gold"
              type="number"
              value={formData.gold}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <SelectField
              label="Insurance"
              name="insurance"
              value={formData.insurance}
              onChange={handleChange}
              options={[
                ["", "Select insurance"],
                ["health", "Health insurance"],
                ["life", "Life insurance"],
                ["health-life", "Health & life insurance"],
                ["none", "No insurance"],
              ]}
            />

            <InputField
              label="Other investments"
              name="otherInvestments"
              type="number"
              value={formData.otherInvestments}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

          </div>
        </section>

        {/* ================= RISK ================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={ShieldCheck}
            title="Risk"
            description="Tell us how comfortable you are with investment risk."
          />

          <div className="mt-6">

            <SelectField
              label="Risk tolerance"
              name="riskTolerance"
              value={formData.riskTolerance}
              onChange={handleChange}
              options={[
                ["", "Select your risk tolerance"],
                ["low", "Low — I prefer stability"],
                ["moderate", "Moderate — I accept some fluctuations"],
                ["high", "High — I can accept higher fluctuations"],
              ]}
            />

          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-between">

          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0c1b2d] hover:shadow-lg"
          >
            Save profile

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>

        </div>

      </form>
    </div>
  );
}


/* ================= SECTION HEADER ================= */

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#07111f]">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-400">
          {description}
        </p>
      </div>

    </div>
  );
}


/* ================= INPUT FIELD ================= */

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-emerald-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? "0" : undefined}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
      />

    </div>
  );
}


/* ================= SELECT FIELD ================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#07111f] outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>

    </div>
  );
}

export default ProfileSetup;