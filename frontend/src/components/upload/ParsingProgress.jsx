import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  FileSearch,
  LoaderCircle,
  ScanText,
  Tags,
  Sparkles,
} from "lucide-react";

const PARSING_STEPS = [
  {
    id: 1,
    title: "Reading your document",
    description: "Securely analyzing the uploaded financial statement.",
    icon: FileSearch,
  },
  {
    id: 2,
    title: "Extracting financial data",
    description: "Identifying income, expenses, investments, and transactions.",
    icon: ScanText,
  },
  {
    id: 3,
    title: "Categorizing transactions",
    description: "Organizing your financial activity into meaningful categories.",
    icon: Tags,
  },
  {
    id: 4,
    title: "Preparing your review",
    description: "Structuring the extracted data for your confirmation.",
    icon: Sparkles,
  },
];

const ParsingProgress = ({
  isParsing = false,
  onComplete,
  stepDuration = 1200,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isParsing) {
      setCurrentStep(0);
      return undefined;
    }

    if (currentStep >= PARSING_STEPS.length) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (currentStep === PARSING_STEPS.length - 1) {
        setCurrentStep(PARSING_STEPS.length);

        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 400);
        }

        return;
      }

      setCurrentStep((previousStep) => previousStep + 1);
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [currentStep, isParsing, onComplete, stepDuration]);

  const progressPercentage =
    (Math.min(currentStep, PARSING_STEPS.length) /
      PARSING_STEPS.length) *
    100;

  return (
    <div className="parsing-progress">
      <div className="parsing-progress__header">
        <div>
          <span className="parsing-progress__eyebrow">
            FINANCEAI DOCUMENT INTELLIGENCE
          </span>

          <h2>
            {currentStep >= PARSING_STEPS.length
              ? "Analysis complete"
              : "Analyzing your financial statement"}
          </h2>

          <p>
            {currentStep >= PARSING_STEPS.length
              ? "Your financial information is ready for review."
              : "Please wait while we securely process and organize your data."}
          </p>
        </div>

        {currentStep < PARSING_STEPS.length ? (
          <LoaderCircle
            className="parsing-progress__loader"
            size={32}
          />
        ) : (
          <CheckCircle2
            className="parsing-progress__complete-icon"
            size={34}
          />
        )}
      </div>

      <div className="parsing-progress__bar">
        <div
          className="parsing-progress__bar-fill"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>

      <div className="parsing-progress__percentage">
        {Math.round(progressPercentage)}% complete
      </div>

      <div className="parsing-progress__steps">
        {PARSING_STEPS.map((step, index) => {
          const StepIcon = step.icon;

          const isCompleted = index < currentStep;
          const isActive =
            index === currentStep &&
            currentStep < PARSING_STEPS.length;
          const isPending = !isCompleted && !isActive;

          return (
            <div
              className={`parsing-step ${
                isCompleted ? "parsing-step--completed" : ""
              } ${isActive ? "parsing-step--active" : ""} ${
                isPending ? "parsing-step--pending" : ""
              }`}
              key={step.id}
            >
              <div className="parsing-step__indicator">
                {isCompleted ? (
                  <CheckCircle2 size={22} />
                ) : isActive ? (
                  <LoaderCircle
                    size={22}
                    className="parsing-step__spinner"
                  />
                ) : (
                  <Circle size={22} />
                )}
              </div>

              <div className="parsing-step__content">
                <div className="parsing-step__title">
                  <StepIcon size={18} />
                  <h3>{step.title}</h3>
                </div>

                <p>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParsingProgress;