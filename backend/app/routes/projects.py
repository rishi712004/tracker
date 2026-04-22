import json
from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from ..schemas import ProjectCreate, ProjectUpdate
from ..services import project_service
from ..errors import NotFound

bp = Blueprint("projects", __name__, url_prefix="/api/projects")


def _err(e: ValidationError):
    return jsonify({"errors": json.loads(e.json())}), 422


@bp.get("/")
def list_projects():
    return jsonify([p.to_dict() for p in project_service.list_projects()])


@bp.post("/")
def create_project():
    try:
        data = ProjectCreate.model_validate(request.get_json() or {})
    except ValidationError as e:
        return _err(e)

    proj = project_service.create_project(name=data.name, description=data.description)
    return jsonify(proj.to_dict()), 201


@bp.get("/<int:project_id>")
def get_project(project_id):
    try:
        proj = project_service.get_project(project_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return jsonify(proj.to_dict())


@bp.patch("/<int:project_id>")
def update_project(project_id):
    try:
        data = ProjectUpdate.model_validate(request.get_json() or {})
    except ValidationError as e:
        return _err(e)

    try:
        proj = project_service.update_project(project_id, **data.model_dump(exclude_none=True))
    except NotFound as e:
        return jsonify({"error": str(e)}), 404

    return jsonify(proj.to_dict())


@bp.delete("/<int:project_id>")
def delete_project(project_id):
    try:
        project_service.delete_project(project_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return "", 204
