"""Application routes."""

from flask import Blueprint, render_template


main_blueprint = Blueprint("main", __name__)


@main_blueprint.get("/")
def index() -> str:
    """Render the calculator landing page."""

    return render_template("index.html")
