from typing import Optional
from ..extensions import db
from ..models import Project


def get_all() -> list:
    return Project.query.order_by(Project.created_at.desc()).all()


def get_by_id(project_id: int) -> Optional[Project]:
    return db.session.get(Project, project_id)


def create(name: str, description: str) -> Project:
    proj = Project(name=name, description=description)
    db.session.add(proj)
    db.session.commit()
    return proj


def update(proj: Project, **fields) -> Project:
    for k, v in fields.items():
        setattr(proj, k, v)
    db.session.commit()
    return proj


def delete(proj: Project) -> None:
    db.session.delete(proj)
    db.session.commit()
