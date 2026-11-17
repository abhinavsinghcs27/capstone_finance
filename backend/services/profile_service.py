import csv
import os
from dataclasses import asdict, dataclass, fields
from engines.financial_engine import FinancialEngine

CSV_FILE = os.path.join(os.path.abspath(os.path.dirname(os.path.dirname(__file__))), "user_data.csv")


@dataclass
class FinanceAI:
    email: str = ""
    name: str = ""
    age: int = 0
    employment_type: str = ""
    financial_goals: str = ""
    marital_status: str = ""
    dependents: int = 0

    monthly_income: int = 0
    other_income: int = 0

    fixed_expenses: int = 0
    variable_expenses: int = 0
    existing_debt: int = 0

    current_savings: int = 0
    emergency_fund: int = 0

    stocks: int = 0
    mutual_funds: int = 0
    fixed_deposit: int = 0
    gold: int = 0
    insurance: str = ""
    other_investments: int = 0

    risk_tolerance: str = ""

    @classmethod
    def from_dict(cls, data):
        return cls(
            email=str(data.get("email", "")).strip().lower(),
            name=str(data.get("name", "")).strip(),
            age=int(data.get("age", 0) or 0),
            employment_type=str(data.get("employmentType", data.get("employment_type", ""))),
            financial_goals=str(data.get("financialGoals", data.get("financial_goals", ""))),
            marital_status=str(data.get("maritalStatus", data.get("marital_status", ""))),
            dependents=int(data.get("dependents", 0) or 0),

            monthly_income=int(data.get("monthlyIncome", data.get("monthly_income", 0)) or 0),
            other_income=int(data.get("otherIncome", data.get("other_income", 0)) or 0),

            fixed_expenses=int(data.get("fixedExpenses", data.get("fixed_expenses", 0)) or 0),
            variable_expenses=int(data.get("variableExpenses", data.get("variable_expenses", 0)) or 0),
            existing_debt=int(data.get("existingDebt", data.get("existing_debt", 0)) or 0),

            current_savings=int(data.get("currentSavings", data.get("current_savings", 0)) or 0),
            emergency_fund=int(data.get("emergencyFund", data.get("emergency_fund", 0)) or 0),

            stocks=int(data.get("stocks", data.get("stock", 0)) or 0),
            mutual_funds=int(data.get("mutualFunds", data.get("mutual_fund", 0)) or 0),
            fixed_deposit=int(data.get("fixedDeposit", data.get("fixed_deposit", 0)) or 0),
            gold=int(data.get("gold", 0) or 0),
            insurance=str(data.get("insurance", "")),
            other_investments=int(data.get("otherInvestments", data.get("other_investments", 0)) or 0),

            risk_tolerance=str(data.get("riskTolerance", data.get("risk_tolerance", "")))
        )


FIELDS = [f.name for f in fields(FinanceAI)]


def init_profile_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as file:
            csv.DictWriter(file, fieldnames=FIELDS).writeheader()


