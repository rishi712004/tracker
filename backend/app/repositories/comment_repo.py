from typing import Optional
from ..extensions import db
from ..models import Comment


def get_by_issue(issue_id: int) -> list:
    return (
        Comment.query
        .filter_by(issue_id=issue_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


def get_by_id(comment_id: int) -> Optional[Comment]:
    return db.session.get(Comment, comment_id)


def create(body: str, issue_id: int) -> Comment:
    c = Comment(body=body, issue_id=issue_id)
    db.session.add(c)
    db.session.commit()
    return c


def delete(c: Comment) -> None:
    db.session.delete(c)
    db.session.commit()
