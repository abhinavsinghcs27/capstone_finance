import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import FileDropzone from "../../components/upload/FileDropzone";
import ParsingProgress from "../../components/upload/ParsingProgress";
import ExtractedDataPreview from "../../components/upload/ExtractedDataPreview";

const UploadStatement = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [currentStep, setCurrentStep] = useState("upload");
  const [extractedData, setExtractedData] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleStartUpload = () => {
    if (!selectedFile) return;

    setCurrentStep("parsing");
  };

  const handleParsingComplete = () => {
    // Temporary sample data.
    // This will later come from the statement parsing API.
    setExtractedData({
      monthlyIncome: 85000,
      monthlyExpenses: 42000,
      investments: 180000,
      savings: 25000,
    });

    setCurrentStep("review");
  };

  const handleConfirmData = (confirmedData) => {
    console.log("Confirmed financial data:", confirmedData);

    // API/database integration will be added here.
    setCurrentStep("success");
  };

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setExtractedData(null);
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
              Upload your bank statement or financial document and FinanceAI
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
            onComplete={handleParsingComplete}
          />
        </div>
      )}

      {/* ================= REVIEW ================= */}

      {currentStep === "review" && extractedData && (
        <ExtractedDataPreview
          data={extractedData}
          onBack={handleUploadAnother}
          onConfirm={handleConfirmData}
        />
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