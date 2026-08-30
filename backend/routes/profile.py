from flask import Blueprint, jsonify, request
from services.profile_service import ProfileService

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("", methods=["GET"])
@profile_bp.route("/", methods=["GET"])
@profile_bp.route("/dashboard", methods=["GET"])
def get_user_data():
    email = request.args.get("email", "").strip().lower()
    result = ProfileService.get_profile(email=email if email else None)
    return jsonify(result), 200


@profile_bp.route("", methods=["POST"])
@profile_bp.route("/", methods=["POST"])
def save_user_data():
    data = request.get_json() or {}
    result = ProfileService.save_or_update_profile(data)
    status_code = result.pop("status", 200)
    return jsonify(result), status_code


@profile_bp.route("/evaluation", methods=["GET"])
def get_evaluation():
    email = request.args.get("email", "").strip().lower()
    result = ProfileService.get_profile(email=email if email else None)
    if not result.get("user"):
        return jsonify({"success": False, "message": "No financial profile found to evaluate"}), 404
    return jsonify({
        "success": True,
        "user": result["user"],
        "evaluation": result.get("evaluation")
    }), 200


@profile_bp.route("/evaluate", methods=["POST"])
def evaluate_custom_data():
    data = request.get_json() or {}
    result = ProfileService.evaluate_profile(data)
    status_code = result.pop("status", 200)
    return jsonify(result), status_code
