# Alex-Hou-2024-test-3

Initial repository setup for a Flask-based calculator application.

## Structure

```text
app/
  __init__.py
  static/
    .keep
  templates/
    .keep
requirements.txt
.env.example
Dockerfile
docker-compose.yml
README.md
```

## Dependencies

- Flask
- gunicorn
- python-dotenv

## Notes

- This issue establishes the Python project layout only.
- Environment variables are loaded with `python-dotenv` through `app/config.py`.
- Copy `.env.example` to `.env` and adjust values for local development.
- Docker support is included with a multi-stage `Dockerfile` and `docker-compose.yml`.
- The container command targets a Gunicorn WSGI entrypoint that will be added in the later Flask app wiring issue.
