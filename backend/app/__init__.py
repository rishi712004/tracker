import os
from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate


def create_app(config_object=None):
    if config_object is None:
        env = os.environ.get("FLASK_ENV", "development")
        config_object = "config.ProductionConfig" if env == "production" else "config.DevelopmentConfig"

    flask_app = Flask(__name__)
    flask_app.config.from_object(config_object)

    frontend = os.environ.get("FRONTEND_URL", "*")
    CORS(flask_app, origins=[frontend, "http://localhost:5173"])

    db.init_app(flask_app)
    migrate.init_app(flask_app, db)

    from .routes import projects_bp, issues_bp, comments_bp
    flask_app.register_blueprint(projects_bp)
    flask_app.register_blueprint(issues_bp)
    flask_app.register_blueprint(comments_bp)

    return flask_app