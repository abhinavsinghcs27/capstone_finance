import os
import re
from datetime import datetime
import pandas as pd
import pdfplumber


class StatementParser:
    """Parser service to extract data from bank statements (CSV, Excel, PDF),
    categorize financial flows, and synthesize the profile required by FinanceAI."""

    SALARY_KEYWORDS = ["SALARY", "PAYROLL", "DIRECT DEP", "STIPEND", "WAGES", "HONORARIUM"]
    OTHER_INFLOW_KEYWORDS = [
        "NEFT CR", "ACH CR", "CREDIT INTEREST", "DIVIDEND", "DIVIDENT", "REFUND",
        "CASHBACK", "UPI CR", "INTEREST", "REVERSAL", "RECEIVED FROM", "MONEY RECEIVED",
        "TRANSFER FROM", "CR TO", "IMPS CR", "RTGS CR", "BY TRANSFER"
    ]
    INFLOW_KEYWORDS = SALARY_KEYWORDS + OTHER_INFLOW_KEYWORDS
    INVESTMENT_KEYWORDS = [
        "MUTUAL FUND", "MF", "SIP", "ZERODHA", "GROWW", "INDMONEY", "UPSTOX", "NSE", "BSE",
        "SECURITIES", "STOCK", "ETMONEY", "COIN", "PPF", "NPS", "FD", "DEPOSIT", "KIMS", "CAMS", "KARVY",
        "UTI", "HDFC MF", "SBI MF", "ICICI PRU", "NIPPON", "MIRAE", "PARAG PARIKH", "AXIS MF", "KOTAK MF"
    ]
    FIXED_EXPENSE_KEYWORDS = [
        "EMI", "LOAN", "HOUSING", "RENT", "LIC", "BAJAJ FIN", "INSURANCE", "PREMIUM",
        "MAINTENANCE", "BILL", "ELECTRICITY", "METRO", "BROADBAND", "WIFI", "WATER BILL", "GAS",
        "AIRTEL", "JIO", "VODAFONE", "VI POSTPAID", "CRED", "CRED CLUB"
    ]
    VARIBLE_KEYWORDS = [
        "UPI", "SWIGGY", "ZOMATO", "AMAZON", "FLIPKART", "GROCERY", "BLINKIT", "ZEPTO", "UBER", "OLA", "PAYTM",
        "RESTAURANT", "CAFE", "FUEL", "PETROL", "CINEMA", "BOOKMYSHOW", "SHOPPING", "RETAIL", "RAPIDO",
        "FOOD", "ENTERTAINMENT", "SPOTIFY", "YOUTUBE", "MONEY SENT", "PAID TO", "TRANSFER TO", "INSTAMART",
        "BIGBASKET", "MYNTRA", "AJIO", "TATA 1MG", "PHARMEASY", "APOLLO"
    ]
    VARIABLE_KEYWORDS = VARIBLE_KEYWORDS

    BANK_SIGNATURES = {
        "Paytm UPI Statement": ["paytm", "paytm upi", "one97"],
        "HDFC Bank": ["hdfc", "hdfcbank"],
        "ICICI Bank": ["icici", "icicibank"],
        "State Bank of India": ["sbi", "state bank of india"],
        "Axis Bank": ["axis", "axisbank"],
        "Kotak Mahindra Bank": ["kotak", "kotak mahindra"],
        "Punjab National Bank": ["pnb", "punjab national"],
        "Bank of Baroda": ["bob", "bank of baroda"],
        "Canara Bank": ["canara"],
        "Union Bank of India": ["union bank"],
        "IndusInd Bank": ["indusind"],
        "Federal Bank": ["federal bank"],
        "Yes Bank": ["yes bank"],
        "IDFC First Bank": ["idfc", "idfc first"]
    }

    @classmethod
    def parse(cls, file_path: str) -> dict:
        """Main entrypoint. Inspects file type, parses raw transactions, applies classification rules, and aggregates profile parameters."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        filename = os.path.basename(file_path)
        ext = os.path.splitext(filename)[1].lower()

        raw_text = ""
        df = pd.DataFrame()

        if ext == ".csv":
            df = cls._parse_csv(file_path)
        elif ext in [".xlsx", ".xls", ".xlsm"]:
            df = cls._parse_excel(file_path)
        elif ext == ".pdf":
            df, raw_text = cls._parse_pdf(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        if df is None or df.empty:
            raise ValueError("No transaction data extracted from document.")

        df = cls._standerdize_dataframe(df)
        if df.empty:
            raise ValueError("No valid transaction rows found after standardization.")

        detected_bank = cls._detect_bank(filename, raw_text)
        statement_period = cls._extract_period(df, raw_text)
        categorized_transactions = cls._categorize_transactions(df)
        extracted_profile = cls._synthesize_profile(categorized_transactions, df, raw_text)
        sample_transactions = categorized_transactions[:20]

        return {
            "success": True,
            "message": "Statement parsed successfully",
            "document_info": {
                "filename": filename,
                "detect_bank": detected_bank,
                "detected_bank": detected_bank,
                "statement_period": statement_period
            },
            "extraction_profile": extracted_profile,
            "extracted_profile": extracted_profile,
            "sample_transactions": sample_transactions,
            "simple_transactions": sample_transactions,
            "transactions": categorized_transactions
        }

    @classmethod
    def _find_header_and_normalize(cls, df: pd.DataFrame) -> pd.DataFrame:
        """Locates the true transaction table header row within messy metadata rows in Excel/CSV sheets."""
        if df is None or df.empty:
            return pd.DataFrame()

        # Check existing columns
        col_str = " ".join([str(c).lower() for c in df.columns])
        has_date = any(k in col_str for k in ["date", "txn_dt", "val_dt", "txn date", "time"])
        has_desc = any(k in col_str for k in ["narration", "description", "particulars", "remarks", "details", "desc", "transaction", "party", "payee"])
        has_amt = any(k in col_str for k in ["debit", "credit", "withdrawal", "deposit", "amount", "amt", "dr", "cr", "balance"])

        if (has_date and (has_desc or has_amt)) or (has_desc and has_amt):
            return df

        # Search top 40 rows for header row
        max_search = min(40, len(df))
        for idx in range(max_search):
            row_vals = [str(x).strip().lower() for x in df.iloc[idx].tolist() if pd.notna(x) and str(x).strip()]
            row_str = " ".join(row_vals)
            r_has_date = any(k in row_str for k in ["date", "txn_dt", "val_dt", "txn date"])
            r_has_desc = any(k in row_str for k in ["narration", "description", "particulars", "remarks", "details", "desc", "transaction", "party"])
            r_has_amt = any(k in row_str for k in ["debit", "credit", "withdrawal", "deposit", "amount", "amt", "dr", "cr", "balance"])

            if (r_has_date and (r_has_desc or r_has_amt)) or (r_has_desc and r_has_amt):
                new_cols = []
                seen = {}
                for col_val in df.iloc[idx].tolist():
                    c_clean = str(col_val).strip() if pd.notna(col_val) and str(col_val).strip() and str(col_val).strip().lower() != "nan" else "col"
                    if c_clean in seen:
                        seen[c_clean] += 1
                        new_cols.append(f"{c_clean}_{seen[c_clean]}")
                    else:
                        seen[c_clean] = 0
                        new_cols.append(c_clean)

                new_df = df.iloc[idx + 1:].copy()
                new_df.columns = new_cols
                return new_df.reset_index(drop=True)

        return df

    @classmethod
    def _parse_csv(cls, file_path: str) -> pd.DataFrame:
        df = pd.DataFrame()
        for sep in [",", ";", "\t", "|"]:
            try:
                temp_df = pd.read_csv(file_path, sep=sep, on_bad_lines="skip")
                if len(temp_df.columns) > 2:
                    df = temp_df
                    break
            except Exception:
                pass

        if df.empty:
            try:
                df = pd.read_csv(file_path, on_bad_lines="skip", header=None)
            except Exception:
                return pd.DataFrame()

        return cls._find_header_and_normalize(df)

    @classmethod
    def _parse_excel(cls, file_path: str) -> pd.DataFrame:
        df = pd.DataFrame()

        # 1. Try reading all sheets with default openpyxl
        try:
            excel_file = pd.ExcelFile(file_path)
            for sheet in excel_file.sheet_names:
                try:
                    sheet_df = pd.read_excel(file_path, sheet_name=sheet)
                    normalized = cls._find_header_and_normalize(sheet_df)
                    if len(normalized) >= 1:
                        df = normalized
                        break
                except Exception:
                    continue
        except Exception:
            pass

        # 2. Try HTML table fallback (many Indian bank .xls files are actually HTML table dumps)
        if df.empty:
            try:
                tables = pd.read_html(file_path)
                if tables:
                    for tbl in tables:
                        norm = cls._find_header_and_normalize(tbl)
                        if len(norm) > len(df):
                            df = norm
            except Exception:
                pass

        # 3. Try xlrd or csv fallback
        if df.empty:
            try:
                df = pd.read_excel(file_path, engine="xlrd")
                df = cls._find_header_and_normalize(df)
            except Exception:
                try:
                    df = cls._parse_csv(file_path)
                except Exception:
                    pass

        return df

    @classmethod
    def _parse_pdf(cls, file_path: str) -> tuple[pd.DataFrame, str]:
        raw_text = ""
        all_tables_rows = []

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    raw_text += text + "\n"

                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if row and any(cell and str(cell).strip() for cell in row):
                            all_tables_rows.append([str(c).strip() if c is not None else "" for c in row])

        # 1. Try borderless text regex parser first (handles Paytm UPI & digital wallet statements)
        df_borderless = cls._parse_borderless_text_pdf(raw_text)
        if len(df_borderless) >= 2:
            return df_borderless, raw_text

        # 2. Try standard grid table parser
        if len(all_tables_rows) >= 2:
            header_idx = -1
            for idx, row in enumerate(all_tables_rows[:15]):
                row_str = " ".join(row).lower()
                if any(h in row_str for h in ["date", "particulars", "narration", "description", "withdrawal", "deposit", "debit", "credit", "amount"]):
                    header_idx = idx
                    break

            if header_idx != -1:
                headers = all_tables_rows[header_idx]
                seen = {}
                clean_headers = []
                for h in headers:
                    h_clean = h.strip() if h.strip() else "col"
                    if h_clean in seen:
                        seen[h_clean] += 1
                        clean_headers.append(f"{h_clean}_{seen[h_clean]}")
                    else:
                        seen[h_clean] = 0
                        clean_headers.append(h_clean)

                data_rows = all_tables_rows[header_idx + 1:]
                norm_rows = []
                for r in data_rows:
                    if len(r) < len(clean_headers):
                        r = r + [""] * (len(clean_headers) - len(r))
                    norm_rows.append(r[:len(clean_headers)])

                df_table = pd.DataFrame(norm_rows, columns=clean_headers)
                if len(df_table) > 0:
                    return df_table, raw_text

        # 3. Fallback to borderless parser if any rows found
        if not df_borderless.empty:
            return df_borderless, raw_text

        return pd.DataFrame(), raw_text

    @classmethod
    def _parse_borderless_text_pdf(cls, raw_text: str) -> pd.DataFrame:
        """Parses borderless card-style statements (e.g. Paytm UPI) from raw text."""
        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        records = []

        # Matches single dates like '31 Mar', '12 Mar 2025', '01 Apr \'24', excluding date ranges like '1 MAR\'25 - 31 MAR\'25'
        date_line_regex = re.compile(
            r"^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s*['’]?\d{2,4})?)(?!\s*-\s*\d{1,2}\s+[A-Za-z])\s+(.*)",
            re.IGNORECASE
        )
        amt_regex = re.compile(r"([+-])\s*(?:-\s*)?Rs\.?\s*([\d,]+(?:\.\d{2})?)\s*$", re.IGNORECASE)

        for i, line in enumerate(lines):
            m = date_line_regex.match(line)
            if m:
                txn_date = m.group(1).strip()
                rest = m.group(2).strip()

                amt_match = amt_regex.search(rest)
                if amt_match:
                    sign = amt_match.group(1)
                    raw_amt = amt_match.group(2).replace(",", "")
                    try:
                        amt = float(raw_amt)
                        desc = rest[:amt_match.start()].strip()
                        desc = re.sub(r"-\s*$", "", desc).strip()
                        if not desc:
                            desc = "UPI Transaction"

                        is_credit = (sign == "+")
                        records.append({
                            "date": txn_date,
                            "description": desc,
                            "debit": 0.0 if is_credit else amt,
                            "credit": amt if is_credit else 0.0,
                            "balance": 0.0
                        })
                    except ValueError:
                        pass

        if records:
            return pd.DataFrame(records)
        return pd.DataFrame()

    @classmethod
    def _clean_amount(cls, val) -> float:
        if pd.isna(val):
            return 0.0
        val_str = str(val).strip()
        if not val_str or val_str.lower() in ["nan", "none", "-", "null", "nil", ""]:
            return 0.0

        is_negative = False
        if val_str.startswith("(") and val_str.endswith(")"):
            is_negative = True
            val_str = val_str[1:-1]
        elif "dr" in val_str.lower() and not "cr" in val_str.lower():
            pass

        val_clean = re.sub(r"[^\d.-]", "", val_str.replace(",", ""))
        try:
            num = float(val_clean)
            return -num if is_negative else num
        except ValueError:
            return 0.0

    @classmethod
    def _standerdize_dataframe(cls, df: pd.DataFrame) -> pd.DataFrame:
        if df is None or df.empty:
            return pd.DataFrame()

        # If already pre-standardized (e.g. from borderless parser)
        if "description" in df.columns and ("debit" in df.columns or "credit" in df.columns):
            df["debit"] = pd.to_numeric(df["debit"], errors="coerce").fillna(0.0)
            df["credit"] = pd.to_numeric(df["credit"], errors="coerce").fillna(0.0)
            df["balance"] = pd.to_numeric(df["balance"], errors="coerce").fillna(0.0) if "balance" in df.columns else 0.0
            return df[df["description"].astype(str).str.strip() != ""].reset_index(drop=True)

        mapping = {}
        for col in df.columns:
            col_lower = str(col).lower().strip()
            tokens = set(re.findall(r"[a-z0-9]+", col_lower))

            if ("date" not in mapping) and any(k in col_lower for k in ["date", "txn_dt", "val_dt", "txn date", "value date", "post date"]):
                mapping["date"] = col
            elif ("description" not in mapping) and any(k in col_lower for k in [
                "narration", "description", "particulars", "remarks", "details", "desc",
                "transaction particulars", "transaction details", "party", "payee", "beneficiary", "merchant"
            ]):
                mapping["description"] = col
            elif ("debit" not in mapping) and (
                any(k in col_lower for k in ["withdrawal", "debit", "withdraw", "dr.", "dr amount", "money out", "paid out"])
                or tokens.intersection({"dr", "debit", "withdrawal", "withdrawals"})
            ):
                mapping["debit"] = col
            elif ("credit" not in mapping) and (
                any(k in col_lower for k in ["deposit", "credit", "cr.", "cr amount", "money in", "paid in", "deposits"])
                or tokens.intersection({"cr", "credit", "deposit", "deposits"})
            ):
                mapping["credit"] = col
            elif ("balance" not in mapping) and any(k in col_lower for k in ["balance", "bal", "closing", "running bal", "avail bal"]):
                mapping["balance"] = col
            elif ("amount" not in mapping) and any(k in col_lower for k in ["amount", "amt", "txn_amt", "net amount"]):
                mapping["amount"] = col
            elif ("type" not in mapping) and (any(k in col_lower for k in ["type", "cr_dr", "dr_cr", "cr/dr", "dr/cr", "indicator"]) or tokens.intersection({"type"})):
                mapping["type"] = col

        # If date or description not mapped, attempt positional fallback
        if "description" not in mapping and len(df.columns) >= 2:
            # Pick longest text column as description
            text_cols = [c for c in df.columns if c not in mapping.values()]
            if text_cols:
                mapping["description"] = text_cols[0]

        if "date" not in mapping and len(df.columns) >= 1:
            for c in df.columns:
                if c != mapping.get("description"):
                    mapping["date"] = c
                    break

        standard_df = pd.DataFrame()
        standard_df["date"] = df[mapping["date"]].astype(str) if "date" in mapping else ""
        standard_df["description"] = df[mapping["description"]].astype(str) if "description" in mapping else ""

        if "debit" in mapping or "credit" in mapping:
            standard_df["debit"] = df[mapping["debit"]].apply(cls._clean_amount) if "debit" in mapping else 0.0
            standard_df["credit"] = df[mapping["credit"]].apply(cls._clean_amount) if "credit" in mapping else 0.0
        elif "amount" in mapping:
            raw_amounts = df[mapping["amount"]]
            type_series = df[mapping["type"]].astype(str).str.upper() if "type" in mapping else None

            debit_list = []
            credit_list = []
            for i, raw_val in enumerate(raw_amounts):
                num = cls._clean_amount(raw_val)
                row_type = type_series.iloc[i] if type_series is not None and i < len(type_series) else ""

                if "CR" in row_type or "CREDIT" in row_type or str(raw_val).strip().startswith("+"):
                    credit_list.append(abs(num))
                    debit_list.append(0.0)
                elif "DR" in row_type or "DEBIT" in row_type or str(raw_val).strip().startswith("-") or num < 0:
                    debit_list.append(abs(num))
                    credit_list.append(0.0)
                else:
                    # Default positive without indicator -> debit if spend/transfer, credit if default
                    credit_list.append(abs(num))
                    debit_list.append(0.0)

            standard_df["debit"] = debit_list
            standard_df["credit"] = credit_list
        else:
            standard_df["debit"] = 0.0
            standard_df["credit"] = 0.0

        standard_df["balance"] = df[mapping["balance"]].apply(cls._clean_amount) if "balance" in mapping else 0.0

        # Filter out non-transaction / footer / header rows
        filter_mask = []
        for _, row in standard_df.iterrows():
            d_val = str(row["date"]).strip().lower()
            desc_val = str(row["description"]).strip().lower()
            dr_val = float(row["debit"])
            cr_val = float(row["credit"])

            is_empty = (desc_val in ["", "nan", "none", "null"]) or (d_val in ["", "nan", "none", "null"] and dr_val == 0.0 and cr_val == 0.0)
            is_summary = any(s in desc_val for s in [
                "total withdrawal", "total deposit", "opening balance", "closing balance",
                "statement summary", "*** end", "page 1 of", "generated on", "disclaimer"
            ]) or (d_val in ["total", "subtotal", "opening balance", "closing balance"])

            filter_mask.append(not is_empty and not is_summary and (dr_val > 0 or cr_val > 0 or len(desc_val) > 2))

        filtered_df = standard_df[filter_mask].reset_index(drop=True)
        return filtered_df

    @classmethod
    def _detect_bank(cls, filename: str, raw_text: str) -> str:
        content = f"{filename} {raw_text}".lower()
        for bank_name, signatures in cls.BANK_SIGNATURES.items():
            if any(sig in content for sig in signatures):
                return bank_name
        return "Generic Bank Statement"

    @classmethod
    def _extract_period(cls, df: pd.DataFrame, raw_text: str = "") -> str:
        upi_period = re.search(r"(\d{1,2}\s+[A-Za-z]{3}(?:'\d{2,4})?\s*-\s*\d{1,2}\s+[A-Za-z]{3}(?:'\d{2,4})?)", raw_text)
        if upi_period:
            return upi_period.group(1)

        if "date" not in df.columns:
            return "Current Month"
        dates = [str(d).strip() for d in df["date"].dropna() if str(d).strip() and str(d).strip().lower() not in ["nan", "none", ""]]
        if len(dates) >= 2:
            return f"{dates[0]} to {dates[-1]}"
        elif len(dates) == 1:
            return dates[0]
        return "Current Month"

    @classmethod
    def _categorize_transactions(cls, df: pd.DataFrame) -> list[dict]:
        records = []
        for _, row in df.iterrows():
            desc = str(row["description"]).upper()
            debit = float(row.get("debit", 0.0))
            credit = float(row.get("credit", 0.0))
            date = str(row.get("date", ""))

            if credit > 0:
                txn_type = "CREDIT"
                amount = credit
                if any(k in desc for k in cls.SALARY_KEYWORDS) or (credit >= 30000 and not any(k in desc for k in cls.OTHER_INFLOW_KEYWORDS)):
                    category = "Salary"
                else:
                    category = "Other Inflow"
            else:
                txn_type = "DEBIT"
                amount = debit
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
    def _synthesize_profile(cls, categorized_transactions: list[dict], df: pd.DataFrame, raw_text: str = "") -> dict:
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

        paid_match = re.search(r"Total Money Paid\s*-\s*Rs\.?\s*([\d,]+(?:\.\d{2})?)", raw_text, re.I)
        recv_match = re.search(r"Total Money Received\s*\+\s*Rs\.?\s*([\d,]+(?:\.\d{2})?)", raw_text, re.I)

        if recv_match and not salary_credits:
            total_recv = float(recv_match.group(1).replace(",", ""))
            monthly_income = total_recv
        if paid_match and variable_expenses == 0.0:
            variable_expenses = float(paid_match.group(1).replace(",", ""))

        non_zero_balances = df[df["balance"] > 0]["balance"].tolist() if "balance" in df.columns else []
        current_savings = non_zero_balances[-1] if non_zero_balances else 25000.0
        emergency_fund = current_savings * 0.75
        mutual_funds = sum(investments) * 0.6 if investments else 0.0
        stocks = sum(investments) * 0.4 if investments else 0.0

        return {
            "monthly_income": round(float(monthly_income), 2),
            "other_income": round(float(other_income), 2),
            "fixed_expenses": round(float(fixed_expenses), 2),
            "variable_expenses": round(float(variable_expenses), 2),
            "existing_debt": round(float(existing_debt), 2),
            "current_savings": round(float(current_savings), 2),
            "emergency_fund": round(float(emergency_fund), 2),
            "mutual_funds": round(float(mutual_funds), 2),
            "stocks": round(float(stocks), 2),
            "fixed_deposit": 0.0,
            "gold": 0.0,
            "risk_tolerance": "Moderate",
            "dependents": 1,
            "insurance": "Standard Life & Health"
        }
