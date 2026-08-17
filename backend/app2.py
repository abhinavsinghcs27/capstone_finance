import csv
import os
from dataclasses import asdict, dataclass, fields

from flask import Flask, jsonify, request
from flask_cors import CORS
from google.oauth2 import id_token
from google.auth.transport import requests
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
CORS(app)

CSV_FILE = "user_data.csv"
USERS_CSV = "users.csv"

USER_FIELDS = ["name", "email", "password_hash", "auth_type"]

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    os.getenv(
        "GOOGLE_CLINT_ID",
        "901639314753-ee9i94rc2ra17k8jk5o5mq4bobodab82.apps.googleusercontent.com"
    )
)


@dataclass
class FinanceAI:
    name: str
    age: int
    employment_type: str = ""
    financial_goals: str = ""
    marital_status: str = ""
    dependents: int = 0

    monthly_income: int = 0
    other_income: int = 0

    fixed_expenses: int = 0
    variable_expenses: int = 0
    existing_debt: int = 0

    current_savings: int = 0
    emergency_fund: int = 0

    stocks: int = 0
    mutual_funds: int = 0
    fixed_deposit: int = 0
    gold: int = 0
    insurance: str = ""
    other_investments: int = 0

    risk_tolerance: str = ""

    @classmethod
    def from_dict(cls, data):
        return cls(
            name=str(data.get("name", "")).strip(),
            age=int(data.get("age", 0)),
            employment_type=str(data.get("employmentType", "")),
            financial_goals=str(data.get("financialGoals", "")),
            marital_status=str(data.get("maritalStatus", "")),
            dependents=int(data.get("dependents", 0) or 0),

            monthly_income=int(data.get("monthlyIncome", 0) or 0),
            other_income=int(data.get("otherIncome", 0) or 0),

            fixed_expenses=int(data.get("fixedExpenses", 0) or 0),
            variable_expenses=int(data.get("variableExpenses", 0) or 0),
            existing_debt=int(data.get("existingDebt", 0) or 0),

            current_savings=int(data.get("currentSavings", 0) or 0),
            emergency_fund=int(data.get("emergencyFund", 0) or 0),

            stocks=int(data.get("stocks", 0) or 0),
            mutual_funds=int(data.get("mutualFunds", 0) or 0),
            fixed_deposit=int(data.get("fixedDeposit", 0) or 0),
            gold=int(data.get("gold", 0) or 0),
            insurance=str(data.get("insurance", "")),
            other_investments=int(data.get("otherInvestments", 0) or 0),

            risk_tolerance=str(data.get("riskTolerance", ""))
        )


FIELDS = [f.name for f in fields(FinanceAI)]


def init_db():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as file:
            csv.DictWriter(file, fieldnames=FIELDS).writeheader()

    if not os.path.exists(USERS_CSV):
        with open(USERS_CSV, "w", newline="", encoding="utf-8") as file:
            csv.DictWriter(file, fieldnames=USER_FIELDS).writeheader()


def get_all_users():
    if not os.path.exists(USERS_CSV):
        return []

    with open(USERS_CSV, "r", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def find_user_by_email(email):
    email = email.strip().lower()

    for user in get_all_users():
        if user.get("email", "").lower() == email:
            return user

    return None


def save_user(name, email, password_hash="", auth_type="local"):
    with open(USERS_CSV, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=USER_FIELDS)
        writer.writerow({
            "name": name.strip(),
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "auth_type": auth_type
        })

@app.route("/user-data", methods=["GET"])
def get_user_data():
    if not os.path.exists(CSV_FILE):
        return jsonify({"success": True, "user": None})

    with open(CSV_FILE, "r", encoding="utf-8") as file:
        users = list(csv.DictReader(file))

    if not users:
        return jsonify({"success": True, "user": None})

    user = {key: value for key, value in users[-1].items() if key is not None}

    return jsonify({"success": True, "user": user})
# ---------------- AUTH ----------------

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email, and password are required"
        }), 400

    if find_user_by_email(email):
        return jsonify({
            "success": False,
            "message": "User with this email already exists"
        }), 400

    save_user(
        name,
        email,
        generate_password_hash(password),
        "local"
    )

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "user": {
            "name": name,
            "email": email
        }
    }), 201


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    user = find_user_by_email(email)

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    if user.get("auth_type") == "google" and not user.get("password_hash"):
        return jsonify({
            "success": False,
            "message": "This email is registered via Google Sign-In. Please use Google Auth."
        }), 400

    if not check_password_hash(user["password_hash"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "name": user.get("name"),
            "email": user.get("email")
        }
    }), 200


@app.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = str(data.get("email", "")).strip().lower()

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400

    if not find_user_by_email(email):
        return jsonify({
            "success": False,
            "message": "No account found with this email"
        }), 404

    return jsonify({
        "success": True,
        "message": "Password reset link sent to your email"
    }), 200


@app.route("/auth/google", methods=["POST"])
def auth_google():
    data = request.get_json() or {}
    token = data.get("token")

    if not token:
        return jsonify({
            "success": False,
            "message": "No token provided"
        }), 400

    try:
        user_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        google_id = user_info.get("sub")
        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")

        if email and not find_user_by_email(email):
            save_user(
                name or "",
                email,
                "",
                "google"
            )

        return jsonify({
            "success": True,
            "message": "Google authentication successful",
            "user": {
                "google_id": google_id,
                "email": email,
                "name": name,
                "picture": picture
            }
        }), 200

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Invalid Google token"
        }), 401


# ---------------- FINANCIAL PROFILE ----------------

@app.route("/user-data", methods=["POST"])
def user_data():
    data = request.get_json() or {}

    name = str(data.get("name", "")).strip()
    age = data.get("age")
    monthly_income = data.get("monthlyIncome")

    if not name or age is None or monthly_income is None:
        return jsonify({
            "success": False,
            "message": "Name, age and monthly income are required"
        }), 400

    try:
        user = FinanceAI.from_dict(data)
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Please enter valid financial information"
        }), 400

    with open(CSV_FILE, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writerow(asdict(user))

    return jsonify({
        "success": True,
        "message": "User financial profile saved successfully",
        "user": {
            "name": user.name,
            "age": user.age
        }
    }), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)