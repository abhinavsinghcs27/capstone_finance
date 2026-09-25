import os
import json
import uuid
from typing import List, Dict, Any
from datetime import datetime

GOALS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "goals.json")


class GoalsService:
    @classmethod
    def _ensure_file(cls):
        os.makedirs(os.path.dirname(GOALS_FILE), exist_ok=True)
        if not os.path.exists(GOALS_FILE):
            default_data = cls._get_seed_data()
            with open(GOALS_FILE, "w", encoding="utf-8") as f:
                json.dump(default_data, f, indent=2)

    @classmethod
    def _get_seed_data(cls) -> Dict[str, List[Dict[str, Any]]]:
        current_year = datetime.now().year
        return {
            "demo@financeai.com": [
                {
                    "id": "goal-1",
                    "title": "Financial Independence & Early Retirement (FIRE)",
                    "category": "Retirement",
                    "target_amount": 35000000,  # 3.5 Crore
                    "current_amount": 950000,   # 9.5 Lakh
                    "target_year": current_year + 18,
                    "target_month": "December",
                    "priority": "High",
                    "monthly_sip": 30000,
                    "expected_return": 12.5,
                    "notes": "Corpus targeting 4% SWR for comfortable retirement."
                },
                {
                    "id": "goal-2",
                    "title": "Luxury 3BHK Home Down Payment",
                    "category": "Real Estate",
                    "target_amount": 3500000,   # 35 Lakh
                    "current_amount": 650000,   # 6.5 Lakh
                    "target_year": current_year + 4,
                    "target_month": "June",
                    "priority": "High",
                    "monthly_sip": 25000,
                    "expected_return": 11.0,
                    "notes": "20% down payment for prime residential apartment."
                },
                {
                    "id": "goal-3",
                    "title": "6-Month Bulletproof Emergency Shield",
                    "category": "Safety",
                    "target_amount": 600000,    # 6 Lakh
                    "current_amount": 300000,   # 3 Lakh
                    "target_year": current_year + 1,
                    "target_month": "October",
                    "priority": "Urgent",
                    "monthly_sip": 15000,
                    "expected_return": 7.2,
                    "notes": "Stored in high-yield liquid funds and arbitrage."
                },
                {
                    "id": "goal-4",
                    "title": "European Dream Vacation & Sabbatical",
                    "category": "Lifestyle",
                    "target_amount": 400000,    # 4 Lakh
                    "current_amount": 120000,   # 1.2 Lakh
                    "target_year": current_year + 2,
                    "target_month": "May",
                    "priority": "Medium",
                    "monthly_sip": 8000,
                    "expected_return": 9.5,
                    "notes": "14-day trip across Switzerland and Italy."
                }
            ]
        }

    @classmethod
    def _read_data(cls) -> Dict[str, List[Dict[str, Any]]]:
        cls._ensure_file()
        try:
            with open(GOALS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return cls._get_seed_data()

    @classmethod
    def _write_data(cls, data: Dict[str, List[Dict[str, Any]]]):
        cls._ensure_file()
        with open(GOALS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    @classmethod
    def get_goals(cls, email: str) -> List[Dict[str, Any]]:
        data = cls._read_data()
        clean_email = (email or "demo@financeai.com").strip().lower()
        if clean_email in data:
            return data[clean_email]
        # Return demo goals if new user has no custom goals yet
        return data.get("demo@financeai.com", [])

    @classmethod
    def save_goal(cls, email: str, goal: Dict[str, Any]) -> Dict[str, Any]:
        data = cls._read_data()
        clean_email = (email or "demo@financeai.com").strip().lower()
        user_goals = data.get(clean_email, [])

        goal_id = goal.get("id")
        if not goal_id:
            goal_id = f"goal-{uuid.uuid4().hex[:8]}"
            goal["id"] = goal_id
            user_goals.append(goal)
        else:
            updated = False
            for idx, g in enumerate(user_goals):
                if g.get("id") == goal_id:
                    user_goals[idx] = goal
                    updated = True
                    break
            if not updated:
                user_goals.append(goal)

        data[clean_email] = user_goals
        cls._write_data(data)
        return goal

    @classmethod
    def delete_goal(cls, email: str, goal_id: str) -> bool:
        data = cls._read_data()
        clean_email = (email or "demo@financeai.com").strip().lower()
        if clean_email not in data:
            return False

        orig_len = len(data[clean_email])
        data[clean_email] = [g for g in data[clean_email] if g.get("id") != goal_id]
        if len(data[clean_email]) < orig_len:
            cls._write_data(data)
            return True
        return False

    @classmethod
    def simulate_sip(
        cls,
        initial_investment: float,
        monthly_sip: float,
        annual_cagr: float,
        years: int,
        inflation_rate: float = 6.0
    ) -> Dict[str, Any]:
        """Calculates future wealth, inflation-adjusted corpus, and milestone trajectory."""
        years = max(1, min(50, int(years)))
        annual_cagr = max(0.1, float(annual_cagr))
        monthly_rate = (annual_cagr / 100.0) / 12.0
        monthly_inflation = (inflation_rate / 100.0) / 12.0
        months = years * 12

        trajectory = []
        running_corpus = float(initial_investment)
        total_invested = float(initial_investment)

        for m in range(1, months + 1):
            running_corpus = (running_corpus + monthly_sip) * (1.0 + monthly_rate)
            total_invested += monthly_sip

            if m % 12 == 0 or m == months:
                yr = m // 12
                # Inflation discounted real value
                real_corpus = running_corpus / ((1.0 + (inflation_rate / 100.0)) ** yr)
                trajectory.append({
                    "year": yr,
                    "total_invested": round(total_invested, 2),
                    "wealth_gained": round(running_corpus - total_invested, 2),
                    "future_corpus": round(running_corpus, 2),
                    "inflation_adjusted_value": round(real_corpus, 2)
                })

        wealth_gain = max(0.0, running_corpus - total_invested)
        real_value = running_corpus / ((1.0 + (inflation_rate / 100.0)) ** years)

        return {
            "initial_investment": initial_investment,
            "monthly_sip": monthly_sip,
            "annual_cagr": annual_cagr,
            "years": years,
            "inflation_rate": inflation_rate,
            "total_invested": round(total_invested, 2),
            "wealth_gain": round(wealth_gain, 2),
            "future_corpus": round(running_corpus, 2),
            "inflation_adjusted_value": round(real_value, 2),
            "wealth_multiplier": round(running_corpus / total_invested, 2) if total_invested > 0 else 1.0,
            "trajectory": trajectory
        }

    @classmethod
    def simulate_fire(
        cls,
        current_age: int,
        target_retirement_age: int,
        current_monthly_expenses: float,
        current_corpus: float = 0.0,
        pre_retirement_cagr: float = 12.0,
        post_retirement_cagr: float = 8.0,
        inflation_rate: float = 6.0,
        life_expectancy: int = 85,
        safe_withdrawal_rate: float = 4.0
    ) -> Dict[str, Any]:
        """Calculates FIRE (Financial Independence) target corpus, monthly SIP needed, and gap analysis."""
        current_age = max(18, min(80, int(current_age)))
        target_retirement_age = max(current_age + 1, min(85, int(target_retirement_age)))
        years_to_retire = target_retirement_age - current_age
        retirement_years = max(5, int(life_expectancy - target_retirement_age))

        # Future Monthly Expenses at Retirement (Inflation adjusted)
        inflation_factor = (1.0 + (inflation_rate / 100.0)) ** years_to_retire
        future_monthly_expense = current_monthly_expenses * inflation_factor
        future_annual_expense = future_monthly_expense * 12

        # Required Corpus at Retirement using SWR (e.g. 25x annual expenses at 4% SWR)
        target_corpus = future_annual_expense * (100.0 / safe_withdrawal_rate)

        # Future value of current corpus
        fv_current_corpus = current_corpus * ((1.0 + (pre_retirement_cagr / 100.0)) ** years_to_retire)
        corpus_shortfall = max(0.0, target_corpus - fv_current_corpus)

        # Required Monthly SIP to cover shortfall
        monthly_rate = (pre_retirement_cagr / 100.0) / 12.0
        months = years_to_retire * 12

        if monthly_rate > 0 and months > 0:
            # FV of annuity: S = PMT * [ ( (1+r)^n - 1 ) / r ] * (1+r)
            denom = (((1.0 + monthly_rate) ** months - 1.0) / monthly_rate) * (1.0 + monthly_rate)
            required_monthly_sip = corpus_shortfall / denom if denom > 0 else 0.0
        else:
            required_monthly_sip = corpus_shortfall / max(1, months)

        return {
            "current_age": current_age,
            "target_retirement_age": target_retirement_age,
            "years_to_retire": years_to_retire,
            "retirement_years": retirement_years,
            "current_monthly_expenses": current_monthly_expenses,
            "future_monthly_expenses": round(future_monthly_expense, 2),
            "future_annual_expenses": round(future_annual_expense, 2),
            "target_corpus": round(target_corpus, 2),
            "current_corpus_at_retirement": round(fv_current_corpus, 2),
            "corpus_shortfall": round(corpus_shortfall, 2),
            "required_monthly_sip": round(required_monthly_sip, 2),
            "safe_withdrawal_rate": safe_withdrawal_rate
        }
