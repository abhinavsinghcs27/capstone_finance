from financial_engine import FinancialEngine


profile_data = {
    "monthly_income": 50000,
    "other_income": 5000,
    "fixed_expenses": 15000,
    "variable_expenses": 10000,
    "existing_debt": 5000,
    "emergency_fund": 100000,
    "stock": 50000,
    "mutual_fund": 40000,
    "fixed_deposit": 30000,
    "gold": 10000,
    "other_saving": 20000,
    "other_investment": 5000,
    "dependents": 2,
    "insurance": True
}


engine = FinancialEngine(profile_data)

result = engine.run_full_evaluation()

print(result)