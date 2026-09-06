import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

import FileDropzone from "../../components/upload/FileDropzone";
import ParsingProgress from "../../components/upload/ParsingProgress";
import ExtractedDataPreview from "../../components/upload/ExtractedDataPreview";

const UploadStatement = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [currentStep, setCurrentStep] = useState("upload");
  const [extractedData, setExtractedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isApiDone, setIsApiDone] = useState(false);
  const [isAnimDone, setIsAnimDone] = useState(false);

  // Transition to review when both API and animation are finished
  useEffect(() => {
    if (isApiDone && isAnimDone && extractedData && currentStep === "parsing") {
      setCurrentStep("review");
    }
  }, [isApiDone, isAnimDone, extractedData, currentStep]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setErrorMessage("");
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setErrorMessage("");
    setIsApiDone(false);
    setIsAnimDone(false);
    setExtractedData(null);
    setCurrentStep("parsing");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/user-data/upload-statement", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        setExtractedData(response.data);
        setIsApiDone(true);
      } else {
        throw new Error(response.data?.message || "Failed to parse bank statement");
      }
    } catch (error) {
      console.error("Statement upload/parse error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while processing the statement. Please ensure it is a valid bank statement (PDF, Excel, or CSV).";
      setErrorMessage(msg);
      setCurrentStep("upload");
    }
  };

  const handleParsingAnimationComplete = () => {
    setIsAnimDone(true);
  };


  const handleConfirmData = async (confirmedData) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        email: savedUser.email || "",
        name: savedUser.name || "User",
        age: Number(savedUser.age || 28),
        employmentType: savedUser.employmentType || savedUser.employment_type || "salaried",
        financialGoals: savedUser.financialGoals || savedUser.financial_goals || "wealth",
        maritalStatus: savedUser.maritalStatus || savedUser.marital_status || "single",
        dependents: Number(confirmedData.dependents || savedUser.dependents || 0),

        monthlyIncome: Number(confirmedData.monthlyIncome || 0),
        otherIncome: Number(confirmedData.otherIncome || 0),
        fixedExpenses: Number(confirmedData.fixedExpenses || 0),
        variableExpenses: Number(confirmedData.variableExpenses || 0),
        existingDebt: Number(confirmedData.existingDebt || 0),
        currentSavings: Number(confirmedData.currentSavings || 0),
        emergencyFund: Number(confirmedData.emergencyFund || 0),
        stocks: Number(confirmedData.stocks || 0),
        mutualFunds: Number(confirmedData.mutualFunds || 0),
        fixedDeposit: Number(confirmedData.fixedDeposit || 0),
        gold: Number(confirmedData.gold || 0),
        insurance: confirmedData.insurance || savedUser.insurance || "Standard Life & Health",
        otherInvestments: Number(confirmedData.otherInvestments || 0),
        riskTolerance: confirmedData.riskTolerance || savedUser.riskTolerance || "Moderate",
      };

      const res = await api.post("/user-data", payload);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to sync financial profile");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...savedUser,
          name: payload.name,
        })
      );

      setCurrentStep("success");
    } catch (error) {
      console.error("Profile sync error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save profile. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setErrorMessage("");
    setCurrentStep("upload");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        type="button"
        onClick={handleBackToDashboard}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#07111f]"
      >
        <ArrowLeft size={18} />
        Back to dashboard
      </button>

      {/* Error alert if any */}
      {errorMessage && currentStep === "upload" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">Unable to process document</p>
            <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ================= UPLOAD ================= */}
      {currentStep === "upload" && (
        <div>
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <FileUp size={14} />
              Statement Upload
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#07111f] sm:text-4xl">
              Upload your financial statement
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Upload your bank statement (PDF, Excel, or CSV) and FinanceAI
              will securely extract and organize your financial information.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <FileDropzone onFileSelect={handleFileSelect} />

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck
                  size={18}
                  className="shrink-0 text-emerald-600"
                />
                Your document is securely processed and never shared.
              </div>

              <button
                type="button"
                disabled={!selectedFile}
                onClick={handleStartUpload}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  selectedFile
                    ? "bg-[#07111f] text-white hover:bg-[#142033]"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                <FileUp size={18} />
                Analyze statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PARSING ================= */}
      {currentStep === "parsing" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <ParsingProgress
            isParsing={true}
            onComplete={handleParsingAnimationComplete}
          />
        </div>
      )}

      {/* ================= REVIEW ================= */}
      {currentStep === "review" && extractedData && (
        <div>
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle size={20} className="shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold">Failed to save profile</p>
                <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <ExtractedDataPreview
            data={extractedData}
            onBack={handleUploadAnother}
            onConfirm={handleConfirmData}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* ================= SUCCESS ================= */}
      {currentStep === "success" && (
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={34} />
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-[#07111f] sm:text-3xl">
            Financial data synced successfully
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Your confirmed financial information has been saved and will now be
            used to personalize your FinanceAI dashboard and insights.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleUploadAnother}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#07111f] transition hover:bg-slate-50"
            >
              Upload another statement
            </button>

            <button
              type="button"
              onClick={handleBackToDashboard}
              className="rounded-xl bg-[#07111f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#142033]"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStatement;