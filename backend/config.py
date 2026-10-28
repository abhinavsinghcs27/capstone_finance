import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "finance-ai-secret-key-2026")
    
    # SQLAlchemy Database Configuration (SQLite default with PostgreSQL support)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'data', 'financeai.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GOOGLE_CLIENT_ID = os.getenv(
        "GOOGLE_CLIENT_ID",
        os.getenv(
            "GOOGLE_CLINT_ID",
            "901639314753-ee9i94rc2ra17k8jk5o5mq4bobodab82.apps.googleusercontent.com"
        )
    )
