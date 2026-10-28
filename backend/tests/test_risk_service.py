import os
import sys
import unittest

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.risk_service import RiskIntelligenceService


class TestRiskIntelligenceService(unittest.TestCase):

    def test_risk_analysis_clean_account(self):
        res = RiskIntelligenceService.analyze_account_risk("demo@financeai.com")
        self.assertTrue(res["success"])
        self.assertIn("overall_risk_score", res)
        self.assertIn("risk_vectors", res)
        self.assertIn("velocity_risk", res["risk_vectors"])
        self.assertIn("outlier_risk", res["risk_vectors"])
        self.assertIn("aml_structuring_risk", res["risk_vectors"])
        self.assertIsInstance(res["flags"], list)

    def test_risk_flag_resolution(self):
        resolve_res = RiskIntelligenceService.resolve_flag("test_txn_999", "verified")
        self.assertTrue(resolve_res["success"])
        self.assertEqual(resolve_res["status"], "verified")


if __name__ == "__main__":
    unittest.main()

