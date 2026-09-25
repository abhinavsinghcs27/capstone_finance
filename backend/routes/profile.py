import os
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from services.ai_advisor_service import AIAdvisorService
from services.market_data_service import MarketDataService
from services.profile_service import ProfileService
from services.statement_parser import StatementParser
from services.stock_recommender import StockRecommenderService
from services.transaction_service import TransactionService
from services.goals_service import GoalsService

profile_bp = Blueprint("profile", __name__)

UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(os.path.dirname(__file__))), "uploads")


@profile_bp.route("", methods=["GET"])
@profile_bp.route("/", methods=["GET"])
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

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        result = StatementParser.parse(file_path)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass


# ------------------------------------------------------------
# Transaction Ledger Endpoints
# ------------------------------------------------------------

@profile_bp.route("/transactions", methods=["GET"])
def get_transactions():
    """GET /user-data/transactions?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    transactions = TransactionService.get_transactions(email)
    return jsonify({
        "success": True,
        "transactions": transactions
    }), 200


@profile_bp.route("/transactions", methods=["POST"])
def save_bulk_transactions():
    """POST /user-data/transactions
    Request: { email: "...", transactions: [...] }
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    transactions = data.get("transactions", [])

    if not email:
        return jsonify({
            "success": False,
            "message": "User email is required"
        }), 400

    result = TransactionService.save_bulk_transactions(email, transactions)
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


@profile_bp.route("/transactions/new", methods=["POST"])
def add_single_transaction():
    """POST /user-data/transactions/new
    Request: { email: "...", date: "...", description: "...", amount: ..., type: "...", category: "..." }
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({
            "success": False,
            "message": "User email is required"
        }), 400

    result = TransactionService.add_single_transaction(email, data)
    status_code = 201 if result.get("success") else 400
    return jsonify(result), status_code


@profile_bp.route("/transactions/<txn_id>", methods=["DELETE"])
def delete_transaction(txn_id):
    """DELETE /user-data/transactions/<txn_id>?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    result = TransactionService.delete_transaction(email, txn_id)
    status_code = 200 if result.get("success") else 404
    return jsonify(result), status_code


# ------------------------------------------------------------
# AI Financial Advisor Endpoints
# ------------------------------------------------------------

@profile_bp.route("/ai-insights", methods=["GET"])
def get_ai_insights():
    """GET /user-data/ai-insights?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    result = AIAdvisorService.generate_insights(email=email if email else "")
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code


@profile_bp.route("/ai-chat", methods=["POST"])
def ai_chat():
    """POST /user-data/ai-chat
    Request: { email: "...", message: "...", conversation_history: [...] }
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    message = str(data.get("message", "")).strip()
    history = data.get("conversation_history", [])

    if not message:
        return jsonify({
            "success": False,
            "message": "Message content is required"
        }), 400

    result = AIAdvisorService.chat(
        email=email,
        user_message=message,
        conversation_history=history
    )
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code


# ------------------------------------------------------------
# Real-Time Indian Stock Market & Recommendation Endpoints
# ------------------------------------------------------------

@profile_bp.route("/market/indices", methods=["GET"])
def get_market_indices():
    """GET /user-data/market/indices — Returns live NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT"""
    indices = MarketDataService.get_indices()
    return jsonify({
        "success": True,
        "indices": indices
    }), 200


@profile_bp.route("/market/stocks", methods=["GET"])
def get_market_stocks():
    """GET /user-data/market/stocks — Returns live watchlist with RSI & technical indicators"""
    stocks = MarketDataService.get_market_watchlist()
    return jsonify({
        "success": True,
        "stocks": stocks
    }), 200


@profile_bp.route("/stock-recommendations", methods=["GET"])
def get_stock_recommendations():
    """GET /user-data/stock-recommendations?risk_level=Moderate&sector=all"""
    email = request.args.get("email", "").strip().lower()
    risk_level = request.args.get("risk_level", "").strip()
    sector = request.args.get("sector", "all").strip()

    # If risk level not explicitly passed, infer from user profile
    if not risk_level and email:
        profile_res = ProfileService.get_profile(email=email)
        user = profile_res.get("user") or {}
        risk_level = user.get("risk_tolerance") or "Moderate"
    elif not risk_level:
        risk_level = "Moderate"

    result = StockRecommenderService.generate_stock_recommendations(
        risk_level=risk_level,
        sector_filter=sector
    )
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code


# ------------------------------------------------------------
# Goals & Wealth Simulator Endpoints
# ------------------------------------------------------------

@profile_bp.route("/goals", methods=["GET"])
def get_user_goals():
    """GET /user-data/goals?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    goals = GoalsService.get_goals(email=email)
    return jsonify({
        "success": True,
        "goals": goals
    }), 200


@profile_bp.route("/goals", methods=["POST"])
def save_user_goal():
    """POST /user-data/goals
    Body: { email: "...", goal: { ... } }
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    goal = data.get("goal") or {}
    if not goal or not goal.get("title"):
        return jsonify({
            "success": False,
            "message": "Goal title and details are required."
        }), 400

    saved = GoalsService.save_goal(email=email, goal=goal)
    return jsonify({
        "success": True,
        "goal": saved,
        "message": "Goal saved successfully."
    }), 200


@profile_bp.route("/goals/<goal_id>", methods=["DELETE"])
def delete_user_goal(goal_id):
    """DELETE /user-data/goals/<goal_id>?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    success = GoalsService.delete_goal(email=email, goal_id=goal_id)
    return jsonify({
        "success": success,
        "message": "Goal deleted successfully" if success else "Goal not found"
    }), 200 if success else 404


@profile_bp.route("/goals/simulate-sip", methods=["POST"])
def simulate_sip():
    """POST /user-data/goals/simulate-sip
    Body: { initial_investment, monthly_sip, annual_cagr, years, inflation_rate }
    """
    data = request.get_json() or {}
    try:
        initial = float(data.get("initial_investment", 0))
        monthly = float(data.get("monthly_sip", 10000))
        cagr = float(data.get("annual_cagr", 12))
        years = int(data.get("years", 10))
        inflation = float(data.get("inflation_rate", 6.0))

        result = GoalsService.simulate_sip(
            initial_investment=initial,
            monthly_sip=monthly,
            annual_cagr=cagr,
            years=years,
            inflation_rate=inflation
        )
        return jsonify({
            "success": True,
            "simulation": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Simulation error: {str(e)}"
        }), 400


@profile_bp.route("/goals/simulate-fire", methods=["POST"])
def simulate_fire():
    """POST /user-data/goals/simulate-fire
    Body: { current_age, target_retirement_age, current_monthly_expenses, current_corpus, pre_retirement_cagr, inflation_rate, safe_withdrawal_rate }
    """
    data = request.get_json() or {}
    try:
        current_age = int(data.get("current_age", 28))
        target_ret_age = int(data.get("target_retirement_age", 50))
        expenses = float(data.get("current_monthly_expenses", 60000))
        corpus = float(data.get("current_corpus", 500000))
        pre_cagr = float(data.get("pre_retirement_cagr", 12.0))
        inflation = float(data.get("inflation_rate", 6.0))
        swr = float(data.get("safe_withdrawal_rate", 4.0))

        result = GoalsService.simulate_fire(
            current_age=current_age,
            target_retirement_age=target_ret_age,
            current_monthly_expenses=expenses,
            current_corpus=corpus,
            pre_retirement_cagr=pre_cagr,
            inflation_rate=inflation,
            safe_withdrawal_rate=swr
        )
        return jsonify({
            "success": True,
            "fire_simulation": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"FIRE simulation error: {str(e)}"
        }), 400

