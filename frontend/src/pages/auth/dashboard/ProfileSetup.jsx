import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

function ProfileSetup() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    salary: "",
    maritalStatus: "",
    kids: "",
    expenses: "",
    savingGoal: "",
    saving: "",
    insurance: "",
    investment: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Profile data:", formData);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
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
          Tell us about your finances
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          This information helps FinanceAI understand your financial position
          and prepare personalized insights for you.
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
              Step 1 of 1
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
        {/* Personal Information */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={CheckCircle2}
            title="Personal information"
            description="A few basic details to personalize your experience."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InputField
              label="Full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />

            <InputField
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
            />

            <SelectField
              label="Marital status"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={[
                ["", "Select status"],
                ["single", "Single"],
                ["married", "Married"],
                ["other", "Other"],
              ]}
            />

            <InputField
              label="Number of kids"
              name="kids"
              type="number"
              value={formData.kids}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </section>

        {/* Financial Information */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={WalletCards}
            title="Income & savings"
            description="Help FinanceAI understand your current financial position."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InputField
              label="Monthly salary / income"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Monthly overall expenses"
              name="expenses"
              type="number"
              value={formData.expenses}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Monthly saving goal"
              name="savingGoal"
              type="number"
              value={formData.savingGoal}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />

            <InputField
              label="Current savings"
              name="saving"
              type="number"
              value={formData.saving}
              onChange={handleChange}
              placeholder="₹ Enter amount"
            />
          </div>
        </section>

        {/* Protection & Investment */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <SectionHeader
            icon={ShieldCheck}
            title="Protection & investments"
            description="Tell us about your existing protection and investment choices."
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
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

            <SelectField
              label="Investment"
              name="investment"
              value={formData.investment}
              onChange={handleChange}
              options={[
                ["", "Select investment"],
                ["mutual-funds", "Mutual Funds"],
                ["stocks", "Stocks"],
                ["fixed-deposits", "Fixed Deposits"],
                ["real-estate", "Real Estate"],
                ["other", "Other"],
                ["none", "No investments"],
              ]}
            />
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}

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