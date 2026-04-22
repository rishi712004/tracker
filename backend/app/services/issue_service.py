from ..errors import NotFound
from ..repositories import issue_repo, project_repo
from .. import transitions


def list_issues(project_id: int):
    if not project_repo.get_by_id(project_id):
        raise NotFound("Project", project_id)
    return issue_repo.get_by_project(project_id)


def get_issue(issue_id: int):
    iss = issue_repo.get_by_id(issue_id)
    if not iss:
        raise NotFound("Issue", issue_id)
    return iss


def create_issue(title: str, description: str, priority: str, project_id: int):
    if not project_repo.get_by_id(project_id):
        raise NotFound("Project", project_id)
    return issue_repo.create(
        title=title,
        description=description,
        priority=priority,
        project_id=project_id,
    )


def update_issue(issue_id: int, **fields):
    iss = get_issue(issue_id)
    return issue_repo.update(iss, **fields)


def transition_issue(issue_id: int, new_status: str):
    iss = get_issue(issue_id)
    transitions.validate(iss.status, new_status)
    return issue_repo.update(iss, status=new_status)


def delete_issue(issue_id: int):
    iss = get_issue(issue_id)
    issue_repo.delete(iss)
