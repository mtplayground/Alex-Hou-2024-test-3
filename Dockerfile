FROM python:3.13-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN python -m venv /opt/venv

ENV PATH="/opt/venv/bin:${PATH}"

COPY requirements.txt ./

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:${PATH}"

WORKDIR /app

RUN adduser --disabled-password --gecos "" appuser

COPY --from=builder /opt/venv /opt/venv
COPY app ./app
COPY wsgi.py ./wsgi.py
COPY .env.example ./.env.example

USER appuser

EXPOSE 8080

CMD ["sh", "-c", "gunicorn --bind ${HOST:-0.0.0.0}:${PORT:-8080} wsgi:app"]
