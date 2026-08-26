class FinancialEngine:
    """Core analysis engine for personal financial evaluation."""

    def __init__(self, profile_data: dict):
        self.data = profile_data
        self.total_income = self.data.get("monthly_income", 0) + self.data.get("other_income", 0)
        self.total_expenses = self.data.get("fixed_expenses", 0) + self.data.get("variable_expenses", 0)
        self.monthly_savings = max(0, self.total_income - self.total_expenses)

    def calculate_ratios(self) -> dict:
        """Compute DTI, Savings rate, and emergency runway (in months)."""
        if self.total_income:
            dti = (self.data.get("existing_debt", 0) / self.total_income) * 100
            savings_rate = (self.monthly_savings / self.total_income) * 100
        else:
            dti = 0.0
            savings_rate = 0.0

        if self.total_expenses:
            emergency_months = self.data.get("emergency_fund", 0) / self.total_expenses
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
        stocks = self.data.get("stock", 0) + self.data.get("stocks", 0)
        mf = self.data.get("mutual_fund", 0) + self.data.get("mutual_funds", 0)
        fd = self.data.get("fixed_deposit", 0)
        gold = self.data.get("gold", 0)
        others = self.data.get("other_saving", 0) + self.data.get("current_savings", 0)
        savings = self.data.get("other_investment", 0) + self.data.get("other_investments", 0)

        total_assets = stocks + mf + fd + gold + others + savings
        net_worth = total_assets - self.data.get("existing_debt", 0)

        if total_assets:
            equity = round((stocks + mf) / total_assets * 100, 1)
            fixed_income = round(fd / total_assets * 100, 1)
            gold_percentage = round(gold / total_assets * 100, 1)
            cash = round(savings / total_assets * 100, 1)
        else:
            equity = 0.0
            fixed_income = 0.0
            gold_percentage = 0.0
            cash = 0.0

        return {
            "net_worth": net_worth,
            "total_assets": total_assets,
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
                "message": "Your emergency fund covers less than 3 months of expenses. Prioritize liquid savings."
            })
        if ratios["dti_ratio"] > 40:
            insights.append({
                "type": "ALERT",
                "message": "High Debt-to-Income ratio detected. Consider debt consolidation or aggressive debt payoff."
            })
        if self.data.get("dependents", 0) > 0 and not self.data.get("insurance"):
            insights.append({
                "type": "RISK",
                "message": "You have dependents but no recorded insurance policy. Consider adequate term life cover."
            })

        return insights

    def run_full_evaluation(self) -> dict:
        """Full pipeline execution returning all aggregated metrics."""
        return {
            "ratios": self.calculate_ratios(),
            "health_score": self.compute_health_score(),
            "portfolio": self.analyze_portfolio(),
            "recommendations": self.generate_recommendations()
        }