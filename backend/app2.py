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

GOOGLE_CLINT_ID = os.getenv("GOOGLE_CLINT_ID", "901639314753-ee9i94rc2ra17k8jk5o5mq4bobodab82.apps.googleusercontent.com")


def init_db():
    """Ensure CSV files exist with proper header rows."""
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=FIELDS)
            writer.writeheader()

    if not os.path.exists(USERS_CSV):
        with open(USERS_CSV, "w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=USER_FIELDS)
            writer.writeheader()


def get_all_users():
    """Read users from USERS_CSV."""
    if not os.path.exists(USERS_CSV):
        return []
    with open(USERS_CSV, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)


def find_user_by_email(email: str):
    """Find a user record by email."""
    email_clean = email.strip().lower()
    for u in get_all_users():
        if u.get("email", "").lower() == email_clean:
            return u
    return None


def save_user(name: str, email: str, password_hash: str = "", auth_type: str = "local"):
    """Append a new user record to USERS_CSV."""
    with open(USERS_CSV, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=USER_FIELDS)
        writer.writerow({
            "name": name.strip(),
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "auth_type": auth_type
        })


@dataclass
class FinanceAI:
    name: str
    age: int
    salary: int
    marital_status: str = ""
    kids: int = 0
    overall_expenses: int = 0
    saving_goal: int = 0
    saving: int = 0
    insurence: str = ""
    investment: str = ""

    @classmethod
    def from_dict(cls, data: dict):
        """Construct a FinanceAI instance safely from a JSON payload dict."""
        return cls(
            name=str(data.get("name", "")).strip(),
            age=int(data["age"]) if data.get("age") is not None else 0,
            salary=int(data["salary"]) if data.get("salary") is not None else 0,
            marital_status=str(data.get("marital_status", "")),
            kids=int(data.get("kids", 0) or 0),
            overall_expenses=int(data.get("overall_expenses", 0) or 0),
            saving_goal=int(data.get("saving_goal", 0) or 0),
            saving=int(data.get("saving", 0) or 0),
            insurence=str(data.get("insurence", "")),
            investment=str(data.get("investment", "")),
        )


FIELDS = [f.name for f in fields(FinanceAI)]


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

    pwd_hash = generate_password_hash(password)
    save_user(name=name, email=email, password_hash=pwd_hash, auth_type="local")

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

    user = find_user_by_email(email)
    if not user:
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
            token, requests.Request(), GOOGLE_CLINT_ID
        )

        google_id = user_info.get("sub")
        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")

        # Auto-register google user if not already present
        if email and not find_user_by_email(email):
            save_user(name=name or "", email=email, password_hash="", auth_type="google")

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


# ------------------- DATA ROUTES -------------------

@app.route("/user-data", methods=["POST"])
def user_data():
    data = request.get_json() or {}

    name = data.get("name")
    age = data.get("age")
    salary = data.get("salary")

    if not name or age is None or salary is None:
        return jsonify({
            "success": False,
            "message": "Name, age and salary are required"
        }), 400

    try:
        user = FinanceAI.from_dict(data)
    except (ValueError, TypeError) as e:
        return jsonify({
            "success": False,
            "message": f"Invalid input format: {str(e)}"
        }), 400

    with open(CSV_FILE, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writerow(asdict(user))

    return jsonify({
        "success": True,
        "message": "User data saved successfully"
    }), 200


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)

