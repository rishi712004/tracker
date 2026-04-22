import json
from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from ..schemas import IssueCreate, IssueUpdate, IssueTransition
from ..services import issue_service
from ..errors import NotFound, InvalidTransition
from .. import transitions

bp = Blueprint("issues", __name__, url_prefix="/api/projects/<int:project_id>/issues")


def _err(e: ValidationError):
    return jsonify({"errors": json.loads(e.json())}), 422


@bp.get("/")
def list_issues(project_id):
    try:
        issues = issue_service.list_issues(project_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return jsonify([i.to_dict() for i in issues])


@bp.post("/")
def create_issue(project_id):
    try:
        data = IssueCreate.model_validate(request.get_json() or {})
    except ValidationError as e:
        return _err(e)

    try:
        iss = issue_service.create_issue(
            title=data.title,
            description=data.description,
            priority=data.priority,
            project_id=project_id,
        )
    except NotFound as e:
        return jsonify({"error": str(e)}), 404

    return jsonify(iss.to_dict()), 201


@bp.get("/<int:issue_id>")
def get_issue(project_id, issue_id):
    try:
        iss = issue_service.get_issue(issue_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return jsonify(iss.to_dict())


@bp.patch("/<int:issue_id>")
def update_issue(project_id, issue_id):
    try:
        data = IssueUpdate.model_validate(request.get_json() or {})
    except ValidationError as e:
        return _err(e)

    try:
        iss = issue_service.update_issue(issue_id, **data.model_dump(exclude_none=True))
    except NotFound as e:
        return jsonify({"error": str(e)}), 404

    return jsonify(iss.to_dict())


@bp.post("/<int:issue_id>/transition")
def transition_issue(project_id, issue_id):
    try:
        data = IssueTransition.model_validate(request.get_json() or {})
    except ValidationError as e:
        return _err(e)

    try:
        iss = issue_service.transition_issue(issue_id, data.status)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except InvalidTransition as e:
        return jsonify({"error": str(e)}), 422

    return jsonify(iss.to_dict())


@bp.delete("/<int:issue_id>")
def delete_issue(project_id, issue_id):
    try:
        issue_service.delete_issue(issue_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return "", 204


@bp.get("/<int:issue_id>/transitions")
def get_transitions(project_id, issue_id):
    try:
        iss = issue_service.get_issue(issue_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return jsonify({"current": iss.status, "allowed": transitions.allowed_from(iss.status)})
