from flask import Blueprint, jsonify

bp = Blueprint("health", __name__)

@bp.get("/")
def index():
    return jsonify({"status": "ok"})
