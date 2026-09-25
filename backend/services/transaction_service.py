import os
import uuid
import pandas as pd
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
TRANSACTION_CSV = os.path.join(DATA_DIR, "transactions.csv")

COLUMNS = [
    "id",
    "user_email",
    "date",
    "description",
    "amount",
    "type",
    "category",
    "source",
    "created_at"
]


class TransactionService:
    @classmethod
    def _ensure_data_store(cls) -> None:
        """Ensures the data directory and transactions.csv file exist with standard schema."""
        os.makedirs(DATA_DIR, exist_ok=True)
        if not os.path.exists(TRANSACTION_CSV):
            df = pd.DataFrame(columns=COLUMNS)
            df.to_csv(TRANSACTION_CSV, index=False)
        else:
            try:
                df = pd.read_csv(TRANSACTION_CSV)
                missing_cols = [c for c in COLUMNS if c not in df.columns]
                if missing_cols:
                    for col in missing_cols:
                        df[col] = ""
                    df = df[COLUMNS]
                    df.to_csv(TRANSACTION_CSV, index=False)
            except Exception:
                df = pd.DataFrame(columns=COLUMNS)
                df.to_csv(TRANSACTION_CSV, index=False)

    @classmethod
    def get_transactions(cls, email: str) -> list[dict]:
        """Fetches all transactions for a specific user, sorted by date (newest first)."""
        cls._ensure_data_store()
        if not email:
            return []

        try:
            df = pd.read_csv(TRANSACTION_CSV)
            if df.empty:
                return []

            cleaned_email = str(email).strip().lower()
            user_txns = df[df["user_email"].astype(str).str.strip().str.lower() == cleaned_email].copy()

            if user_txns.empty:
                return []

            user_txns = user_txns.fillna("")

            # Convert amount to float
            user_txns["amount"] = pd.to_numeric(user_txns["amount"], errors="coerce").fillna(0.0)

            # Sort by date descending, then created_at descending
            user_txns["sort_date"] = pd.to_datetime(user_txns["date"], errors="coerce")
            user_txns["sort_created"] = pd.to_datetime(user_txns["created_at"], errors="coerce")
            user_txns = user_txns.sort_values(by=["sort_date", "sort_created"], ascending=[False, False])
            user_txns = user_txns.drop(columns=["sort_date", "sort_created"])

            return user_txns.to_dict(orient="records")

        except Exception as e:
            print(f"Error reading transactions: {e}")
            return []

    @classmethod
    def save_bulk_transactions(cls, email: str, transactions: list[dict]) -> dict:
        """Saves a list of transactions extracted from a bank statement.
        Normalizes types, generates UUIDs, and avoids exact duplicate entries."""
        cls._ensure_data_store()

        if not email or not isinstance(transactions, list):
            return {
                "success": False,
                "count": 0,
                "message": "Email and transactions array are required"
            }

        cleaned_email = str(email).strip().lower()
        if not cleaned_email:
            return {
                "success": False,
                "count": 0,
                "message": "Valid email is required"
            }

        if not transactions:
            return {
                "success": True,
                "count": 0,
                "message": "No transactions to save"
            }

        try:
            existing_df = pd.read_csv(TRANSACTION_CSV)
        except Exception:
            existing_df = pd.DataFrame(columns=COLUMNS)

        now_str = datetime.now(timezone.utc).isoformat()

        # Build existing signature set for fast duplicate detection
        existing_signatures = set()
        existing_ids = set()
        if not existing_df.empty:
            for _, row in existing_df.iterrows():
                row_email = str(row.get("user_email", "")).strip().lower()
                if row_email == cleaned_email:
                    r_id = str(row.get("id", "")).strip()
                    r_date = str(row.get("date", "")).strip()
                    r_desc = str(row.get("description", "")).strip().lower()
                    try:
                        r_amt = round(float(row.get("amount", 0.0)), 2)
                    except (ValueError, TypeError):
                        r_amt = 0.0
                    if r_id:
                        existing_ids.add(r_id)
                    existing_signatures.add((r_date, r_desc, r_amt))

        new_rows = []
        for txn in transactions:
            raw_type = str(txn.get("type", "expense")).lower().strip()
            if raw_type in ["income", "credit", "inflow", "salary"]:
                normalized_type = "income"
            elif raw_type in ["investment", "sip", "mutual fund", "stocks", "mutual_fund", "mf"]:
                normalized_type = "investment"
            else:
                normalized_type = "expense"

            txn_date = str(txn.get("date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")).strip()
            txn_desc = str(txn.get("description", "Untitled Transaction")).strip()
            
            try:
                txn_amt = abs(round(float(txn.get("amount", 0.0)), 2))
            except (ValueError, TypeError):
                txn_amt = 0.0

            # Default category based on type if missing
            category = str(txn.get("category", "")).strip()
            if not category:
                if normalized_type == "income":
                    category = "Income"
                elif normalized_type == "investment":
                    category = "Investment"
                else:
                    category = "Other"

            txn_id = str(txn.get("id") or uuid.uuid4())
            source = str(txn.get("source") or "statement_upload")
            created_at = str(txn.get("created_at") or now_str)

            # Check for duplicate
            sig = (txn_date, txn_desc.lower(), txn_amt)
            if txn_id in existing_ids or sig in existing_signatures:
                continue

            existing_signatures.add(sig)
            existing_ids.add(txn_id)

            new_rows.append({
                "id": txn_id,
                "user_email": cleaned_email,
                "date": txn_date,
                "description": txn_desc,
                "amount": txn_amt,
                "type": normalized_type,
                "category": category,
                "source": source,
                "created_at": created_at
            })

        if new_rows:
            new_df = pd.DataFrame(new_rows, columns=COLUMNS)
            if existing_df.empty:
                combined_df = new_df
            else:
                combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            combined_df.to_csv(TRANSACTION_CSV, index=False)

        return {
            "success": True,
            "count": len(new_rows),
            "message": f"Successfully stored {len(new_rows)} transactions"
        }

    @classmethod
    def add_single_transaction(cls, email: str, data: dict) -> dict:
        """Adds a single manual transaction to transactions.csv."""
        cls._ensure_data_store()

        if not email or not isinstance(data, dict):
            return {
                "success": False,
                "message": "User email and transaction data are required"
            }

        cleaned_email = str(email).strip().lower()
        if not cleaned_email:
            return {
                "success": False,
                "message": "Valid email is required"
            }

        description = str(data.get("description", "")).strip()
        if not description:
            return {
                "success": False,
                "message": "Transaction description is required"
            }

        try:
            amount = abs(round(float(data.get("amount", 0.0)), 2))
            if amount <= 0:
                return {
                    "success": False,
                    "message": "Amount must be greater than 0"
                }
        except (ValueError, TypeError):
            return {
                "success": False,
                "message": "Invalid amount value"
            }

        raw_type = str(data.get("type", "expense")).lower().strip()
        if raw_type in ["income", "credit", "inflow", "salary"]:
            normalized_type = "income"
        elif raw_type in ["investment", "sip", "mutual fund", "stocks", "mutual_fund", "mf"]:
            normalized_type = "investment"
        else:
            normalized_type = "expense"

        category = str(data.get("category", "")).strip()
        if not category:
            if normalized_type == "income":
                category = "Income"
            elif normalized_type == "investment":
                category = "Investment"
            else:
                category = "Food"

        txn_date = str(data.get("date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")).strip()
        txn_id = str(data.get("id") or uuid.uuid4())
        source = str(data.get("source") or "manual")
        created_at = datetime.now(timezone.utc).isoformat()

        row = {
            "id": txn_id,
            "user_email": cleaned_email,
            "date": txn_date,
            "description": description,
            "amount": amount,
            "type": normalized_type,
            "category": category,
            "source": source,
            "created_at": created_at
        }

        try:
            existing_df = pd.read_csv(TRANSACTION_CSV)
        except Exception:
            existing_df = pd.DataFrame(columns=COLUMNS)

        row_df = pd.DataFrame([row], columns=COLUMNS)
        if existing_df.empty:
            combined_df = row_df
        else:
            combined_df = pd.concat([existing_df, row_df], ignore_index=True)
        combined_df.to_csv(TRANSACTION_CSV, index=False)

        return {
            "success": True,
            "transaction": row
        }

    @classmethod
    def delete_transaction(cls, email: str, txn_id: str) -> dict:
        """Deletes a transaction by its ID and optional user email."""
        cls._ensure_data_store()

        if not txn_id:
            return {
                "success": False,
                "message": "Transaction ID is required"
            }

        try:
            df = pd.read_csv(TRANSACTION_CSV)
            if df.empty:
                return {
                    "success": False,
                    "message": "No transactions found"
                }

            initial_len = len(df)
            str_txn_id = str(txn_id).strip()

            if email:
                cleaned_email = str(email).strip().lower()
                mask = ~((df["id"].astype(str).str.strip() == str_txn_id) & 
                         (df["user_email"].astype(str).str.strip().str.lower() == cleaned_email))
            else:
                mask = ~(df["id"].astype(str).str.strip() == str_txn_id)

            updated_df = df[mask]

            if len(updated_df) == initial_len:
                return {
                    "success": False,
                    "message": "Transaction not found"
                }

            updated_df.to_csv(TRANSACTION_CSV, index=False)
            return {
                "success": True,
                "message": "Transaction deleted successfully"
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Error deleting transaction: {str(e)}"
            }
