import os
import re
from datetime import datetime
import pandas as pd
import pdfplumber

class StatementParser:
    """parser service to extract data from bank statment,
    categorize financial flows, and synthesize the 21-parameter profile required by FinanceAI."""

    INFLOW_KEYWORDS = ["SALARY", "PAYROLL", "NEFT CR", "ACH CR", "DIRECT DEP", "CREDIT INTEREST","DIVIDENT"]
    FIXED_EXPENSE_KEYWORDS = ["EMI","LOAN","HOUSING","RENT","LIC","BAJAJ FIN", "INSURANCE", "PREMIUM"]
    VARIBLE_KEYWORDS = ["UPI", "SWIGGY", "ZOMATO", "AMAZON", "FLIPKART", "GROCERY", "BLINKIT", "ZEPTO", "UBER", "OLA", "PAYTM",
    "RESTAURANT", "CAFE", "FUEL", "PETROL"]

    BANK_SIGNATURES = {
        "HDFC Bank": ["hdfc", "hdfcbank"],
        "ICICI Bank": ["icici", "icicibank"],
        "State Bank of India": ["sbi", "state bank of india"],
        "Axis Bank": ["axis", "axisbank"],
        "Kotak Mahindra Bank": ["kotak", "kotak mahindra"]
    }

    @classmethod
    def parse(cls, file_path: str) -> dict:
        """Main entrypoint. Inspects file type, parses raw transactions, applies classification rules, and aggregates profile parame"""

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File Not Found : {file_path}")

        filename = os.path.basename(file_path)
        ext = os.path.splitext(filename)[1].lower()

        raw_text = ""
        df = pd.DataFrame()

        if ext == ".csv":
            df = cls._parse_csv(file_path)
        elif ext in [".xlsx", ".xls"]:
            df = cls._parse_excel(file_path)
        elif ext == ".pdf":
            df, raw_text = cls._parse_pdf(file_path)
        else:
            raise ValueError(f"Unsupported file type : {ext}")

        if df.empty:
            raise ValueError("No transaction data extracted.")

        df = cls._standerdize_dataframe(df)
        detected_bank = cls._detect_bank(filename, raw_text)
        statement_period = cls._extract_period(df)
        categorized_transactions = cls._categorize_transactions(df)
        extracted_profile = cls._synthesize_profile(categorized_transactions, df)
        sample_transactions = categorized_transactions[:10]

        return {
            "success": True,
            "message": "Statement parsed successfully",
            "document_info":{
                "filename": filename,
                "detect_bank": detected_bank,
                "statement_period": statement_period
            },
            "extraction_profile": extracted_profile,
            "simple_transactions": sample_transactions
        }

    @classmethod
    def _parse_csv(cls, file_path: str) -> pd.DataFrame:
        try:
            return pd.read_csv(file_path)
        except Exception:
            return pd.read_csv(file_path, skiprows=10)
    @classmethod
    def _parse_excel(cls, file_path: str) -> pd.DataFrame:
        return pd.read_excel(file_path)
    @classmethod
    def _parse_pdf(cls, file_path: str) -> tuple[pd.DataFrame, str]:
        all_row = []
        full_text = []

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text.append(text)

                table = page.extract_tables()
                for table in tables:
                    cleaned = [str(c).strip() if c is not None else "" for c in row]
                    if any(cleaned):
                        all_row.appand(cleaned)

        raw_text_str = "\n".join(full_text)
        if not all_row:
            return pf.DataFrame(), raw_text_str
        
        header_idx = 0 
        for i, row in enumerate(all_row[:15]):
            row_str = " ".join(row).lower()
            keywords = [
                "date",
                "narration",
                "description",
                "particulars",
                "withdrawal",
                "deposit"
            ]

            found = False

            for k in keywords:
                if k in row_str:
                    found = True
                    break

                if found:
                    header_idx = i
                    break

        headers = all_row[header_idx]
        data_rows = all_row[header_idx + 1:]
        df = pd.DataFrame(data_rows, columns=[f"col_{j}" if not h else h for j, h in enumerate(headers)])
        return df, raw_text_str

    @classmethod
    def _standerdize_dataframe(cls, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize various column naming conventions across different banks."""
        cleaned_cols = [re.sub(r'[^a-zA-Z0-9]', '_', str(c).strip().lower()) for c in df.columns]
        df.columns = cleaned_cols
        
        mapping = {}

        for col in df.columns:
            if any(k in col for k in ["txn_date", "transaction_date", "val_date", "value_date", "date"]) and "date" not in mapping:
                mapping["date"] = col
            elif any(k in col for k in ["withdrawal", "debit", "dr", "withdraw"]) and "debit" not in mapping:
                 mapping["description"] = col
            elif any(k in col for k in ["withdrawal", "debit", "dr", "withdraw"]) and "debit" not in mapping:
                mapping["debit"] = col
            elif any(k in col for k in ["deposit", "credit", "cr"]) and "credit" not in mapping:
                mapping["credit"] = col
            elif any(k in col for k in ["balance", "bal", "closing"]) and "balance" not in mapping:
                mapping["balance"] = col

        standard_df = pd.DataFrame()
        standard_df["data"] = df[mapping["date"]] if "data" in mapping else ""
        standard_df["description"] = df[mapping["description"]] if "description" in mapping else ""
        def clean_amount(val):
            if pd.isna(val):
                return 0.0
            val_str = str(val).replace(",", "").replace("INR", "").replace("₹", "").strip()
            val_str = re.sub(r'[^\d.-]', '', val_str)
            try:
                return float(val_str) if val_str else 0.0
            except ValueError:
                return 0.0
        standard_df["debit"] = df[mapping["debit"]].apply(clean_amount) if "debit" in mapping else 0.0
        standard_df["credit"] = df[mapping["credit"]].apply(clean_amount) if "credit" in mapping else 0.0
        standard_df["balance"] = df[mapping["balance"]].apply(clean_amount) if "balance" in mapping else 0.0
        standard_df = standard_df[standard_df["description"].astype(str).str.strip() != ""]
        return standard_df.reset_index(drop=True)

    @classmethod
    def _detect_bank(cls, filename:str, raw_text:str)-> str:
        content = f"{filename} {raw_text}".lower()
        for bank_name, signatures in cls.BANK_SIGNATURES.items():
            if any (sig in content for sig in signatures):
                return bank_name

            return "Generic Bank Statement"

    @classmethod
    def _extract_period(cls, df: pd.DataFrame) -> str:
        dates = [str(d).strip() for d in df["date"].dropna() if str(d).strip()]
        if len(dates) >= 2:
            return f"{dates[0]} to {dates[-1]}"
        return "Current Month"

    @classmethod
    def _categorize_transactions(cls, df: pd.DataFrame) -> list[dict]:
        records  = []
        for _, row in df.iterrows():
            desc = str(row["description"]).upper()
            debit = float(row.get("debit", 0.0))
            credit = float(row.get("credit", 0.0))
            date = str(row.get("date", ""))

            if credit > 0:
                txn_type = "CREDIT"
                amount = credit
            else:
                txn_type = "DEBIT"
                amount = debit

            catogory = "Other"
            if credit > 0:
                if any(k in desc for k in cls.INFLOW_KEYWORDS) or credit >= 30000:
                    catogory = "Salary"
                else:
                    catogory = "Other Inflow"
            else:
                if any(k in desc for k in cls.INVESTMENT_KEYWORDS):
                    category = "Investment"
                elif any(k in desc for k in cls.FIXED_EXPENSE_KEYWORDS):
                    category = "Fixed Expense"
                elif any(k in desc for k in cls.VARIBLE_KEYWORDS):
                    category = "Variable Spend"
                else:
                    category = "General Debit"
            records.append({
                "date": date,
                "description": row["description"],
                "amount": amount,
                "type": txn_type,
                "category": category
            })
        return records 
    @classmethod
    def _synthesize_profile(cls, categorized_transactions: list[dict], df: pd.DataFrame) -> dict:
        salary_credits = [t["amount"] for t in categorized_transactions if t["category"] == "Salary"]
        other_credits = [t["amount"] for t in categorized_transactions if t["category"] == "Other Inflow"]
        fixed_debits = [t["amount"] for t in categorized_transactions if t["category"] == "Fixed Expense"]
        variable_debits = [t["amount"] for t in categorized_transactions if t["category"] in ["Variable Spend", "General Debit"]]
        investments = [t["amount"] for t in categorized_transactions if t["category"] == "Investment"]
        monthly_income = max(salary_credits) if salary_credits else (sum(other_credits) if other_credits else 50000.0)
        other_income = sum(other_credits) if salary_credits else 0.0
        fixed_expenses = sum(fixed_debits)
        variable_expenses = sum(variable_debits)
        existing_debt = sum([t["amount"] for t in categorized_transactions if any(k in str(t["description"]).upper() for k in ["EMI", "LOAN"])])
        non_zero_balances = df[df["balance"] > 0]["balance"].tolist()
        current_savings = non_zero_balances[-1] if non_zero_balances else 25000.0
        mutual_funds = sum(investments) * 0.6 if investments else 0.0
        stocks = sum(investments) * 0.4 if investments else 0.0
        return {
            "monthly_income": round(float(monthly_income), 2),
            "other_income": round(float(other_income), 2),
            "fixed_expenses": round(float(fixed_expenses), 2),
            "variable_expenses": round(float(variable_expenses), 2),
            "existing_debt": round(float(existing_debt), 2),
            "current_savings": round(float(current_savings), 2),
            "emergency_fund": round(float(current_savings * 0.75), 2),
            "mutual_funds": round(float(mutual_funds), 2),
            "stocks": round(float(stocks), 2),
            "fixed_deposit": 0.0,
            "gold": 0.0,
            "risk_tolerance": "Moderate",
            "dependents": 1,
            "insurance": "Standard Life & Health"
        }
        


