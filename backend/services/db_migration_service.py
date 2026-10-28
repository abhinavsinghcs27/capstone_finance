"""
Automated Database Migration & Sync Service
Migrates flat files (users.csv, user_data.csv, transactions.csv, goals.json, budgets.json)
into an enterprise relational SQLite database using SQLAlchemy models.
"""
import os
import json
import pandas as pd
from extensions import db
from models.user import User
from models.financial_profile import FinancialProfile
from models.transaction import Transaction
from models.goal import Goal
from models.budget import Budget


BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BACKEND_DIR, "data")


class DBMigrationService:
    @classmethod
    def init_database(cls, app=None):
        """Initializes database tables and triggers automated CSV seeding if tables are empty."""
        try:
            db.create_all()
            if User.query.count() == 0 or Transaction.query.count() == 0:
                cls.migrate_from_csvs()
        except Exception as e:
            print(f"[DB Migration] Warning during database init: {e}")

    @classmethod
    def migrate_from_csvs(cls) -> dict:
        """
        Reads existing file datastores and imports records into relational SQLite database.
        Returns a summary report of migrated records.
        """
        stats = {
            "users_migrated": 0,
            "profiles_migrated": 0,
            "transactions_migrated": 0,
            "goals_migrated": 0,
            "budgets_migrated": 0,
            "errors": []
        }

        # 1. Migrate Users (backend/users.csv)
        users_csv = os.path.join(BACKEND_DIR, "users.csv")
        if os.path.exists(users_csv):
            try:
                df_users = pd.read_csv(users_csv).fillna("")
                for _, row in df_users.iterrows():
                    email = str(row.get("email", "")).strip().lower()
                    if not email:
                        continue
                    existing_user = User.query.filter_by(email=email).first()
                    if not existing_user:
                        user = User(
                            name=str(row.get("name", "")),
                            email=email,
                            auth_type=str(row.get("auth_type", "local")),
                            password_hash=str(row.get("password_hash", ""))
                        )
                        db.session.add(user)
                        stats["users_migrated"] += 1
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                stats["errors"].append(f"users.csv error: {str(e)}")

        # 2. Migrate Financial Profiles (backend/user_data.csv)
        profile_csv = os.path.join(BACKEND_DIR, "user_data.csv")
        if os.path.exists(profile_csv):
            try:
                df_prof = pd.read_csv(profile_csv).fillna("")
                for _, row in df_prof.iterrows():
                    email = str(row.get("email", "")).strip().lower()
                    if not email:
                        continue

                    user_obj = User.query.filter_by(email=email).first()
                    existing_prof = FinancialProfile.query.filter_by(email=email).first()
                    if not existing_prof:
                        prof = FinancialProfile(
                            user_id=user_obj.id if user_obj else None,
                            email=email,
                            name=str(row.get("name", "")),
                            age=int(pd.to_numeric(row.get("age"), errors="coerce") or 0),
                            employment_type=str(row.get("employment_type", "")),
                            financial_goals=str(row.get("financial_goals", "")),
                            marital_status=str(row.get("marital_status", "")),
                            dependents=int(pd.to_numeric(row.get("dependents"), errors="coerce") or 0),
                            monthly_income=int(pd.to_numeric(row.get("monthly_income"), errors="coerce") or 0),
                            other_income=int(pd.to_numeric(row.get("other_income"), errors="coerce") or 0),
                            fixed_expenses=int(pd.to_numeric(row.get("fixed_expenses"), errors="coerce") or 0),
                            variable_expenses=int(pd.to_numeric(row.get("variable_expenses"), errors="coerce") or 0),
                            existing_debt=int(pd.to_numeric(row.get("existing_debt", row.get("debt")), errors="coerce") or 0),
                            current_savings=int(pd.to_numeric(row.get("current_savings", row.get("savings")), errors="coerce") or 0),
                            emergency_fund=int(pd.to_numeric(row.get("emergency_fund"), errors="coerce") or 0),
                            stocks=int(pd.to_numeric(row.get("stocks"), errors="coerce") or 0),
                            mutual_funds=int(pd.to_numeric(row.get("mutual_funds"), errors="coerce") or 0),
                            fixed_deposit=int(pd.to_numeric(row.get("fixed_deposit"), errors="coerce") or 0),
                            gold=int(pd.to_numeric(row.get("gold"), errors="coerce") or 0),
                            risk_tolerance=str(row.get("risk_tolerance", "Moderate")),
                        )
                        db.session.add(prof)
                        stats["profiles_migrated"] += 1
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                stats["errors"].append(f"user_data.csv error: {str(e)}")

        # 3. Migrate Transactions (backend/data/transactions.csv)
        txns_csv = os.path.join(DATA_DIR, "transactions.csv")
        if os.path.exists(txns_csv):
            try:
                df_txns = pd.read_csv(txns_csv).fillna("")
                for _, row in df_txns.iterrows():
                    txn_id = str(row.get("id", "")).strip()
                    if not txn_id:
                        continue
                    existing_txn = Transaction.query.filter_by(id=txn_id).first()
                    if not existing_txn:
                        txn = Transaction(
                            id=txn_id,
                            user_email=str(row.get("user_email", "")).strip().lower(),
                            date=str(row.get("date", "")),
                            description=str(row.get("description", "")),
                            amount=float(pd.to_numeric(row.get("amount"), errors="coerce") or 0.0),
                            type=str(row.get("type", "expense")).lower(),
                            category=str(row.get("category", "Other")),
                            source=str(row.get("source", "statement")),
                            created_at=str(row.get("created_at", ""))
                        )
                        db.session.add(txn)
                        stats["transactions_migrated"] += 1
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                stats["errors"].append(f"transactions.csv error: {str(e)}")

        # 4. Migrate Goals (backend/data/goals.json)
        goals_json = os.path.join(DATA_DIR, "goals.json")
        if os.path.exists(goals_json):
            try:
                with open(goals_json, "r", encoding="utf-8") as gf:
                    goals_dict = json.load(gf)
                for email, glist in goals_dict.items():
                    for item in glist:
                        gid = str(item.get("id", ""))
                        if not gid:
                            continue
                        existing_g = Goal.query.filter_by(id=gid).first()
                        if not existing_g:
                            g = Goal(
                                id=gid,
                                user_email=email.strip().lower(),
                                title=str(item.get("title", "")),
                                category=str(item.get("category", "General")),
                                target_amount=float(item.get("target_amount") or 0.0),
                                current_amount=float(item.get("current_amount") or 0.0),
                                target_date=f"{item.get('target_month', 'Dec')} {item.get('target_year', '2030')}",
                                created_at=str(item.get("created_at", ""))
                            )
                            db.session.add(g)
                            stats["goals_migrated"] += 1
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                stats["errors"].append(f"goals.json error: {str(e)}")

        # 5. Migrate Budgets (backend/data/budgets.json)
        budgets_json = os.path.join(DATA_DIR, "budgets.json")
        if os.path.exists(budgets_json):
            try:
                with open(budgets_json, "r", encoding="utf-8") as bf:
                    budgets_dict = json.load(bf)
                for email, bmap in budgets_dict.items():
                    for cat, limit_val in bmap.items():
                        existing_b = Budget.query.filter_by(user_email=email.strip().lower(), category=cat).first()
                        if not existing_b:
                            b = Budget(
                                user_email=email.strip().lower(),
                                category=cat,
                                monthly_limit=float(limit_val or 0.0)
                            )
                            db.session.add(b)
                            stats["budgets_migrated"] += 1
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                stats["errors"].append(f"budgets.json error: {str(e)}")

        return stats

    @classmethod
    def get_database_status(cls) -> dict:
        """Returns live statistics of the SQLite database tables and storage."""
        db_file = os.path.join(DATA_DIR, "financeai.db")
        db_size_kb = round(os.path.getsize(db_file) / 1024, 2) if os.path.exists(db_file) else 0.0

        return {
            "database_type": "SQLite / SQLAlchemy Relational ORM",
            "database_file": db_file,
            "database_size_kb": db_size_kb,
            "counts": {
                "users": User.query.count(),
                "financial_profiles": FinancialProfile.query.count(),
                "transactions": Transaction.query.count(),
                "goals": Goal.query.count(),
                "budgets": Budget.query.count(),
            }
        }

