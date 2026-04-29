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
    css/
      styles.css
    js/
      calculator.js
  templates/
    .keep
    index.html
wsgi.py
requirements.txt
package.json
.env.example
Dockerfile
docker-compose.yml
tests/
  calculator.test.js
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
- Core calculator state and arithmetic live in `app/static/js/calculator.js` as pure functions.
- JavaScript unit tests run with the built-in Node test runner via `npm test`.
- Copy `.env.example` to `.env` and adjust values for local development.
- Docker support is included with a multi-stage `Dockerfile` and `docker-compose.yml`.
