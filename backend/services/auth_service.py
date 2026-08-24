import csv
import os
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests

USERS_CSV = os.path.join(os.path.abspath(os.path.dirname(os.path.dirname(__file__))), "users.csv")
USER_FIELDS = ["name", "email", "password_hash", "auth_type"]

def init_users_csv():
    if not os.path.exists(USERS_CSV):
        with open(USERS_CSV, "w", newline="", encoding="utf-8") as file:
            csv.DictWriter(file, fieldnames=USER_FIELDS).writeheader()

class AuthService:
    @staticmethod
    def get_all_users():
        init_users_csv()
        if not os.path.exists(USERS_CSV):
            return []
        with open(USERS_CSV, "r", encoding="utf-8") as file:
            return list(csv.DictReader(file))

    @staticmethod
    def find_user_by_email(email):
        if not email:
            return None
        email = email.strip().lower()
        for user in AuthService.get_all_users():
            if user.get("email", "").lower() == email:
                return user
        return None

    @staticmethod
    def save_user(name, email, password_hash="", auth_type="local"):
        init_users_csv()
        with open(USERS_CSV, "a", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=USER_FIELDS)
            writer.writerow({
                "name": name.strip(),
                "email": email.strip().lower(),
                "password_hash": password_hash,
                "auth_type": auth_type
            })

    @staticmethod
    def register_user(name, email, password):
        name = str(name or "").strip()
        email = str(email or "").strip().lower()
        password = str(password or "").strip()

        if not name or not email or not password:
            return {"success": False, "message": "Name, email, and password are required", "status": 400}

        if AuthService.find_user_by_email(email):
            return {"success": False, "message": "User with this email already exists", "status": 400}

        AuthService.save_user(
            name=name,
            email=email,
            password_hash=generate_password_hash(password),
            auth_type="local"
        )

        return {
            "success": True,
            "message": "User registered successfully",
            "user": {"name": name, "email": email},
            "status": 201
        }

    @staticmethod
    def login_user(email, password):
        email = str(email or "").strip().lower()
        password = str(password or "").strip()

        if not email or not password:
            return {"success": False, "message": "Email and password are required", "status": 400}

        user = AuthService.find_user_by_email(email)
        if not user:
            return {"success": False, "message": "Invalid email or password", "status": 401}

        if user.get("auth_type") == "google" and not user.get("password_hash"):
            return {
                "success": False,
                "message": "This email is registered via Google Sign-In. Please use Google Auth.",
                "status": 400
            }

        if not check_password_hash(user.get("password_hash", ""), password):
            return {"success": False, "message": "Invalid email or password", "status": 401}

        return {
            "success": True,
            "message": "Login successful",
            "user": {"name": user.get("name"), "email": user.get("email")},
            "status": 200
        }

    @staticmethod
    def forgot_password(email):
        email = str(email or "").strip().lower()
        if not email:
            return {"success": False, "message": "Email is required", "status": 400}

        user = AuthService.find_user_by_email(email)
        if not user:
            return {"success": False, "message": "No account found with this email", "status": 404}

        return {
            "success": True,
            "message": "Password reset link sent to your email",
            "status": 200
        }

    @staticmethod
    def verify_google_token(token, client_id):
        if not token:
            return {"success": False, "message": "No token provided", "status": 400}

        try:
            user_info = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                client_id
            )

            google_id = user_info.get("sub")
            email = user_info.get("email", "").strip().lower()
            name = user_info.get("name", "").strip()
            picture = user_info.get("picture")

            if email and not AuthService.find_user_by_email(email):
                AuthService.save_user(
                    name=name or "",
                    email=email,
                    password_hash="",
                    auth_type="google"
                )

            return {
                "success": True,
                "message": "Google authentication successful",
                "user": {
                    "google_id": google_id,
                    "email": email,
                    "name": name,
                    "picture": picture
                },
                "status": 200
            }
        except ValueError:
            return {"success": False, "message": "Invalid Google token", "status": 401}
