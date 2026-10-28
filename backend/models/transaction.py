from datetime import datetime
from extensions import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.String(64), primary_key=True)
    user_email = db.Column(db.String(120), nullable=False, index=True)
    date = db.Column(db.String(30), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    type = db.Column(db.String(30), default="expense")  # 'income', 'expense', 'investment'
    category = db.Column(db.String(60), default="Other")
    source = db.Column(db.String(100), default="Manual Entry")
    created_at = db.Column(db.String(40), default=lambda: datetime.utcnow().isoformat())

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "date": self.date,
            "description": self.description,
            "amount": self.amount,
            "type": self.type,
            "category": self.category,
            "source": self.source,
            "created_at": self.created_at
        }

