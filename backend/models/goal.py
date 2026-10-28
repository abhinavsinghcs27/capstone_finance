from datetime import datetime
from extensions import db


class Goal(db.Model):
    __tablename__ = "goals"

    id = db.Column(db.String(64), primary_key=True)
    user_email = db.Column(db.String(120), nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(60), default="General")
    target_amount = db.Column(db.Float, nullable=False, default=0.0)
    current_amount = db.Column(db.Float, nullable=False, default=0.0)
    target_date = db.Column(db.String(30), nullable=False)
    created_at = db.Column(db.String(40), default=lambda: datetime.utcnow().isoformat())

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "title": self.title,
            "category": self.category,
            "target_amount": self.target_amount,
            "current_amount": self.current_amount,
            "target_date": self.target_date,
            "created_at": self.created_at
        }

