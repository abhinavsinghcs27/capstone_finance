from datetime import datetime
from extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), default="")
    auth_type = db.Column(db.String(20), default="local")  # 'local', 'google'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 1-to-1 Relationship with Financial Profile
    financial_profile = db.relationship("FinancialProfile", backref="user", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "auth_type": self.auth_type,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
