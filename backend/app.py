from flask import Flask
from config import Config
from extensions import cors, db


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    cors.init_app(app)
    db.init_app(app)

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.profile import profile_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profile_bp, url_prefix="/user-data")

    # Initialize Database Schema & Seed Data from CSVs
    with app.app_context():
        import models  # Ensure all models are registered
        from services.db_migration_service import DBMigrationService
        DBMigrationService.init_database(app)

    @app.route("/health", methods=["GET"])
    def health_check():
        from services.db_migration_service import DBMigrationService
        db_status = DBMigrationService.get_database_status()
        return {
            "status": "ok",
            "message": "FinanceAI Backend API is running",
            "database": db_status
        }, 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
