from flask import Flask
from config import Config
from extensions import cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    cors.init_app(app)

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.profile import profile_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profile_bp, url_prefix="/user-data")

    @app.route("/health", methods=["GET"])
    def health_check():
        return {"status": "ok", "message": "FinanceAI Backend API is running"}, 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
