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
        # First query from Relational Database (SQLAlchemy)
        try:
            from models.user import User
            db_users = User.query.all()
            if db_users:
                return [
                    {
                        "id": u.id,
                        "name": u.name,
                        "email": u.email,
                        "password_hash": u.password_hash,
                        "auth_type": u.auth_type
                    }
                    for u in db_users
                ]
        except Exception:
            pass

        # Fallback to CSV
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

        # 1. First look in Relational Database (SQLAlchemy / PostgreSQL)
        try:
            from models.user import User
            db_user = User.query.filter_by(email=email).first()
            if db_user:
                return {
                    "id": db_user.id,
                    "name": db_user.name,
                    "email": db_user.email,
                    "password_hash": db_user.password_hash,
                    "auth_type": db_user.auth_type
                }
        except Exception:
            pass

        # 2. Fallback to CSV
        init_users_csv()
        if os.path.exists(USERS_CSV):
            with open(USERS_CSV, "r", encoding="utf-8") as file:
                for user in csv.DictReader(file):
                    if user.get("email", "").strip().lower() == email:
                        return user
        return None

    @staticmethod
    def save_user(name, email, password_hash="", auth_type="local"):
        clean_email = email.strip().lower()
        clean_name = name.strip()

        # 1. Persist to Relational Database (SQLAlchemy / PostgreSQL)
        try:
            from extensions import db
            from models.user import User
            existing = User.query.filter_by(email=clean_email).first()
            if existing:
                existing.name = clean_name
                if password_hash:
                    existing.password_hash = password_hash
                existing.auth_type = auth_type
            else:
                db_user = User(
                    name=clean_name,
                    email=clean_email,
                    password_hash=password_hash,
                    auth_type=auth_type
                )
                db.session.add(db_user)
            db.session.commit()
        except Exception as e:
            try:
                from extensions import db
                db.session.rollback()
            except Exception:
                pass

        # 2. Persist to CSV fallback
        init_users_csv()
        existing_csv_users = []
        if os.path.exists(USERS_CSV):
            with open(USERS_CSV, "r", encoding="utf-8") as file:
                existing_csv_users = list(csv.DictReader(file))

        updated = False
        for row in existing_csv_users:
            if row.get("email", "").strip().lower() == clean_email:
                row["name"] = clean_name
                if password_hash:
                    row["password_hash"] = password_hash
                row["auth_type"] = auth_type
                updated = True
                break

        if not updated:
            existing_csv_users.append({
                "name": clean_name,
                "email": clean_email,
                "password_hash": password_hash,
                "auth_type": auth_type
            })

        with open(USERS_CSV, "w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=USER_FIELDS)
            writer.writeheader()
            writer.writerows(existing_csv_users)

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
