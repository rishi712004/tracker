import json
from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from ..schemas import CommentCreate
from ..services import comment_service
from ..errors import NotFound

bp = Blueprint("comments", __name__, url_prefix="/api/issues/<int:issue_id>/comments")


def _err(e: ValidationError):
    return jsonify({"errors": json.loads(e.json())}), 422


@bp.get("/")
def list_comments(issue_id):
    try:
        comments = comment_service.list_comments(issue_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return jsonify([c.to_dict() for c in comments])


@bp.post("/")
def create_comment(issue_id):
    try:
        data = CommentCreate.model_validate(request.get_json() or {})
    except ValidationError as e:
        return _err(e)

    try:
        c = comment_service.create_comment(body=data.body, issue_id=issue_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404

    return jsonify(c.to_dict()), 201


@bp.delete("/<int:comment_id>")
def delete_comment(issue_id, comment_id):
    try:
        comment_service.delete_comment(comment_id)
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    return "", 204
