from flask import Blueprint, jsonify, request, current_app
from services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    result = AuthService.register_user(
        name=data.get("name"),
        email=data.get("email"),
        password=data.get("password")
    )
    status_code = result.pop("status", 200)
    return jsonify(result), status_code

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    result = AuthService.login_user(
        email=data.get("email"),
        password=data.get("password")
    )
    status_code = result.pop("status", 200)
    return jsonify(result), status_code

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    result = AuthService.forgot_password(email=data.get("email"))
    status_code = result.pop("status", 200)
    return jsonify(result), status_code

@auth_bp.route("/google", methods=["POST"])
def auth_google():
    data = request.get_json() or {}
    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    result = AuthService.verify_google_token(
        token=data.get("token"),
        client_id=client_id
    )
    status_code = result.pop("status", 200)
    return jsonify(result), status_code
