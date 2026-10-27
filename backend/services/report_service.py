import os
import json
from datetime import datetime
from typing import Dict, Any, List
from engines.financial_engine import FinancialEngine
from services.profile_service import ProfileService
from services.transaction_service import TransactionService
from services.budget_service import BudgetService
from services.goals_service import GoalsService


class ReportService:
    """Comprehensive Financial Health Report and Audit Generator."""

    @classmethod
    def generate_report_data(cls, email: str = "") -> Dict[str, Any]:
        """Compiles complete financial audit and diagnostic metrics for a user."""
        clean_email = (email or "").strip().lower()
        profile_res = ProfileService.get_profile(clean_email if clean_email else None)
        user_data = profile_res.get("user") or {}

        # 1. Financial Engine Evaluation
        engine = FinancialEngine(user_data)
        ratios = engine.calculate_ratios()
        health_eval = engine.compute_health_score()
        portfolio_eval = engine.analyze_portfolio()
        recommendations = engine.generate_recommendations()

        # 2. Income & Expense Flow
        monthly_income = engine.total_income
        fixed_expenses = engine.fixed_expenses
        var_expenses = engine.variable_expenses
        debt_emi = engine.existing_debt
        total_outflow = fixed_expenses + var_expenses + debt_emi
        net_cash_flow = monthly_income - total_outflow
        savings_rate = ratios.get("savings_rate", 0.0)
        dti_ratio = ratios.get("dti_ratio", 0.0)
        emergency_runway = ratios.get("emergency_runway_months", 0.0)

        # 3. Budgets & Spend Adherence
        budget_res = BudgetService.get_budgets(clean_email)
        budgets = budget_res.get("budgets", [])
        budget_summary = budget_res.get("summary", {})
        over_budget_items = [b for b in budgets if b.get("over_budget")]

        # 4. Goals & Milestones
        goals = GoalsService.get_goals(clean_email)
        total_goal_target = sum(g.get("target_amount", 0) for g in goals)
        total_goal_saved = sum(g.get("current_amount", 0) for g in goals)
        goal_completion_pct = round((total_goal_saved / total_goal_target * 100), 1) if total_goal_target > 0 else 0.0

        # 5. Transactions Analytics
        txns = TransactionService.get_transactions(clean_email)
        total_txns_count = len(txns)
        expense_txns = [t for t in txns if str(t.get("type", "")).lower() in ["expense", "debit", "outflow"]]
        recent_txns = txns[:8]

        # 6. Granular Pillar Scoring (0-100 total)
        # Pillar 1: Emergency & Liquidity (Max 25 pts)
        if emergency_runway >= 6.0:
            pillar_liquidity = 25
            liquidity_status = "Optimal (6+ Months Buffer)"
        elif emergency_runway >= 3.0:
            pillar_liquidity = 18
            liquidity_status = "Moderate (3-6 Months Buffer)"
        elif emergency_runway >= 1.0:
            pillar_liquidity = 10
            liquidity_status = "Low (<3 Months Buffer)"
        else:
            pillar_liquidity = 4
            liquidity_status = "Critical (Underfunded Reserve)"

        # Pillar 2: Debt & Solvency (Max 25 pts)
        if dti_ratio <= 15.0:
            pillar_debt = 25
            debt_status = "Excellent (Low Debt Load)"
        elif dti_ratio <= 30.0:
            pillar_debt = 20
            debt_status = "Healthy (Manageable Leverage)"
        elif dti_ratio <= 45.0:
            pillar_debt = 10
            debt_status = "Caution (High Debt Service)"
        else:
            pillar_debt = 3
            debt_status = "High Risk (DTI > 45%)"

        # Pillar 3: Savings Velocity (Max 25 pts)
        if savings_rate >= 35.0:
            pillar_savings = 25
            savings_status = "Elite (>35% Net Savings)"
        elif savings_rate >= 20.0:
            pillar_savings = 20
            savings_status = "Good (20-35% Net Savings)"
        elif savings_rate >= 10.0:
            pillar_savings = 12
            savings_status = "Average (10-20% Net Savings)"
        else:
            pillar_savings = 5
            savings_status = "Deficit / High Burn (<10%)"

        # Pillar 4: Budget Discipline (Max 25 pts)
        if len(budgets) > 0:
            adherence_ratio = (len(budgets) - len(over_budget_items)) / len(budgets)
            pillar_budget = round(adherence_ratio * 25)
            budget_status = f"{len(budgets) - len(over_budget_items)}/{len(budgets)} Categories Under Limit"
        else:
            pillar_budget = 20
            budget_status = "Baseline Discipline"

        audit_score = pillar_liquidity + pillar_debt + pillar_savings + pillar_budget
        audit_score = max(5, min(100, audit_score))

        if audit_score >= 85:
            audit_grade = "A+"
            executive_verdict = "Exceptional Financial Stability & Compounding Trajectory"
        elif audit_score >= 70:
            audit_grade = "A"
            executive_verdict = "Strong Financial Health with Minor Optimization Opportunities"
        elif audit_score >= 55:
            audit_grade = "B"
            executive_verdict = "Moderate Financial Health - Requires Targeted Budgetary & Reserve Tuning"
        else:
            audit_grade = "C"
            executive_verdict = "Vulnerable Financial Position - Urgent Liquidity & Debt Restructuring Required"

        # 7. Action Items Matrix
        action_matrix = []
        if emergency_runway < 6.0:
            action_matrix.append({
                "urgency": "High",
                "timeframe": "Immediate (30 Days)",
                "category": "Liquidity",
                "action": f"Expand Emergency Fund from {emergency_runway:.1f} months to at least 6 months ({round(total_outflow * 6):,} INR)."
            })
        if dti_ratio > 30.0:
            action_matrix.append({
                "urgency": "High",
                "timeframe": "Next 90 Days",
                "category": "Debt Reduction",
                "action": f"Accelerate high-interest debt repayment to reduce DTI from {dti_ratio:.1f}% down below 25%."
            })
        if over_budget_items:
            over_cats = ", ".join([b['category'] for b in over_budget_items[:3]])
            action_matrix.append({
                "urgency": "Medium",
                "timeframe": "Current Month",
                "category": "Budget Control",
                "action": f"Implement spending caps on over-budget categories: {over_cats}."
            })
        if savings_rate >= 20.0 and portfolio_eval.get("total_assets", 0) > 0:
            action_matrix.append({
                "urgency": "Low",
                "timeframe": "Long Term",
                "category": "Wealth Building",
                "action": "Automate monthly SIP escalations by 10% annually to accelerate FIRE trajectory."
            })

        report_timestamp = datetime.now().strftime("%B %d, %Y - %I:%M %p")

        return {
            "success": True,
            "report_meta": {
                "generated_at": report_timestamp,
                "report_id": f"REP-{datetime.now().strftime('%Y%m%d')}-{abs(hash(clean_email)) % 10000:04d}",
                "user_name": user_data.get("name") or "Valued Investor",
                "email": clean_email or user_data.get("email") or "demo@financeai.com",
                "risk_tolerance": user_data.get("risk_tolerance") or "Moderate",
                "age": user_data.get("age") or "N/A"
            },
            "audit_score": {
                "overall_score": audit_score,
                "grade": audit_grade,
                "verdict": executive_verdict,
                "pillars": [
                    {
                        "name": "Emergency Reserve & Liquidity",
                        "score": pillar_liquidity,
                        "max_score": 25,
                        "status": liquidity_status,
                        "metric": f"{emergency_runway:.1f} Months Runway"
                    },
                    {
                        "name": "Debt-to-Income Solvency",
                        "score": pillar_debt,
                        "max_score": 25,
                        "status": debt_status,
                        "metric": f"{dti_ratio:.1f}% DTI Ratio"
                    },
                    {
                        "name": "Savings & Cashflow Velocity",
                        "score": pillar_savings,
                        "max_score": 25,
                        "status": savings_status,
                        "metric": f"{savings_rate:.1f}% Savings Rate"
                    },
                    {
                        "name": "Budget Compliance & Control",
                        "score": pillar_budget,
                        "max_score": 25,
                        "status": budget_status,
                        "metric": f"{len(over_budget_items)} Overruns"
                    }
                ]
            },
            "cash_flow": {
                "monthly_income": monthly_income,
                "fixed_expenses": fixed_expenses,
                "variable_expenses": var_expenses,
                "debt_emi": debt_emi,
                "total_outflow": total_outflow,
                "net_cash_flow": net_cash_flow,
                "savings_rate": savings_rate,
                "dti_ratio": dti_ratio,
                "emergency_runway": emergency_runway
            },
            "balance_sheet": {
                "total_net_worth": portfolio_eval.get("total_assets", 0) - (debt_emi * 12),
                "total_assets": portfolio_eval.get("total_assets", 0),
                "liquid_reserves": engine.emergency_fund + engine.current_savings,
                "investments": {
                    "stocks": engine.stocks,
                    "mutual_funds": engine.mutual_funds,
                    "fixed_deposit": engine.fixed_deposit,
                    "gold": engine.gold,
                    "other": engine.other_investments
                },
                "asset_allocation": portfolio_eval.get("breakdown_percent", {})
            },
            "budget_analysis": {
                "total_budget": budget_summary.get("total_budget", 0),
                "total_spent": budget_summary.get("total_spent", 0),
                "total_remaining": budget_summary.get("total_remaining", 0),
                "over_budget_count": len(over_budget_items),
                "categories": budgets
            },
            "goals_trajectory": {
                "total_goals_count": len(goals),
                "total_target_amount": total_goal_target,
                "total_saved_amount": total_goal_saved,
                "completion_percentage": goal_completion_pct,
                "goals_list": goals
            },
            "recent_activity": {
                "total_ledger_transactions": total_txns_count,
                "recent_sample": recent_txns
            },
            "action_matrix": action_matrix,
            "ai_recommendations": recommendations
        }

    @classmethod
    def generate_printable_html(cls, email: str = "") -> str:
        """Renders a self-contained, publication-grade printable HTML report."""
        data = cls.generate_report_data(email)
        meta = data["report_meta"]
        score = data["audit_score"]
        cashflow = data["cash_flow"]
        balance = data["balance_sheet"]
        budgets = data["budget_analysis"]
        goals = data["goals_trajectory"]
        actions = data["action_matrix"]

        def fmt_inr(val):
            return f"₹{int(val):,}"

        pillars_html = "".join([
            f"""
            <div class="pillar-card">
                <div class="pillar-header">
                    <span class="pillar-title">{p['name']}</span>
                    <span class="pillar-score">{p['score']}/{p['max_score']} pts</span>
                </div>
                <div class="pillar-bar-bg">
                    <div class="pillar-bar-fill" style="width: {(p['score']/p['max_score'])*100}%;"></div>
                </div>
                <div class="pillar-footer">
                    <span>{p['metric']}</span>
                    <strong>{p['status']}</strong>
                </div>
            </div>
            """ for p in score["pillars"]
        ])

        budget_rows_html = "".join([
            f"""
            <tr>
                <td><strong>{b['category']}</strong></td>
                <td>{fmt_inr(b['limit'])}</td>
                <td>{fmt_inr(b['spent'])}</td>
                <td style="color: {'#dc2626' if b.get('over_budget') else '#16a34a'}; font-weight: bold;">
                    {fmt_inr(b['remaining'])} ({b.get('actual_percentage', 0)}%)
                </td>
            </tr>
            """ for b in budgets["categories"][:6]
        ])

        goals_rows_html = "".join([
            f"""
            <tr>
                <td><strong>{g.get('title', 'Goal')}</strong></td>
                <td>{g.get('category', 'General')}</td>
                <td>{fmt_inr(g.get('target_amount', 0))}</td>
                <td>{fmt_inr(g.get('current_amount', 0))}</td>
                <td><strong>Target: {g.get('target_month', '')} {g.get('target_year', '')}</strong></td>
            </tr>
            """ for g in goals["goals_list"][:5]
        ])

        actions_html = "".join([
            f"""
            <li class="action-item">
                <span class="badge {a['urgency'].lower()}">{a['urgency']} Urgency</span>
                <strong>{a['timeframe']} — {a['category']}:</strong> {a['action']}
            </li>
            """ for a in actions
        ])

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Health Audit Report - {meta['user_name']}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            line-height: 1.5;
            padding: 30px 20px;
        }}
        
        .container {{
            max-width: 960px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 40px 48px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }}

        .header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 24px;
            margin-bottom: 30px;
        }}

        .logo-title {{
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .logo-badge {{
            background: #10b981;
            color: white;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }}

        .meta-info {{
            text-align: right;
            font-size: 12px;
            color: #64748b;
        }}

        .meta-info strong {{
            color: #0f172a;
            display: block;
            font-size: 13px;
        }}

        .scorecard {{
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            border-radius: 14px;
            padding: 24px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }}

        .score-dial {{
            display: flex;
            align-items: center;
            gap: 20px;
        }}

        .score-circle {{
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: #10b981;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 800;
            box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
        }}

        .score-text h2 {{
            font-size: 20px;
            font-weight: 700;
        }}

        .score-text p {{
            font-size: 13px;
            color: #94a3b8;
            margin-top: 4px;
        }}

        .grade-badge {{
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 8px 18px;
            border-radius: 10px;
            text-align: center;
        }}

        .grade-badge .grade {{
            font-size: 26px;
            font-weight: 800;
            color: #34d399;
        }}

        .section-title {{
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-left: 4px solid #10b981;
            padding-left: 10px;
        }}

        .pillars-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 30px;
        }}

        .pillar-card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px;
        }}

        .pillar-header {{
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
        }}

        .pillar-score {{
            color: #10b981;
            font-weight: 700;
        }}

        .pillar-bar-bg {{
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
        }}

        .pillar-bar-fill {{
            height: 100%;
            background: #10b981;
            border-radius: 4px;
        }}

        .pillar-footer {{
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
        }}

        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 30px;
        }}

        .stat-box {{
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
        }}

        .stat-box span {{
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: 600;
        }}

        .stat-box p {{
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 30px;
        }}

        th, td {{
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }}

        th {{
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
        }}

        .action-list {{
            list-style: none;
            margin-bottom: 30px;
        }}

        .action-item {{
            background: #f8fafc;
            border-left: 3px solid #3b82f6;
            padding: 12px 14px;
            margin-bottom: 10px;
            border-radius: 0 8px 8px 0;
            font-size: 13px;
        }}

        .badge {{
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
            margin-right: 6px;
        }}

        .badge.high {{ background: #fee2e2; color: #dc2626; }}
        .badge.medium {{ background: #fef3c7; color: #d97706; }}
        .badge.low {{ background: #e0f2fe; color: #0284c7; }}

        .footer {{
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
        }}

        .no-print-bar {{
            background: #0f172a;
            color: white;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 12px;
            margin-bottom: 24px;
        }}

        .print-btn {{
            background: #10b981;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
        }}

        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            .no-print-bar {{
                display: none !important;
            }}
            .container {{
                box-shadow: none;
                border: none;
                padding: 0;
            }}
            .scorecard {{
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Print Action Bar (Hidden when printed) -->
        <div class="no-print-bar">
            <span>📄 <strong>Financial Health Audit Ready</strong> — Print or Save to PDF for your records.</span>
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <!-- Header -->
        <div class="header">
            <div>
                <div class="logo-title">
                    FinanceAI <span class="logo-badge">Certified Health Audit</span>
                </div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Personal Wealth & Risk Assessment Report</div>
            </div>
            <div class="meta-info">
                <strong>{meta['user_name']}</strong>
                <span>{meta['email']}</span>
                <div>Report ID: {meta['report_id']}</div>
                <div>Date: {meta['generated_at']}</div>
            </div>
        </div>

        <!-- Scorecard -->
        <div class="scorecard">
            <div class="score-dial">
                <div class="score-circle">{score['overall_score']}</div>
                <div class="score-text">
                    <h2>Financial Health Score: {score['overall_score']}/100</h2>
                    <p>{score['verdict']}</p>
                </div>
            </div>
            <div class="grade-badge">
                <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8;">Rating</div>
                <div class="grade">{score['grade']}</div>
            </div>
        </div>

        <!-- Diagnostic Pillars -->
        <div class="section-title">Diagnostic Pillar Breakdown</div>
        <div class="pillars-grid">
            {pillars_html}
        </div>

        <!-- Key Financial Summary Statistics -->
        <div class="section-title">Key Financial Performance Indicators</div>
        <div class="stats-grid">
            <div class="stat-box">
                <span>Monthly Inflow</span>
                <p>{fmt_inr(cashflow['monthly_income'])}</p>
            </div>
            <div class="stat-box">
                <span>Total Outflow</span>
                <p>{fmt_inr(cashflow['total_outflow'])}</p>
            </div>
            <div class="stat-box">
                <span>Net Cash Flow</span>
                <p style="color: #10b981;">{fmt_inr(cashflow['net_cash_flow'])}</p>
            </div>
            <div class="stat-box">
                <span>Net Worth</span>
                <p>{fmt_inr(balance['total_net_worth'])}</p>
            </div>
        </div>

        <!-- Budget Adherence -->
        <div class="section-title">Category Spending & Budget Discipline</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Monthly Limit</th>
                    <th>Actual Spent</th>
                    <th>Remaining / Status</th>
                </tr>
            </thead>
            <tbody>
                {budget_rows_html}
            </tbody>
        </table>

        <!-- Goals Status -->
        <div class="section-title">Financial Goals Progress Tracker</div>
        <table>
            <thead>
                <tr>
                    <th>Goal Title</th>
                    <th>Category</th>
                    <th>Target Amount</th>
                    <th>Saved So Far</th>
                    <th>Target Timeline</th>
                </tr>
            </thead>
            <tbody>
                {goals_rows_html}
            </tbody>
        </table>

        <!-- Strategic Action Plan -->
        <div class="section-title">AI Prescriptive Action Plan</div>
        <ul class="action-list">
            {actions_html}
        </ul>

        <!-- Footer -->
        <div class="footer">
            Generated autonomously by FinanceAI Analytics Engine • All calculations are based on bank statement extractions and profile inputs • Confidential Document
        </div>
    </div>
</body>
</html>
        """
        return html
