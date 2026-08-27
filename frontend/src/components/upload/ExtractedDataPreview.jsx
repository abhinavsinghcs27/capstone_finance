import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Pencil,
  Save,
  WalletCards,
  TrendingUp,
  ReceiptText,
} from "lucide-react";

const DEFAULT_DATA = {
  monthlyIncome: 85000,
  monthlyExpenses: 42000,
  investments: 180000,
  savings: 25000,
};

const ExtractedDataPreview = ({
  data = DEFAULT_DATA,
  onConfirm,
  onBack,
}) => {
  const [financialData, setFinancialData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFinancialData(data);
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFinancialData((previousData) => ({
      ...previousData,
      [name]: Number(value),
    }));
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(financialData);
    }
  };

  const summaryCards = [
    {
      key: "monthlyIncome",
      label: "Monthly Income",
      icon: WalletCards,
    },
    {
      key: "monthlyExpenses",
      label: "Monthly Expenses",
      icon: ReceiptText,
    },
    {
      key: "investments",
      label: "Total Investments",
      icon: TrendingUp,
    },
    {
      key: "savings",
      label: "Monthly Savings",
      icon: CheckCircle2,
    },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="extracted-data-preview">
      <div className="extracted-data-preview__header">
        <div>
          <span className="extracted-data-preview__eyebrow">
            EXTRACTION COMPLETE
          </span>

          <h2>Review your financial data</h2>

          <p>
            We extracted the following information from your uploaded
            document. Please verify the values before syncing them to
            your financial profile.
          </p>
        </div>

        <div className="extracted-data-preview__status">
          <CheckCircle2 size={20} />
          <span>Ready for review</span>
        </div>
      </div>

      <div className="financial-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="financial-summary-card"
              key={card.key}
            >
              <div className="financial-summary-card__icon">
                <Icon size={22} />
              </div>

              <span>{card.label}</span>

              <strong>
                {formatCurrency(financialData[card.key])}
              </strong>
            </div>
          );
        })}
      </div>

      <div className="extracted-data-preview__table-section">
        <div className="extracted-data-preview__table-header">
          <div>
            <h3>Extracted financial information</h3>
            <p>
              {isEditing
                ? "Update any value that needs correction."
                : "Review the extracted values."}
            </p>
          </div>

          <button
            type="button"
            className="extracted-data-preview__edit-button"
            onClick={() => setIsEditing((previous) => !previous)}
          >
            <Pencil size={17} />

            {isEditing ? "Cancel editing" : "Edit values"}
          </button>
        </div>

        <div className="financial-data-table">
          {summaryCards.map((item) => (
            <div
              className="financial-data-row"
              key={item.key}
            >
              <span>{item.label}</span>

              {isEditing ? (
                <div className="financial-data-input">
                  <span>₹</span>

                  <input
                    type="number"
                    name={item.key}
                    value={financialData[item.key]}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              ) : (
                <strong>
                  {formatCurrency(financialData[item.key])}
                </strong>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="extracted-data-preview__actions">
        <button
          type="button"
          className="extracted-data-preview__back-button"
          onClick={onBack}
        >
          Upload another file
        </button>

        <button
          type="button"
          className="extracted-data-preview__confirm-button"
          onClick={handleConfirm}
        >
          <Save size={18} />
          Confirm & Sync Profile
        </button>
      </div>
    </div>
  );
};

export default ExtractedDataPreview;