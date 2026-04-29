"""Environment-backed configuration helpers for the Flask application."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


_DEFAULT_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


@dataclass(frozen=True, slots=True)
class AppConfig:
    """Application configuration loaded from environment variables."""

    flask_env: str
    host: str
    port: int


def load_environment(env_file: str | os.PathLike[str] | None = None) -> None:
    """Load environment variables from a dotenv file if one is present."""

    env_path = Path(env_file) if env_file is not None else _DEFAULT_ENV_PATH
    load_dotenv(env_path, override=False)


def _get_port() -> int:
    raw_port = os.getenv("PORT", "8080").strip()

    try:
        port = int(raw_port)
    except ValueError as exc:
        raise ValueError("PORT must be an integer.") from exc

    if port < 1 or port > 65535:
        raise ValueError("PORT must be between 1 and 65535.")

    return port


def get_config() -> AppConfig:
    """Return validated application configuration from the environment."""

    load_environment()

    return AppConfig(
        flask_env=os.getenv("FLASK_ENV", "development").strip() or "development",
        host=os.getenv("HOST", "0.0.0.0").strip() or "0.0.0.0",
        port=_get_port(),
    )
