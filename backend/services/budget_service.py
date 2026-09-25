import os
import json
from typing import List, Dict, Any
from services.transaction_service import TransactionService

BUDGETS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "budgets.json")

DEFAULT_CATEGORIES = [
    {"category": "Food", "default_limit": 15000},
    {"category": "Housing", "default_limit": 25000},
    {"category": "Shopping", "default_limit": 10000},
    {"category": "Utilities", "default_limit": 8000},
    {"category": "Transport", "default_limit": 6000},
    {"category": "Dining", "default_limit": 5000},
    {"category": "Entertainment", "default_limit": 4000},
    {"category": "Other", "default_limit": 5000},
]


class BudgetService:
    @classmethod
    def _ensure_file(cls):
        os.makedirs(os.path.dirname(BUDGETS_FILE), exist_ok=True)
        if not os.path.exists(BUDGETS_FILE):
            default_data = {
                "demo@financeai.com": {
                    "Food": 15000,
                    "Housing": 25000,
                    "Shopping": 10000,
                    "Utilities": 8000,
                    "Transport": 6000,
                    "Dining": 5000,
                    "Entertainment": 4000,
                    "Other": 5000,
                }
            }
            with open(BUDGETS_FILE, "w", encoding="utf-8") as f:
                json.dump(default_data, f, indent=2)

    @classmethod
    def _read_data(cls) -> Dict[str, Dict[str, float]]:
        cls._ensure_file()
        try:
            with open(BUDGETS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    @classmethod
    def _write_data(cls, data: Dict[str, Dict[str, float]]):
        cls._ensure_file()
        with open(BUDGETS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    @classmethod
    def get_budgets(cls, email: str) -> Dict[str, Any]:
        """Calculates actual spending per category from transactions and merges with budget limits."""
        clean_email = (email or "demo@financeai.com").strip().lower()
        all_budgets_data = cls._read_data()
        user_limits = all_budgets_data.get(clean_email)

        # If user has no custom limits set, initialize with default template
        if not user_limits:
            user_limits = {item["category"]: float(item["default_limit"]) for item in DEFAULT_CATEGORIES}

        # Fetch actual transactions for the user
        transactions = TransactionService.get_transactions(clean_email)

        # Compute category-wise actual spending for expenses
        category_spent: Dict[str, float] = {}
        for t in transactions:
            t_type = str(t.get("type", "")).lower().strip()
            if t_type in ["expense", "debit", "outflow"]:
                cat = str(t.get("category", "Other")).strip()
                try:
                    amt = abs(float(t.get("amount", 0)))
                except (ValueError, TypeError):
                    amt = 0.0
                category_spent[cat] = category_spent.get(cat, 0.0) + amt

        # Build list of budget items
        budgets_list = []
        all_categories = set(user_limits.keys()).union(set(category_spent.keys()))

        for cat in sorted(all_categories):
            limit = float(user_limits.get(cat, 5000))
            spent = round(float(category_spent.get(cat, 0.0)), 2)
            remaining = round(limit - spent, 2)
            pct = round((spent / limit) * 100, 1) if limit > 0 else 0.0

            budgets_list.append({
                "id": f"budget-{cat.lower().replace(' ', '-')}",
                "category": cat,
                "limit": limit,
                "spent": spent,
                "remaining": remaining,
                "percentage": min(pct, 100.0),
                "actual_percentage": pct,
                "over_budget": spent > limit
            })

        total_budget = sum(b["limit"] for b in budgets_list)
        total_spent = sum(b["spent"] for b in budgets_list)
        total_remaining = round(total_budget - total_spent, 2)

        return {
            "success": True,
            "budgets": budgets_list,
            "summary": {
                "total_budget": total_budget,
                "total_spent": total_spent,
                "total_remaining": total_remaining,
                "over_budget_count": sum(1 for b in budgets_list if b["over_budget"])
            }
        }

    @classmethod
    def save_budget(cls, email: str, category: str, limit: float) -> Dict[str, Any]:
        """Saves or updates a budget limit for a specific category."""
        clean_email = (email or "demo@financeai.com").strip().lower()
        category = str(category).strip()

        if not category:
            return {"success": False, "message": "Category is required"}

        try:
            limit = abs(float(limit))
        except (ValueError, TypeError):
            return {"success": False, "message": "Invalid limit amount"}

        data = cls._read_data()
        user_limits = data.get(clean_email, {})
        user_limits[category] = limit
        data[clean_email] = user_limits

        cls._write_data(data)
        return cls.get_budgets(clean_email)

    @classmethod
    def delete_budget(cls, email: str, category: str) -> Dict[str, Any]:
        """Removes a budget limit for a category."""
        clean_email = (email or "demo@financeai.com").strip().lower()
        category = str(category).strip()

        data = cls._read_data()
        user_limits = data.get(clean_email, {})
        if category in user_limits:
            del user_limits[category]
            data[clean_email] = user_limits
            cls._write_data(data)

        return cls.get_budgets(clean_email)
