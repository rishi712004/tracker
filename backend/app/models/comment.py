from datetime import datetime, timezone
from ..extensions import db


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
    issue_id = db.Column(db.Integer, db.ForeignKey("issues.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    issue = db.relationship("Issue", back_populates="comments")

    def to_dict(self):
        return {
            "id": self.id,
            "body": self.body,
            "issue_id": self.issue_id,
            "created_at": self.created_at.isoformat(),
        }
