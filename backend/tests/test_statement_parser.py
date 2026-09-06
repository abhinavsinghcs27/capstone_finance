import io
import os
import sys
import unittest
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from engines.financial_engine import FinancialEngine
from services.profile_service import FinanceAI, ProfileService
from services.statement_parser import StatementParser


class TestStatementParser(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def setUp(self):
        self.test_dir = os.path.join(backend_dir, "temp", "test_fixtures")
        os.makedirs(self.test_dir, exist_ok=True)

    def tearDown(self):
        if os.path.exists(self.test_dir):
            for f in os.listdir(self.test_dir):
                try:
                    os.remove(os.path.join(self.test_dir, f))
                except Exception:
                    pass

    def test_csv_hdfc_format(self):
        csv_path = os.path.join(self.test_dir, "hdfc_statement.csv")
        data = {
            "Date": ["01/04/2024", "05/04/2024", "10/04/2024", "15/04/2024", "20/04/2024"],
            "Narration": [
                "SALARY CREDIT FOR MARCH 2024",
                "HDFC HOME LOAN EMI",
                "SWIGGY BANGALORE",
                "ZERODHA BROKING LTD SIP",
                "NEFT CR FROM CLIENT REF 123"
            ],
            "Withdrawal Amt.": ["", "25,000.00", "450.50", "10,000.00", ""],
            "Deposit Amt.": ["85,000.00", "", "", "", "15,000.00"],
            "Closing Balance": ["1,10,000.00", "85,000.00", "84,549.50", "74,549.50", "89,549.50"]
        }
        pd.DataFrame(data).to_csv(csv_path, index=False)

        res = StatementParser.parse(csv_path)

        self.assertTrue(res["success"])
        self.assertEqual(res["document_info"]["detect_bank"], "HDFC Bank")
        self.assertEqual(res["document_info"]["statement_period"], "01/04/2024 to 20/04/2024")

        prof = res["extraction_profile"]
        self.assertEqual(prof["monthly_income"], 85000.0)
        self.assertEqual(prof["other_income"], 15000.0)
        self.assertEqual(prof["fixed_expenses"], 25000.0)
        self.assertEqual(prof["variable_expenses"], 450.50)
        self.assertEqual(prof["existing_debt"], 25000.0)
        self.assertEqual(prof["current_savings"], 89549.50)
        self.assertEqual(prof["mutual_funds"], 6000.0)
        self.assertEqual(prof["stocks"], 4000.0)

        txns = res["sample_transactions"]
        self.assertEqual(len(txns), 5)
        self.assertEqual(txns[0]["category"], "Salary")
        self.assertEqual(txns[1]["category"], "Fixed Expense")
        self.assertEqual(txns[2]["category"], "Variable Spend")
        self.assertEqual(txns[3]["category"], "Investment")
        self.assertEqual(txns[4]["category"], "Other Inflow")

    def test_excel_icici_format(self):
        excel_path = os.path.join(self.test_dir, "icici_statement.xlsx")
        data = {
            "Transaction Date": ["2024-05-01", "2024-05-03", "2024-05-12", "2024-05-28"],
            "Description": [
                "INFOSYS PAYROLL DIRECT DEP",
                "ZOMATO RESTAURANT",
                "GROWW MUTUAL FUND SIP",
                "UBER TRIP"
            ],
            "Debit": [0.0, 620.0, 5000.0, 340.0],
            "Credit": [65000.0, 0.0, 0.0, 0.0],
            "Balance": [80000.0, 79380.0, 74380.0, 74040.0]
        }
        pd.DataFrame(data).to_excel(excel_path, index=False)

        res = StatementParser.parse(excel_path)
        self.assertTrue(res["success"])
        self.assertEqual(res["document_info"]["detect_bank"], "ICICI Bank")

        prof = res["extraction_profile"]
        self.assertEqual(prof["monthly_income"], 65000.0)
        self.assertEqual(prof["variable_expenses"], 960.0)
        self.assertEqual(prof["mutual_funds"], 3000.0)
        self.assertEqual(prof["stocks"], 2000.0)

    def test_sbi_single_amount_column(self):
        csv_path = os.path.join(self.test_dir, "sbi_statement.csv")
        data = {
            "Txn Date": ["10-06-2024", "15-06-2024", "22-06-2024"],
            "Particulars": [
                "SALARY FOR MAY 2024",
                "LIC INSURANCE PREMIUM",
                "AMAZON SHOPPING"
            ],
            "Amount": ["₹ 55,000.00", "₹ 4,500.00", "₹ 1,200.00"],
            "Txn Type": ["CR", "DR", "DR"],
            "Balance": ["60,000.00", "55,500.00", "54,300.00"]
        }
        pd.DataFrame(data).to_csv(csv_path, index=False)

        res = StatementParser.parse(csv_path)
        self.assertTrue(res["success"])
        self.assertEqual(res["document_info"]["detect_bank"], "State Bank of India")

        prof = res["extraction_profile"]
        self.assertEqual(prof["monthly_income"], 55000.0)
        self.assertEqual(prof["fixed_expenses"], 4500.0)
        self.assertEqual(prof["variable_expenses"], 1200.0)

    def test_axis_and_kotak_bank_signatures(self):
        axis_path = os.path.join(self.test_dir, "axis_bank_statement.csv")
        kotak_path = os.path.join(self.test_dir, "kotak_mahindra_statement.csv")

        data = {
            "Date": ["01/01/2024", "02/01/2024"],
            "Particulars": ["SALARY MONTHLY", "PETROL FUEL"],
            "Debit": [0, 2000],
            "Credit": [70000, 0],
            "Balance": [70000, 68000]
        }
        pd.DataFrame(data).to_csv(axis_path, index=False)
        pd.DataFrame(data).to_csv(kotak_path, index=False)

        res_axis = StatementParser.parse(axis_path)
        self.assertEqual(res_axis["document_info"]["detect_bank"], "Axis Bank")

        res_kotak = StatementParser.parse(kotak_path)
        self.assertEqual(res_kotak["document_info"]["detect_bank"], "Kotak Mahindra Bank")

    def test_pdf_statement_parsing(self):
        pdf_path = os.path.join(self.test_dir, "hdfc_bank_statement.pdf")
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph("HDFC Bank Account Statement", styles["Heading1"]))
        elements.append(Spacer(1, 10))

        table_data = [
            ["Date", "Narration", "Withdrawal", "Deposit", "Closing Balance"],
            ["01-07-2024", "TECH CORP SALARY CR", "", "95000.00", "150000.00"],
            ["05-07-2024", "BAJAJ FIN LOAN EMI", "18000.00", "", "132000.00"],
            ["10-07-2024", "BLINKIT GROCERY", "1500.00", "", "130500.00"],
            ["15-07-2024", "ZERODHA STOCK INVESTMENT", "12000.00", "", "118500.00"],
        ]

        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(t)
        doc.build(elements)

        res = StatementParser.parse(pdf_path)
        self.assertTrue(res["success"])
        self.assertEqual(res["document_info"]["detect_bank"], "HDFC Bank")
        self.assertEqual(res["document_info"]["statement_period"], "01-07-2024 to 15-07-2024")

        prof = res["extraction_profile"]
        self.assertEqual(prof["monthly_income"], 95000.0)
        self.assertEqual(prof["fixed_expenses"], 18000.0)
        self.assertEqual(prof["existing_debt"], 18000.0)
        self.assertEqual(prof["variable_expenses"], 1500.0)
        self.assertEqual(prof["current_savings"], 118500.0)
        self.assertEqual(prof["mutual_funds"], 7200.0)  # 12000 * 0.6
        self.assertEqual(prof["stocks"], 4800.0)        # 12000 * 0.4

    def test_profile_and_financial_engine_compatibility(self):
        csv_path = os.path.join(self.test_dir, "test_compat.csv")
        data = {
            "Date": ["01/01/2024", "05/01/2024"],
            "Description": ["SALARY TRANSFER", "RENT PAYMENT"],
            "Debit": [0, 20000],
            "Credit": [80000, 0],
            "Balance": [80000, 60000]
        }
        pd.DataFrame(data).to_csv(csv_path, index=False)

        parsed = StatementParser.parse(csv_path)
        extracted = parsed["extraction_profile"]

        # Merge with user biographical info to construct full FinanceAI profile
        user_profile_data = {
            "name": "Test User",
            "age": 28,
            "email": "test@example.com",
            **extracted
        }

        user = FinanceAI.from_dict(user_profile_data)
        self.assertEqual(user.monthly_income, 80000)
        self.assertEqual(user.fixed_expenses, 20000)
        self.assertEqual(user.current_savings, 60000)

        # Run FinancialEngine full evaluation
        evaluation = FinancialEngine(user_profile_data).run_full_evaluation()
        self.assertIn("health_score", evaluation)
        self.assertIn("score", evaluation["health_score"])
        self.assertIn("grade", evaluation["health_score"])
        self.assertIn("summary", evaluation)
        self.assertIn("ratios", evaluation)
        self.assertIn("portfolio", evaluation)
        self.assertIn("recommendations", evaluation)


    def test_api_upload_statement_endpoint(self):
        csv_content = (
            "Date,Narration,Withdrawal,Deposit,Balance\n"
            "01/08/2024,SALARY CREDIT,,75000.00,100000.00\n"
            "05/08/2024,SWIGGY FOOD,500.00,,99500.00\n"
        )
        data = {
            "file": (io.BytesIO(csv_content.encode("utf-8")), "hdfc_statement.csv")
        }

        response = self.client.post(
            "/user-data/upload-statement",
            data=data,
            content_type="multipart/form-data"
        )

        self.assertEqual(response.status_code, 200)
        res_json = response.get_json()
        self.assertTrue(res_json["success"])
        self.assertEqual(res_json["document_info"]["detect_bank"], "HDFC Bank")
        self.assertEqual(res_json["extraction_profile"]["monthly_income"], 75000.0)

    def test_file_not_found(self):
        with self.assertRaises(FileNotFoundError):
            StatementParser.parse("c:/non_existent_file.csv")

    def test_unsupported_format(self):
        txt_path = os.path.join(self.test_dir, "test.txt")
        with open(txt_path, "w") as f:
            f.write("Some dummy text")
        with self.assertRaises(ValueError):
            StatementParser.parse(txt_path)


if __name__ == "__main__":
    unittest.main()
