# Alex-Hou-2024-test-3

Initial repository setup for a Flask-based calculator application.

## Structure

```text
app/
  __init__.py
  config.py
  routes.py
  static/
    .keep
  templates/
    .keep
    index.html
wsgi.py
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

- Environment variables are loaded with `python-dotenv` through `app/config.py`.
- The Flask application is created through `app.create_app()` and exposed for Gunicorn in `wsgi.py`.
- The `/` route renders `app/templates/index.html`, and Flask serves static assets from `app/static/`.
- Copy `.env.example` to `.env` and adjust values for local development.
- Docker support is included with a multi-stage `Dockerfile` and `docker-compose.yml`.
