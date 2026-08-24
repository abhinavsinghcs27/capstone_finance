from datetime import datetime
from extensions import db

class FinancialProfile(db.Model):
    __tablename__ = "financial_profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    name = db.Column(db.String(120), default="")

    # Personal & Demographics
    age = db.Column(db.Integer, default=0)
    employment_type = db.Column(db.String(50), default="")
    financial_goals = db.Column(db.String(100), default="")
    marital_status = db.Column(db.String(30), default="")
    dependents = db.Column(db.Integer, default=0)

    # Income & Cashflow
    monthly_income = db.Column(db.Integer, default=0)
    other_income = db.Column(db.Integer, default=0)

    # Expenses & Liabilities
    fixed_expenses = db.Column(db.Integer, default=0)
    variable_expenses = db.Column(db.Integer, default=0)
    existing_debt = db.Column(db.Integer, default=0)

    # Savings & Liquidity
    current_savings = db.Column(db.Integer, default=0)
    emergency_fund = db.Column(db.Integer, default=0)

    # Investments & Assets
    stocks = db.Column(db.Integer, default=0)
    mutual_funds = db.Column(db.Integer, default=0)
    fixed_deposit = db.Column(db.Integer, default=0)
    gold = db.Column(db.Integer, default=0)
    insurance = db.Column(db.String(50), default="")
    other_investments = db.Column(db.Integer, default=0)

    # Risk
    risk_tolerance = db.Column(db.String(30), default="")

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "email": self.email,
            "name": self.name,
            "age": self.age,
            "employment_type": self.employment_type,
            "financial_goals": self.financial_goals,
            "marital_status": self.marital_status,
            "dependents": self.dependents,
            "monthly_income": self.monthly_income,
            "other_income": self.other_income,
            "fixed_expenses": self.fixed_expenses,
            "variable_expenses": self.variable_expenses,
            "existing_debt": self.existing_debt,
            "current_savings": self.current_savings,
            "emergency_fund": self.emergency_fund,
            "stocks": self.stocks,
            "mutual_funds": self.mutual_funds,
            "fixed_deposit": self.fixed_deposit,
            "gold": self.gold,
            "insurance": self.insurance,
            "other_investments": self.other_investments,
            "risk_tolerance": self.risk_tolerance,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
