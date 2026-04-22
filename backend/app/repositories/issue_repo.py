from typing import Optional
from datetime import datetime, timezone
from ..extensions import db
from ..models import Issue


def get_by_project(project_id: int) -> list:
    return (
        Issue.query
        .filter_by(project_id=project_id)
        .order_by(Issue.created_at.desc())
        .all()
    )


def get_by_id(issue_id: int) -> Optional[Issue]:
    return db.session.get(Issue, issue_id)


def create(title: str, description: str, priority: str, project_id: int) -> Issue:
    iss = Issue(
        title=title,
        description=description,
        priority=priority,
        project_id=project_id,
    )
    db.session.add(iss)
    db.session.commit()
    return iss


def update(iss: Issue, **fields) -> Issue:
    for k, v in fields.items():
        setattr(iss, k, v)
    iss.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return iss


def delete(iss: Issue) -> None:
    db.session.delete(iss)
    db.session.commit()
