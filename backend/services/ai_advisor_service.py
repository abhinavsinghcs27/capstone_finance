import os
import json
from groq import Groq
from dotenv import load_dotenv
from services.profile_service import ProfileService
from services.transaction_service import TransactionService

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


class AIAdvisorService:
    @classmethod
    def _get_client(cls):
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured in backend environment")
        return Groq(api_key=GROQ_API_KEY)

    @classmethod
    def _build_financial_context(cls, email: str) -> str:
        """Assembles user profile, evaluation metrics, and transaction history into a comprehensive context prompt."""
        profile_res = ProfileService.get_profile(email=email)
        user = profile_res.get("user") or {}
        eval_data = profile_res.get("evaluation") or {}
        transactions = TransactionService.get_transactions(email) if email else []

        def safe_float(val):
            try:
                return float(val or 0)
            except (ValueError, TypeError):
                return 0.0

        # Summarize transactions
        total_income = sum(safe_float(t.get("amount")) for t in transactions if str(t.get("type", "")).lower() in ["income", "credit"])
        total_expense = sum(safe_float(t.get("amount")) for t in transactions if str(t.get("type", "")).lower() in ["expense", "debit"])
        total_investment = sum(safe_float(t.get("amount")) for t in transactions if str(t.get("type", "")).lower() == "investment")

        category_spend = {}
        for t in transactions:
            if str(t.get("type", "")).lower() in ["expense", "debit"]:
                cat = t.get("category", "Other")
                category_spend[cat] = category_spend.get(cat, 0.0) + safe_float(t.get("amount"))

        recent_txns_sample = [
            f"- {t.get('date')}: {t.get('description')} ({t.get('type')}) - ₹{safe_float(t.get('amount')):.0f} [{t.get('category')}]"
            for t in transactions[:10]
        ]

        context = f"""
### User Profile:
- Name: {user.get('name', 'User')}
- Age: {user.get('age', 28)}
- Employment: {user.get('employment_type', 'salaried')}
- Financial Goals: {user.get('financial_goals', 'wealth creation')}
- Risk Tolerance: {user.get('risk_tolerance', 'Moderate')}
- Dependents: {user.get('dependents', 0)}
- Monthly Income: ₹{safe_float(user.get('monthly_income')):,f}
- Other Inflows: ₹{safe_float(user.get('other_income')):,f}
- Fixed Expenses: ₹{safe_float(user.get('fixed_expenses')):,f}
- Variable Expenses: ₹{safe_float(user.get('variable_expenses')):,f}
- Existing Debt/EMIs: ₹{safe_float(user.get('existing_debt')):,f}
- Liquid Savings: ₹{safe_float(user.get('current_savings')):,f}
- Emergency Fund: ₹{safe_float(user.get('emergency_fund')):,f}
- Mutual Funds: ₹{safe_float(user.get('mutual_funds')):,f}
- Stocks: ₹{safe_float(user.get('stocks')):,f}
- Insurance: {user.get('insurance', 'Standard')}

### Financial Health Evaluation:
- Health Score: {eval_data.get('health_score', {}).get('score', 'N/A')}/100 ({eval_data.get('health_score', {}).get('grade', 'N/A')})
- Savings Ratio: {eval_data.get('ratios', {}).get('savings_ratio', 'N/A')}%
- Debt-to-Income Ratio: {eval_data.get('ratios', {}).get('debt_to_income_ratio', 'N/A')}%
- Summary: {eval_data.get('summary', 'N/A')}

### Transaction Ledger Activity ({len(transactions)} transactions):
- Recorded Inflow: ₹{total_income:,.2f}
- Recorded Outflow: ₹{total_expense:,.2f}
- Recorded Investments: ₹{total_investment:,.2f}
- Category Outflows: {json.dumps(category_spend)}
- Recent Transactions Sample:
{chr(10).join(recent_txns_sample) if recent_txns_sample else 'No transactions recorded yet.'}
"""
        return context.strip()

    @classmethod
    def _get_fallback_insights(cls, email: str) -> dict:
        profile_res = ProfileService.get_profile(email=email)
        user = profile_res.get("user") or {}
        eval_data = profile_res.get("evaluation") or {}
        score = eval_data.get("health_score", {}).get("score", 78)
        
        return {
            "summary": f"Your financial health score is {score}/100. You have a solid cash flow margin with regular disciplined savings.",
            "health_status": "Good" if score >= 70 else "Needs Attention",
            "insights": [
                {
                    "id": "1",
                    "title": "Boost Equity SIP Allocation",
                    "category": "Investments",
                    "type": "opportunity",
                    "impact": "High",
                    "description": "Increase monthly index fund/SIP allocation by ₹5,000 to maximize long-term compound wealth.",
                    "estimated_monthly_impact": "+₹5,000"
                },
                {
                    "id": "2",
                    "title": "Emergency Fund Milestone",
                    "category": "Savings",
                    "type": "achievement",
                    "impact": "Medium",
                    "description": "Your current liquid reserves are in a healthy zone covering recurring monthly obligations.",
                    "estimated_monthly_impact": None
                },
                {
                    "id": "3",
                    "title": "Trim Discretionary Variable Spend",
                    "category": "Budgeting",
                    "type": "warning",
                    "impact": "Medium",
                    "description": "Optimize dining and subscription expenses to free up an additional ₹3,000/mo for capital investments.",
                    "estimated_monthly_impact": "+₹3,000"
                }
            ],
            "action_items": [
                "Automate monthly SIP transfers on salary credit day",
                "Review active subscriptions and utility bills",
                "Maintain 6 months of fixed expenses in high-yield liquid funds"
            ]
        }

    @classmethod
    def generate_insights(cls, email: str) -> dict:
        """Generates AI-powered structured financial insights and actionable recommendations."""
        try:
            client = cls._get_client()
            context = cls._build_financial_context(email)

            system_prompt = """You are FinanceAI, an elite Certified Financial Planner (CFP) and wealth management strategist.
Analyze the user's financial profile and transaction history to produce practical, high-impact, and mathematically sound financial insights.

Format your output as a strict JSON object with this structure:
{
  "summary": "Short 2-sentence executive summary of their financial posture",
  "health_status": "Excellent" | "Good" | "Needs Attention" | "Critical",
  "insights": [
    {
      "id": "1",
      "title": "Short Title",
      "category": "Budgeting" | "Savings" | "Debt" | "Investments" | "Risk",
      "type": "opportunity" | "warning" | "achievement",
      "impact": "High" | "Medium" | "Low",
      "description": "2-3 sentences explaining the observation and specific action to take.",
      "estimated_monthly_impact": "₹5,000" or null
    }
  ],
  "action_items": [
    "Action item 1",
    "Action item 2",
    "Action item 3"
  ]
}

Only return valid JSON without markdown fences."""

            user_prompt = f"Here is the user's financial context:\n\n{context}\n\nPlease analyze and generate personalized insights."

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1500,
            )

            raw_content = response.choices[0].message.content.strip()

            # Clean JSON if fences present
            if raw_content.startswith("```"):
                raw_content = raw_content.split("```")[1]
                if raw_content.startswith("json"):
                    raw_content = raw_content[4:]
                raw_content = raw_content.strip()

            data = json.loads(raw_content)
            return {
                "success": True,
                "data": data
            }

        except Exception as e:
            print(f"[AI Advisor] Groq insights error: {e}, falling back to rule-based engine.")
            return {
                "success": True,
                "data": cls._get_fallback_insights(email),
                "is_fallback": True,
                "error": str(e)
            }

    @classmethod
    def chat(cls, email: str, user_message: str, conversation_history: list = None) -> dict:
        """Conversational financial advisor powered by Groq LLM with live financial context."""
        try:
            client = cls._get_client()
            context = cls._build_financial_context(email)

            system_prompt = f"""You are FinanceAI Advisor, an empathetic, highly knowledgeable, and data-driven personal financial planner.
You have real-time access to the user's finances:
{context}

Guidelines:
1. Always reference user specific numbers when relevant (e.g., their actual monthly income, rent/fixed expenses, current savings).
2. Keep answers structured, friendly, concise, and actionable using markdown formatting.
3. For investments, emphasize asset allocation (equity, debt, gold) and emergency fund security before aggressive speculation.
4. If the user asks about affordability or budget decisions, calculate the impact on their savings and cash flow.
5. Provide amounts in Indian Rupees (₹) with commas.
"""

            messages = [{"role": "system", "content": system_prompt}]

            if conversation_history and isinstance(conversation_history, list):
                for msg in conversation_history[-8:]:  # keep last 8 turns
                    if msg.get("role") in ["user", "assistant"] and msg.get("content"):
                        messages.append({
                            "role": msg["role"],
                            "content": str(msg["content"])
                        })

            messages.append({"role": "user", "content": user_message})

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.5,
                max_tokens=1000,
            )

            reply = response.choices[0].message.content.strip()
            return {
                "success": True,
                "reply": reply
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"AI Chat error: {str(e)}"
            }