class ProfileService:
    @staticmethod
    def get_profile(email=None):
        # 1. First look in Relational Database (SQLAlchemy / PostgreSQL)
        if email:
            email_clean = email.strip().lower()
            try:
                from models.financial_profile import FinancialProfile
                db_prof = FinancialProfile.query.filter_by(email=email_clean).first()
                if db_prof:
                    prof_dict = db_prof.to_dict()
                    evaluation = FinancialEngine(prof_dict).run_full_evaluation()
                    return {
                        "success": True,
                        "user": prof_dict,
                        "evaluation": evaluation
                    }
            except Exception:
                pass

        # 2. Fallback to CSV
        init_profile_csv()
        if not os.path.exists(CSV_FILE):
            return {"success": True, "user": None, "evaluation": None}

        with open(CSV_FILE, "r", encoding="utf-8") as file:
            users = list(csv.DictReader(file))

        if not users:
            return {"success": True, "user": None, "evaluation": None}

        matched_user = None
        if email:
            email_clean = email.strip().lower()
            for user in reversed(users):
                if user.get("email", "").lower() == email_clean:
                    matched_user = {k: v for k, v in user.items() if k is not None}
                    break
        else:
            matched_user = {key: value for key, value in users[-1].items() if key is not None}

        if matched_user:
            evaluation = FinancialEngine(matched_user).run_full_evaluation()
            return {
                "success": True,
                "user": matched_user,
                "evaluation": evaluation
            }

        return {"success": True, "user": None, "evaluation": None}

    @staticmethod
    def evaluate_profile(data):
        if not data or not isinstance(data, dict):
            return {
                "success": False,
                "message": "Financial data payload is required for evaluation",
                "status": 400
            }
        
        evaluation = FinancialEngine(data).run_full_evaluation()
        return {
            "success": True,
            "evaluation": evaluation,
            "status": 200
        }

    @staticmethod
    def save_or_update_profile(data):
        init_profile_csv()
        name = str(data.get("name", "")).strip()
        age = data.get("age")
        monthly_income = data.get("monthlyIncome", data.get("monthly_income"))

        if not name or age is None or monthly_income is None:
            return {
                "success": False,
                "message": "Name, age and monthly income are required",
                "status": 400
            }

        try:
            user = FinanceAI.from_dict(data)
        except (ValueError, TypeError) as e:
            return {
                "success": False,
                "message": "Please enter valid financial information",
                "status": 400
            }

        user_dict = asdict(user)
        user_email = str(user_dict.get("email", "")).strip().lower()
        user_name = str(user_dict.get("name", "")).strip().lower()

        # 1. Persist to Relational Database (SQLAlchemy / PostgreSQL)
        if user_email:
            try:
                from extensions import db
                from models.user import User
                from models.financial_profile import FinancialProfile

                user_obj = User.query.filter_by(email=user_email).first()
                existing_prof = FinancialProfile.query.filter_by(email=user_email).first()
                if not existing_prof:
                    existing_prof = FinancialProfile(
                        user_id=user_obj.id if user_obj else None,
                        email=user_email
                    )
                    db.session.add(existing_prof)

                existing_prof.name = user_dict.get("name", "")
                existing_prof.age = int(user_dict.get("age", 0) or 0)
                existing_prof.employment_type = user_dict.get("employment_type", "")
                existing_prof.financial_goals = user_dict.get("financial_goals", "")
                existing_prof.marital_status = user_dict.get("marital_status", "")
                existing_prof.dependents = int(user_dict.get("dependents", 0) or 0)
                existing_prof.monthly_income = int(user_dict.get("monthly_income", 0) or 0)
                existing_prof.other_income = int(user_dict.get("other_income", 0) or 0)
                existing_prof.fixed_expenses = int(user_dict.get("fixed_expenses", 0) or 0)
                existing_prof.variable_expenses = int(user_dict.get("variable_expenses", 0) or 0)
                existing_prof.existing_debt = int(user_dict.get("existing_debt", 0) or 0)
                existing_prof.current_savings = int(user_dict.get("current_savings", 0) or 0)
                existing_prof.emergency_fund = int(user_dict.get("emergency_fund", 0) or 0)
                existing_prof.stocks = int(user_dict.get("stocks", 0) or 0)
                existing_prof.mutual_funds = int(user_dict.get("mutual_funds", 0) or 0)
                existing_prof.fixed_deposit = int(user_dict.get("fixed_deposit", 0) or 0)
                existing_prof.gold = int(user_dict.get("gold", 0) or 0)
                existing_prof.insurance = user_dict.get("insurance", "")
                existing_prof.other_investments = int(user_dict.get("other_investments", 0) or 0)
                existing_prof.risk_tolerance = user_dict.get("risk_tolerance", "Moderate")

                db.session.commit()
            except Exception as e:
                try:
                    from extensions import db
                    db.session.rollback()
                except Exception:
                    pass

        # 2. Persist to CSV fallback
        existing_rows = []
        if os.path.exists(CSV_FILE):
            with open(CSV_FILE, "r", encoding="utf-8") as file:
                existing_rows = list(csv.DictReader(file))

        updated = False
        new_rows = []

        for row in existing_rows:
            row_email = str(row.get("email", "")).strip().lower()
            row_name = str(row.get("name", "")).strip().lower()

            is_match = False
            if user_email and row_email:
                is_match = (row_email == user_email)
            elif user_name and row_name:
                is_match = (row_name == user_name)

            if is_match:
                new_rows.append(user_dict)
                updated = True
            else:
                new_rows.append(row)

        if not updated:
            new_rows.append(user_dict)

        with open(CSV_FILE, "w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(new_rows)

        evaluation = FinancialEngine(user_dict).run_full_evaluation()

        return {
            "success": True,
            "message": "User financial profile saved successfully",
            "user": user_dict,
            "evaluation": evaluation,
            "status": 200
        }
