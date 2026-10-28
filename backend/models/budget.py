from datetime import datetime
from extensions import db


class Budget(db.Model):
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_email = db.Column(db.String(120), nullable=False, index=True)
    category = db.Column(db.String(60), nullable=False)
    monthly_limit = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.String(40), default=lambda: datetime.utcnow().isoformat())

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "category": self.category,
            "monthly_limit": self.monthly_limit,
            "created_at": self.created_at
        }

