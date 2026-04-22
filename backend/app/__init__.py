from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate


def create_app(config_object="config.DevelopmentConfig"):
    flask_app = Flask(__name__)
    flask_app.config.from_object(config_object)

    CORS(flask_app)
    db.init_app(flask_app)
    migrate.init_app(flask_app, db)

    from .routes import projects_bp, issues_bp, comments_bp
    flask_app.register_blueprint(projects_bp)
    flask_app.register_blueprint(issues_bp)
    flask_app.register_blueprint(comments_bp)

    return flask_app
