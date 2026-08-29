def _to_num(val):
    if val is None or val == "":
        return 0.0
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


class FinancialEngine:
    """Core analysis engine for personal financial evaluation."""

    def __init__(self, profile_data: dict):
        self.data = profile_data or {}

        def get_val(*keys, default=0.0):
            for k in keys:
                if k in self.data and self.data[k] is not None:
                    return _to_num(self.data[k])
            return default

        self.monthly_income = get_val("monthly_income", "monthlyIncome")
        self.other_income = get_val("other_income", "otherIncome")
        self.fixed_expenses = get_val("fixed_expenses", "fixedExpenses")
        self.variable_expenses = get_val("variable_expenses", "variableExpenses")
        self.existing_debt = get_val("existing_debt", "existingDebt", "debt")
        self.emergency_fund = get_val("emergency_fund", "emergencyFund")
        self.current_savings = get_val("current_savings", "currentSavings", "saving", "savings")
        self.stocks = get_val("stocks", "stock")
        self.mutual_funds = get_val("mutual_funds", "mutual_fund", "mutualFunds")
        self.fixed_deposit = get_val("fixed_deposit", "fixedDeposit", "fd")
        self.gold = get_val("gold")
        self.other_investments = get_val("other_investments", "otherInvestments", "other_investment")
        self.dependents = int(get_val("dependents", default=0))
        self.insurance = str(self.data.get("insurance", "")).strip()

        self.total_income = self.monthly_income + self.other_income
        self.total_expenses = self.fixed_expenses + self.variable_expenses
        self.monthly_savings = max(0.0, self.total_income - self.total_expenses)

    def calculate_ratios(self) -> dict:
        """Compute DTI, Savings rate, and emergency runway (in months)."""
        if self.total_income > 0:
            dti = (self.existing_debt / self.total_income) * 100
            savings_rate = (self.monthly_savings / self.total_income) * 100
        else:
            dti = 0.0
            savings_rate = 0.0

        if self.total_expenses > 0:
            emergency_months = self.emergency_fund / self.total_expenses
        else:
            emergency_months = 0.0

        return {
            "dti_ratio": round(dti, 1),
            "debt_to_income": round(dti, 1),
            "savings_rate": round(savings_rate, 1),
            "saving_rate": round(savings_rate, 1),
            "emergency_runway_months": round(emergency_months, 1),
        }

    def compute_health_score(self) -> dict:
        """Compute overall financial health score (0-100) with category grade."""
        score = 100
        ratios = self.calculate_ratios()

        if ratios["dti_ratio"] > 40:
            score -= 25
        elif ratios["dti_ratio"] > 25:
            score -= 10

        if ratios["emergency_runway_months"] < 3:
            score -= 20
        elif ratios["emergency_runway_months"] < 6:
            score -= 5

        if ratios["savings_rate"] < 10:
            score -= 25
        elif ratios["savings_rate"] < 20:
            score -= 10

        score = max(0, min(100, score))

        if score >= 80:
            grade = "Excellent"
        elif score >= 60:
            grade = "Good"
        else:
            grade = "Needs Improvement"

        return {
            "score": score,
            "grade": grade
        }

    def analyze_portfolio(self) -> dict:
        """Calculate net worth and asset breakdown percentage."""
        total_assets = (
            self.stocks +
            self.mutual_funds +
            self.fixed_deposit +
            self.gold +
            self.current_savings +
            self.other_investments
        )
        net_worth = total_assets - self.existing_debt

        if total_assets > 0:
            equity = round((self.stocks + self.mutual_funds) / total_assets * 100, 1)
            fixed_income = round(self.fixed_deposit / total_assets * 100, 1)
            gold_percentage = round(self.gold / total_assets * 100, 1)
            cash = round((self.current_savings + self.other_investments) / total_assets * 100, 1)
        else:
            equity = 0.0
            fixed_income = 0.0
            gold_percentage = 0.0
            cash = 0.0

        return {
            "net_worth": round(net_worth, 2),
            "total_assets": round(total_assets, 2),
            "total_debt": round(self.existing_debt, 2),
            "distribution": {
                "equity": equity,
                "fixed_income": fixed_income,
                "gold": gold_percentage,
                "cash": cash
            }
        }

    def generate_recommendations(self) -> list:
        """Generates contextual insights based on profile findings."""
        insights = []
        ratios = self.calculate_ratios()

        if ratios["emergency_runway_months"] < 3:
            insights.append({
                "type": "WARNING",
                "category": "Emergency Fund",
                "message": "Your emergency fund covers less than 3 months of expenses. Prioritize liquid savings."
            })
        elif ratios["emergency_runway_months"] >= 6:
            insights.append({
                "type": "SUCCESS",
                "category": "Emergency Fund",
                "message": f"Healthy emergency runway of {ratios['emergency_runway_months']} months."
            })

        if ratios["dti_ratio"] > 40:
            insights.append({
                "type": "ALERT",
                "category": "Debt",
                "message": "High Debt-to-Income ratio detected. Consider debt consolidation or aggressive debt payoff."
            })

        if ratios["savings_rate"] >= 20:
            insights.append({
                "type": "SUCCESS",
                "category": "Savings",
                "message": f"Great savings discipline! You are saving {ratios['savings_rate']}% of your monthly income."
            })
        elif ratios["savings_rate"] < 10:
            insights.append({
                "type": "WARNING",
                "category": "Savings",
                "message": "Your savings rate is below 10%. Review fixed and variable discretionary spending."
            })

        has_insurance = bool(self.insurance and self.insurance.lower() not in ["", "no", "none", "false", "0"])
        if self.dependents > 0 and not has_insurance:
            insights.append({
                "type": "RISK",
                "category": "Insurance",
                "message": "You have dependents but no recorded insurance policy. Consider adequate term life cover."
            })

        return insights

    def run_full_evaluation(self) -> dict:
        """Full pipeline execution returning all aggregated metrics."""
        return {
            "summary": {
                "total_income": round(self.total_income, 2),
                "total_expenses": round(self.total_expenses, 2),
                "monthly_savings": round(self.monthly_savings, 2),
            },
            "ratios": self.calculate_ratios(),
            "health_score": self.compute_health_score(),
            "portfolio": self.analyze_portfolio(),
            "recommendations": self.generate_recommendations()
        }