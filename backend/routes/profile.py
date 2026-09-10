import os
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from services.profile_service import ProfileService
from services.statement_parser import StatementParser

profile_bp = Blueprint("profile", __name__)

UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(os.path.dirname(__file__))), "uploads")



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


@profile_bp.route("/upload-statement", methods=["POST"])
def upload_statement():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file uploaded in the request"}), 400

    file = request.files["file"]
    if not file or not file.filename:
        return jsonify({"success": False, "message": "No file selected"}), 400

<<<<<<< HEAD
    from werkzeug.utils import secure_filename
    from services.statement_parser import StatementParser

    upload_dir = os.path.join(os.path.abspath(os.path.dirname(os.path.dirname(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    filename = secure_filename(file.filename)
    temp_path = os.path.join(upload_dir, filename)
    file.save(temp_path)

    try:
        result = StatementParser.parse(temp_path)
=======
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        result = StatementParser.parse(file_path)
>>>>>>> backend
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400
    finally:
<<<<<<< HEAD
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
=======
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
>>>>>>> backend
            except Exception:
                pass

