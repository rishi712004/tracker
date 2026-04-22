from ..errors import NotFound
from ..repositories import comment_repo, issue_repo


def list_comments(issue_id: int):
    if not issue_repo.get_by_id(issue_id):
        raise NotFound("Issue", issue_id)
    return comment_repo.get_by_issue(issue_id)


def create_comment(body: str, issue_id: int):
    if not issue_repo.get_by_id(issue_id):
        raise NotFound("Issue", issue_id)
    return comment_repo.create(body=body, issue_id=issue_id)


def delete_comment(comment_id: int):
    c = comment_repo.get_by_id(comment_id)
    if not c:
        raise NotFound("Comment", comment_id)
    comment_repo.delete(c)
