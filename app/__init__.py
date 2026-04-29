"""Application package for the Flask calculator project."""

from __future__ import annotations

from flask import Flask

from .config import AppConfig, get_config, load_environment


def create_app() -> Flask:
    """Create and configure the Flask application instance."""

    load_environment()
    config = get_config()

    app = Flask(__name__, instance_relative_config=False)
    app.config.from_mapping(_build_flask_config(config))

    return app


def _build_flask_config(config: AppConfig) -> dict[str, object]:
    """Translate application config into Flask's config mapping."""

    return {
        "ENV": config.flask_env,
        "HOST": config.host,
        "PORT": config.port,
    }


__all__ = ["AppConfig", "create_app", "get_config", "load_environment"]
