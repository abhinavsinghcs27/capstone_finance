import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  WalletCards,
  Target,
  TrendingUp,
  Edit3,
  User,
} from "lucide-react";

function ProfileSetup() {
  const navigate = useNavigate();

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

  const [isExisting, setIsExisting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const params = savedUser.email ? { email: savedUser.email } : {};

    api
      .get("/user-data", { params })
      .then((res) => {
        const u = res.data?.user;
        if (u && (u.monthly_income || u.monthlyIncome || u.name)) {
          setFormData({
            name: u.name || savedUser.name || "",
            age: u.age || "",
            employmentType: u.employment_type || u.employmentType || "",
            financialGoals: u.financial_goals || u.financialGoals || "",
            maritalStatus: u.marital_status || u.maritalStatus || "",
            dependents: u.dependents || "",

            monthlyIncome: u.monthly_income || u.monthlyIncome || "",
            otherIncome: u.other_income || u.otherIncome || "",

            fixedExpenses: u.fixed_expenses || u.fixedExpenses || "",
            variableExpenses: u.variable_expenses || u.variableExpenses || "",
            existingDebt: u.existing_debt || u.existingDebt || "",

            currentSavings: u.current_savings || u.currentSavings || "",
            emergencyFund: u.emergency_fund || u.emergencyFund || "",

            stocks: u.stocks || "",
            mutualFunds: u.mutual_funds || u.mutualFunds || "",
            fixedDeposit: u.fixed_deposit || u.fixedDeposit || "",
            gold: u.gold || "",
            insurance: u.insurance || "",
            otherInvestments: u.other_investments || u.otherInvestments || "",

            riskTolerance: u.risk_tolerance || u.riskTolerance || "",
          });
          setIsExisting(true);
          setIsEditing(false);
        } else {
          setIsExisting(false);
          setIsEditing(true);
          if (savedUser.name) {
            setFormData((prev) => ({ ...prev, name: savedUser.name }));
          }
        }
      })
      .catch((err) => {
        console.error("Fetch profile error:", err);
        setIsEditing(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const nameToSave = formData.name || savedUser.name || "";
      const payload = {
        ...formData,
        name: nameToSave,
        email: savedUser.email || "",
      };

      const res = await api.post("/user-data", payload);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Unable to save profile");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...savedUser,
          name: nameToSave,
        })
      );

      alert("Profile saved successfully!");
      setIsExisting(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile save error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to save profile. Please try again.";
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-medium text-slate-500">Loading profile data...</div>
      </div>
    );
  }

  // ================= PREVIEW MODE =================
  if (isExisting && !isEditing) {
    const totalExpenses =
      parseInt(formData.fixedExpenses || 0) +
      parseInt(formData.variableExpenses || 0) +
      parseInt(formData.existingDebt || 0);

    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#07111f]"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </button>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Financial Profile Summary
              </p>
            </div>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#07111f]">
              {formData.name ? `${formData.name}'s Profile` : "Your Financial Profile"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-[#07111f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c1b2d]"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Active Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#07111f]">
                  Financial Profile Recorded
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Your financial details are saved to backend CSV. You can review or edit them anytime.
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Saved Profile
            </span>
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <User size={18} />
                </div>
                <h3 className="text-base font-semibold text-[#07111f]">
                  Personal Information
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Full Name</p>
                <p className="mt-1 font-medium text-[#07111f]">{formData.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Age</p>
                <p className="mt-1 font-medium text-[#07111f]">{formData.age ? `${formData.age} yrs` : "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Employment</p>
                <p className="mt-1 font-medium capitalize text-[#07111f]">{formData.employmentType || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Marital Status</p>
                <p className="mt-1 font-medium capitalize text-[#07111f]">{formData.maritalStatus || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Dependents</p>
                <p className="mt-1 font-medium text-[#07111f]">{formData.dependents || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Primary Goal</p>
                <p className="mt-1 font-medium capitalize text-emerald-600">{formData.financialGoals || "-"}</p>
              </div>
            </div>
          </div>

          {/* Income & Expenses Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <WalletCards size={18} />
                </div>
                <h3 className="text-base font-semibold text-[#07111f]">
                  Income & Expenses
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Monthly Income</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.monthlyIncome || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Other Income</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.otherIncome || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Fixed Expenses</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.fixedExpenses || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Variable Expenses</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.variableExpenses || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">EMIs / Existing Debt</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.existingDebt || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Monthly Outflow</p>
                <p className="mt-1 font-semibold text-red-600">₹{totalExpenses}</p>
              </div>
            </div>
          </div>

          {/* Savings & Investments Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <TrendingUp size={18} />
                </div>
                <h3 className="text-base font-semibold text-[#07111f]">
                  Savings & Investments
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Current Savings</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.currentSavings || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Emergency Fund</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.emergencyFund || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Stocks</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.stocks || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Mutual Funds</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.mutualFunds || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Fixed Deposits</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{formData.fixedDeposit || "0"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Gold & Other</p>
                <p className="mt-1 font-medium text-[#07111f]">₹{(parseInt(formData.gold || 0) + parseInt(formData.otherInvestments || 0))}</p>
              </div>
            </div>
          </div>

          {/* Risk Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-base font-semibold text-[#07111f]">
                  Risk & Protection
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Insurance Type</p>
                <p className="mt-1 font-medium capitalize text-[#07111f]">
                  {formData.insurance || "None"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Risk Tolerance</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {formData.riskTolerance || "Not specified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Return to Dashboard
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl bg-[#07111f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c1b2d]"
          >
            <Edit3 size={16} />
            Edit Profile Data
          </button>
        </div>
      </div>
    );
  }

  // ================= EDIT MODE =================
  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (isExisting ? setIsEditing(false) : navigate("/dashboard"))}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#07111f]"
          >
            <ArrowLeft size={16} />
            {isExisting ? "Cancel & view profile" : "Back to dashboard"}
          </button>

          {isExisting && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="mb-5 flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:underline"
            >
              View Saved Profile
            </button>
          )}
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
          Financial profile
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#07111f] sm:text-4xl">
          {isExisting ? "Edit your financial profile" : "Build your financial profile"}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Tell FinanceAI about your income, expenses, savings, investments and
          financial goals to build your personalized financial profile.
        </p>
      </div>

      {/* Form */}
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
            onClick={() => (isExisting ? setIsEditing(false) : navigate("/dashboard"))}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {isExisting ? "Cancel editing" : "Cancel"}
          </button>

          <button
            type="submit"
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#07111f] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0c1b2d] hover:shadow-lg"
          >
            {isExisting ? "Update profile" : "Save profile"}
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
        <h2 className="text-lg font-semibold text-[#07111f]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-400">{description}</p>
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
function SelectField({ label, name, value, onChange, options }) {
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