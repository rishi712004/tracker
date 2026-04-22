from ..errors import NotFound
from ..repositories import project_repo


def list_projects():
    return project_repo.get_all()


def get_project(project_id: int):
    proj = project_repo.get_by_id(project_id)
    if not proj:
        raise NotFound("Project", project_id)
    return proj


def create_project(name: str, description: str):
    return project_repo.create(name=name, description=description)


def update_project(project_id: int, **fields):
    proj = get_project(project_id)
    return project_repo.update(proj, **fields)


def delete_project(project_id: int):
    proj = get_project(project_id)
    project_repo.delete(proj)
