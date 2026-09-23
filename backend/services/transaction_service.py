import os
import uuid
import pandas as pd 
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
TRANSACTION_CSV = os.path.join(DATA_DIR, "transactions.csv")

COLUMNS = [
    "id",
    "user_email",
    "date",
    "description",
    "amount",
    "category",
    "source",
    "created_at"
]

class TransactionService:
    @classmethod
    def _ensure_data_store(cls) -> None:
        """Ensures the data directory and transactions.csv file exist."""
        os.makedirs(DATA_DIR, exist_ok=True)
        if not os.path.exists(TRANSACTION_CSV):
            df = pd.DataFrame(columns=COLUMNS)
            df.to_csv(TRANSACTION_CSV, index=False)


    @classmethod
    def get_transations(cls, email: str) -> list[dict]:
        """Fetches all transactions for a specific user, sorted by date (newest first)"""
        cls._ensure_data_store()
        if not email:
            return  []
        
        try:
            df = pd.read_csv(TRANSACTION_CSV)
            if df.empty:
                return []
            
            user_txns = df[df["user_email"].astype(str).str.lower() == email.strip().lower()].copy()

            if user_txns.empty:
                return []

            user_txns = user_txns.fillna("")

            if "date" in user_txns.columns:
                user_txns["sort_date"] = pd.to_datetime(user_txns["date"], errors="coerce")
                user_txns = user_txns.sort_value(by="sort_date", ascending=False)
                user_txns = user_txns.drop(columns=["sort_date"])
            
            return user_txns.to_dict(orient="records")
        
        except Exception as e:
            print(f"Error reading transactions: {e}")
            return []

    @classmethod
    def save_bulk_transaction(cls, email: str, transactions: list[dict]) -> dict:
        """Saves a list of transactions extracted from a bank statement.
        Avoids exact duplicate entries for the same date, description, and amount."""

        cls._ensure_data_store()

        if not email or not transactions:
            return {"success": False, "message": "Email and Transactions list are required"}

        cleaned_email = email.strips().lower()
        now_str = datetime.utcnow().isoformat()

        processed_rows = []
        for txn in transactions:

            txn_type = str(txn.get("type", "debit")).lower()
            if txn_type in  [ "credit", "income", "inflow"]:
                normalized_type = "income"
            elif txn_type in ["investment", "sip", "mutual fund"]:
                normalized_type = "investment"
            else:
                normalized_type = "expense"

            row = { 
                "id": str(txn.get("id") or uuid.uuid4()),
                "user_email": cleaned_email,
                "date": txn.get("date") or datetime.utcnow().strftime("%Y-%m-%d"),
                "description": str(txn.get("description", "Untitled Transaction")).strip(),
                "amount": float(txn.get("amount", 0.0)),
                "type": normalized_type,
                

                
            }

        

    


