import os
import sys
import unittest
import pandas as pd

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from services.transaction_service import TransactionService, TRANSACTION_CSV, COLUMNS


class TestTransactionService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def setUp(self):
        # Backup or reset transactions.csv
        TransactionService._ensure_data_store()
        df = pd.DataFrame(columns=COLUMNS)
        df.to_csv(TRANSACTION_CSV, index=False)

    def test_save_bulk_and_get_transactions(self):
        email = "testuser@example.com"
        transactions = [
            {
                "date": "2026-08-01",
                "description": "SALARY CREDIT - TECH CORP",
                "amount": 80000.0,
                "type": "income",
                "category": "Income"
            },
            {
                "date": "2026-08-04",
                "description": "HDFC HOME LOAN EMI",
                "amount": 20000.0,
                "type": "expense",
                "category": "Housing"
            },
            {
                "date": "2026-08-10",
                "description": "ZERODHA BROKING SIP",
                "amount": 15000.0,
                "type": "investment",
                "category": "Investment"
            }
        ]

        res = TransactionService.save_bulk_transactions(email, transactions)
        self.assertTrue(res["success"])
        self.assertEqual(res["count"], 3)

        fetched = TransactionService.get_transactions(email)
        self.assertEqual(len(fetched), 3)
        # Should be sorted newest date first: 2026-08-10, 2026-08-04, 2026-08-01
        self.assertEqual(fetched[0]["date"], "2026-08-10")
        self.assertEqual(fetched[0]["type"], "investment")
        self.assertEqual(fetched[1]["date"], "2026-08-04")
        self.assertEqual(fetched[2]["date"], "2026-08-01")

        # Duplicate check: re-saving identical transactions should add 0 new rows
        dup_res = TransactionService.save_bulk_transactions(email, transactions)
        self.assertTrue(dup_res["success"])
        self.assertEqual(dup_res["count"], 0)

        # Confirm count is still 3
        fetched_again = TransactionService.get_transactions(email)
        self.assertEqual(len(fetched_again), 3)

    def test_add_single_transaction_and_delete(self):
        email = "manual@example.com"
        txn_data = {
            "date": "2026-08-23",
            "description": "Grocery shopping - Blinkit",
            "amount": 1450.0,
            "type": "expense",
            "category": "Food"
        }

        res = TransactionService.add_single_transaction(email, txn_data)
        self.assertTrue(res["success"])
        txn = res["transaction"]
        self.assertEqual(txn["user_email"], email)
        self.assertEqual(txn["amount"], 1450.0)
        self.assertEqual(txn["source"], "manual")
        txn_id = txn["id"]

        fetched = TransactionService.get_transactions(email)
        self.assertEqual(len(fetched), 1)
        self.assertEqual(fetched[0]["id"], txn_id)

        # Delete transaction
        del_res = TransactionService.delete_transaction(email, txn_id)
        self.assertTrue(del_res["success"])

        fetched_after = TransactionService.get_transactions(email)
        self.assertEqual(len(fetched_after), 0)

    def test_rest_api_endpoints(self):
        email = "apiuser@example.com"
        # 1. Bulk save
        bulk_payload = {
            "email": email,
            "transactions": [
                {
                    "date": "2026-08-01",
                    "description": "TEST SALARY",
                    "amount": 90000.0,
                    "type": "CREDIT",
                    "category": "Salary"
                }
            ]
        }
        res = self.client.post("/user-data/transactions", json=bulk_payload)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()["success"])

        # 2. Add single
        single_payload = {
            "email": email,
            "date": "2026-08-02",
            "description": "COFFEE",
            "amount": 250.0,
            "type": "expense",
            "category": "Food"
        }
        res_single = self.client.post("/user-data/transactions/new", json=single_payload)
        self.assertEqual(res_single.status_code, 201)
        single_json = res_single.get_json()
        self.assertTrue(single_json["success"])
        txn_id = single_json["transaction"]["id"]

        # 3. GET transactions
        res_get = self.client.get(f"/user-data/transactions?email={email}")
        self.assertEqual(res_get.status_code, 200)
        get_json = res_get.get_json()
        self.assertTrue(get_json["success"])
        self.assertEqual(len(get_json["transactions"]), 2)

        # 4. DELETE transaction
        res_del = self.client.delete(f"/user-data/transactions/{txn_id}?email={email}")
        self.assertEqual(res_del.status_code, 200)
        self.assertTrue(res_del.get_json()["success"])

        # Verify 1 remains
        res_get2 = self.client.get(f"/user-data/transactions?email={email}")
        self.assertEqual(len(res_get2.get_json()["transactions"]), 1)


if __name__ == "__main__":
    unittest.main()
