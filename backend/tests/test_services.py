import unittest
from services.goals_service import GoalsService
from services.market_data_service import MarketDataService
from services.ai_advisor_service import AIAdvisorService


class TestServices(unittest.TestCase):

    def test_goals_default_seed(self):
        goals = GoalsService.get_goals("demo@financeai.com")
        self.assertIsInstance(goals, list)
        self.assertGreater(len(goals), 0)
        self.assertIn("title", goals[0])

    def test_sip_simulation(self):
        res = GoalsService.simulate_sip(
            initial_investment=100000,
            monthly_sip=10000,
            annual_cagr=12.0,
            years=5,
            inflation_rate=6.0
        )
        self.assertIn("future_corpus", res)
        self.assertIn("wealth_gain", res)
        self.assertGreater(res["future_corpus"], res["total_invested"])
        self.assertEqual(len(res["trajectory"]), 5)

    def test_fire_simulation(self):
        res = GoalsService.simulate_fire(
            current_age=28,
            target_retirement_age=50,
            current_monthly_expenses=50000,
            current_corpus=500000
        )
        self.assertIn("target_corpus", res)
        self.assertIn("required_monthly_sip", res)
        self.assertGreater(res["target_corpus"], 0)

    def test_market_indices(self):
        indices = MarketDataService.get_indices()
        self.assertIsInstance(indices, list)
        self.assertGreater(len(indices), 0)
        for idx in indices:
            self.assertIn("name", idx)
            self.assertIn("price", idx)

    def test_ai_advisor_fallback(self):
        res = AIAdvisorService._get_fallback_insights("demo@financeai.com")
        self.assertIn("summary", res)
        self.assertIn("insights", res)
        self.assertIsInstance(res["insights"], list)

    def test_budget_service(self):
        from services.budget_service import BudgetService
        res = BudgetService.get_budgets("demo@financeai.com")
        self.assertTrue(res["success"])
        self.assertIn("budgets", res)
        self.assertIn("summary", res)
        self.assertGreater(len(res["budgets"]), 0)

        # Test save budget
        saved = BudgetService.save_budget("demo@financeai.com", "Food", 20000)
        self.assertTrue(saved["success"])

    def test_report_service(self):
        from services.report_service import ReportService
        report = ReportService.generate_report_data("demo@financeai.com")
        self.assertTrue(report["success"])
        self.assertIn("report_meta", report)
        self.assertIn("audit_score", report)
        self.assertIn("cash_flow", report)
        self.assertIn("balance_sheet", report)
        self.assertIn("pillars", report["audit_score"])
        self.assertEqual(len(report["audit_score"]["pillars"]), 4)

        html = ReportService.generate_printable_html("demo@financeai.com")
        self.assertIn("<!DOCTYPE html>", html)
        self.assertIn("Financial Health Audit Report", html)
        self.assertIn("FinanceAI", html)


if __name__ == "__main__":
    unittest.main()


