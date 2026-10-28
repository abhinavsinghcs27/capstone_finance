import os
from datetime import datetime
from flask import Blueprint, jsonify, request, Response
from werkzeug.utils import secure_filename
from services.ai_advisor_service import AIAdvisorService
from services.market_data_service import MarketDataService
from services.profile_service import ProfileService
from services.statement_parser import StatementParser
from services.stock_recommender import StockRecommenderService
from services.transaction_service import TransactionService
from services.goals_service import GoalsService
from services.budget_service import BudgetService
from services.report_service import ReportService
from services.risk_service import RiskIntelligenceService
from services.tax_service import TaxService
from services.subscription_service import SubscriptionService
from services.db_migration_service import DBMigrationService

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


@profile_bp.route("/transactions/export", methods=["GET"])
def export_transactions():
    """GET /user-data/transactions/export?email=user@example.com&type=all&category=all"""
    email = request.args.get("email", "").strip().lower()
    txn_type = request.args.get("type", "all").strip().lower()
    category = request.args.get("category", "all").strip()

    csv_data = TransactionService.export_transactions_csv(email=email, txn_type=txn_type, category=category)
    today_str = datetime.now().strftime("%Y%m%d")
    filename = f"FinanceAI_Transactions_{today_str}.csv"

    return Response(
        csv_data,
        mimetype="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "text/csv; charset=utf-8"
        }
    )


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


# ------------------------------------------------------------
# Budgeting & Category Spend Limits Endpoints
# ------------------------------------------------------------

@profile_bp.route("/budgets", methods=["GET"])
def get_budgets():
    """GET /user-data/budgets?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    result = BudgetService.get_budgets(email=email)
    return jsonify(result), 200


@profile_bp.route("/budgets", methods=["POST"])
def save_budget():
    """POST /user-data/budgets
    Body: { email: "...", category: "...", limit: 15000 }
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    category = data.get("category", "").strip()
    limit = data.get("limit")

    if not category or limit is None:
        return jsonify({
            "success": False,
            "message": "Category and valid limit amount are required."
        }), 400

    result = BudgetService.save_budget(email=email, category=category, limit=limit)
    status_code = 200 if result.get("success") else 400
    return jsonify(result), status_code


@profile_bp.route("/budgets", methods=["DELETE"])
def delete_budget():
    """DELETE /user-data/budgets?email=user@example.com&category=Food"""
    email = request.args.get("email", "").strip().lower()
    category = request.args.get("category", "").strip()

    if not category:
        return jsonify({
            "success": False,
            "message": "Category name is required to delete budget limit."
        }), 400

    result = BudgetService.delete_budget(email=email, category=category)
    return jsonify(result), 200


# ------------------------------------------------------------
# Financial Health Report & PDF Generation Endpoints
# ------------------------------------------------------------

