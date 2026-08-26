import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "finance-ai-secret-key-2026")
    
    GOOGLE_CLIENT_ID = os.getenv(
        "GOOGLE_CLIENT_ID",
        os.getenv(
            "GOOGLE_CLINT_ID",
            "901639314753-ee9i94rc2ra17k8jk5o5mq4bobodab82.apps.googleusercontent.com"
        )
    )
