import os
import sys

# Ensure backend directory is in path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.auth_service import AuthService
from services.profile_service import ProfileService
from services.transaction_service import TransactionService

DEMO_EMAIL = "demo@financeai.com"
DEMO_PASSWORD = "password123"
DEMO_NAME = "Aditya Sharma"


def seed_demo_user():
    print(f"--- Seeding Demo User: {DEMO_EMAIL} ---")

    # 1. Register or update Auth Account
    existing = AuthService.find_user_by_email(DEMO_EMAIL)
    if not existing:
        res = AuthService.register_user(
            name=DEMO_NAME,
            email=DEMO_EMAIL,
            password=DEMO_PASSWORD
        )
        print("Auth account created:", res.get("message"))
    else:
        print("Auth account already exists.")

    # 2. Seed Complete Financial Profile
    profile_data = {
        "email": DEMO_EMAIL,
        "name": DEMO_NAME,
        "age": 29,
        "employmentType": "salaried",
        "financialGoals": "wealth",
        "maritalStatus": "married",
        "dependents": 1,
        "monthlyIncome": 125000,
        "otherIncome": 15000,
        "fixedExpenses": 38000,
        "variableExpenses": 24500,
        "existingDebt": 16500,
        "currentSavings": 185000,
        "emergencyFund": 120000,
        "stocks": 220000,
        "mutualFunds": 350000,
        "fixedDeposit": 100000,
        "gold": 85000,
        "insurance": "Comprehensive Term & Health (1 Cr)",
        "otherInvestments": 50000,
        "riskTolerance": "Moderate"
    }

    prof_res = ProfileService.save_or_update_profile(profile_data)
    print("Financial profile saved:", prof_res.get("success"), "| Health Score:", prof_res.get("evaluation", {}).get("health_score"))

    # 3. Seed Realistic Transactions
    demo_transactions = [
        {
            "date": "2026-09-01",
            "description": "INFOSYS TECH - SALARY CREDIT",
            "amount": 125000.0,
            "type": "income",
            "category": "Salary",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-03",
            "description": "APARTMENT RENT TRANSFER",
            "amount": 28000.0,
            "type": "expense",
            "category": "Housing",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-05",
            "description": "HDFC BANK CAR LOAN AUTO-DEBIT",
            "amount": 16500.0,
            "type": "expense",
            "category": "Fixed Expense",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-08",
            "description": "ZERODHA BROKING - NIFTY 50 SIP",
            "amount": 25000.0,
            "type": "investment",
            "category": "Investment",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-10",
            "description": "PARAG PARIKH FLEXI CAP FUND SIP",
            "amount": 15000.0,
            "type": "investment",
            "category": "Investment",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-12",
            "description": "FREELANCE TECH ADVISORY PAYMENT",
            "amount": 15000.0,
            "type": "income",
            "category": "Other Inflow",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-14",
            "description": "BLINKIT GROCERY & HOUSEHOLD",
            "amount": 2450.0,
            "type": "expense",
            "category": "Food",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-16",
            "description": "ELECTRICITY & AIRTEL FIBER BILL",
            "amount": 3500.0,
            "type": "expense",
            "category": "Utilities",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-18",
            "description": "SHELL FUEL STATION - PETROL",
            "amount": 4200.0,
            "type": "expense",
            "category": "Transport",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-20",
            "description": "SWIGGY & DINING OUT",
            "amount": 2180.0,
            "type": "expense",
            "category": "Dining",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-21",
            "description": "AMAZON INDIA - ELECTRONICS & BOOKS",
            "amount": 5600.0,
            "type": "expense",
            "category": "Shopping",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-22",
            "description": "NETFLIX & SPOTIFY PREMIUM",
            "amount": 1199.0,
            "type": "expense",
            "category": "Utilities",
            "source": "statement_upload"
        },
        {
            "date": "2026-09-23",
            "description": "TATA 1MG PHARMACY & WELLNESS",
            "amount": 1450.0,
            "type": "expense",
            "category": "Other",
            "source": "statement_upload"
        }
    ]

    txn_res = TransactionService.save_bulk_transactions(DEMO_EMAIL, demo_transactions)
    print("Transactions seeded:", txn_res.get("message"))

    print("\n[SUCCESS] Demo user successfully populated!")
    print(f"Email: {DEMO_EMAIL}")
    print(f"Password: {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed_demo_user()