@profile_bp.route("/report", methods=["GET"])
def get_financial_report():
    """GET /user-data/report?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    report_data = ReportService.generate_report_data(email=email)
    return jsonify(report_data), 200


@profile_bp.route("/report/html", methods=["GET"])
def get_printable_report_html():
    """GET /user-data/report/html?email=user@example.com
    Returns printable HTML string with inline styling for PDF export / browser print.
    """
    email = request.args.get("email", "").strip().lower()
    html_content = ReportService.generate_printable_html(email=email)
    return Response(html_content, mimetype="text/html")


# ------------------------------------------------------------
# Risk Intelligence & AML Compliance Endpoints
# ------------------------------------------------------------

@profile_bp.route("/risk-intelligence", methods=["GET"])
def get_risk_intelligence():
    """GET /user-data/risk-intelligence?email=user@example.com"""
    email = request.args.get("email", "").strip().lower()
    risk_data = RiskIntelligenceService.analyze_account_risk(email=email)
    return jsonify(risk_data), 200


@profile_bp.route("/risk-intelligence/resolve", methods=["POST"])
def resolve_risk_flag():
    """POST /user-data/risk-intelligence/resolve
    Body: {"flag_id": "...", "resolution": "verified" | "disputed" | "dismissed"}
    """
    data = request.get_json() or {}
    flag_id = data.get("flag_id", "")
    resolution = data.get("resolution", "verified")
    res = RiskIntelligenceService.resolve_flag(flag_id=flag_id, resolution=resolution)
    return jsonify(res), 200


# ------------------------------------------------------------
# Tax Optimization & Simulation Endpoints
# ------------------------------------------------------------

@profile_bp.route("/tax-calculator", methods=["GET"])
def get_tax_profile():
    """GET /user-data/tax-calculator?email=user@example.com
    Auto-populates from user monthly income and calculates baseline comparison.
    """
    email = request.args.get("email", "").strip().lower()
    user_data = ProfileService.get_profile(email=email if email else None)
    user = user_data.get("user") or {}

    monthly_income = float(user.get("monthly_income") or 0.0)
    annual_gross = monthly_income * 12 if monthly_income > 0 else 1200000.0

    # Auto-detect any known 80C candidates (e.g. mutual funds / ELSS, PF)
    mf = float(user.get("mutual_funds") or 0.0)
    est_80c = min(mf, 150000.0) if mf > 0 else 50000.0

    comparison = TaxService.compare_regimes(
        gross_income=annual_gross,
        sec_80c=est_80c,
        sec_80d=25000.0,
        hra=0.0,
        home_loan_interest_24b=0.0,
        nps_80ccd_1b=0.0,
        is_salaried=True
    )
    comparison["user_profile"] = {
        "monthly_income": monthly_income,
        "estimated_annual_income": annual_gross,
        "auto_detected_80c": est_80c
    }
    return jsonify(comparison), 200


@profile_bp.route("/tax-calculator/simulate", methods=["POST"])
def simulate_tax():
    """POST /user-data/tax-calculator/simulate
    Body: {
      gross_income, sec_80c, sec_80d, hra, home_loan_interest_24b,
      nps_80ccd_1b, other_exemptions, is_salaried
    }
    """
    data = request.get_json() or {}
    comparison = TaxService.compare_regimes(
        gross_income=float(data.get("gross_income", 0.0)),
        sec_80c=float(data.get("sec_80c", 0.0)),
        sec_80d=float(data.get("sec_80d", 0.0)),
        hra=float(data.get("hra", 0.0)),
        home_loan_interest_24b=float(data.get("home_loan_interest_24b", 0.0)),
        nps_80ccd_1b=float(data.get("nps_80ccd_1b", 0.0)),
        other_exemptions=float(data.get("other_exemptions", 0.0)),
        is_salaried=bool(data.get("is_salaried", True))
    )
    return jsonify(comparison), 200


# ------------------------------------------------------------
# Recurring Subscriptions & Upcoming Bill Radar Endpoints
# ------------------------------------------------------------

@profile_bp.route("/subscriptions", methods=["GET"])
def get_subscriptions():
    """GET /user-data/subscriptions?email=user@example.com
    Detects recurring bills and upcoming debits in next 7 days.
    """
    email = request.args.get("email", "").strip().lower()
    subs = SubscriptionService.get_subscriptions(email=email)
    return jsonify(subs), 200


# ------------------------------------------------------------
# Database Management & Migration Endpoints
# ------------------------------------------------------------

@profile_bp.route("/db/status", methods=["GET"])
def get_db_status():
    """GET /user-data/db/status"""
    status = DBMigrationService.get_database_status()
    return jsonify({"success": True, "database": status}), 200


@profile_bp.route("/db/migrate", methods=["POST"])
def trigger_db_migration():
    """POST /user-data/db/migrate
    Syncs/migrates CSV datasets into SQLite relational database.
    """
    result = DBMigrationService.migrate_from_csvs()
    db_status = DBMigrationService.get_database_status()
    return jsonify({
        "success": True,
        "migration_stats": result,
        "database": db_status
    }), 200




