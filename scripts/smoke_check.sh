#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8080}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"
LOG_FILE="$(mktemp)"

cleanup() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$LOG_FILE"
}

trap cleanup EXIT

gunicorn --bind "${HOST}:${PORT}" wsgi:app >"$LOG_FILE" 2>&1 &
SERVER_PID="$!"

for _ in $(seq 1 40); do
  if curl -fsS "${BASE_URL}/" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "Gunicorn exited before serving requests." >&2
    cat "$LOG_FILE" >&2
    exit 1
  fi
  sleep 0.25
done

assert_http_200() {
  local path="$1"
  local output_file
  output_file="$(mktemp)"
  local status
  status="$(curl -sS -o "$output_file" -w "%{http_code}" "${BASE_URL}${path}")"

  if [ "$status" != "200" ]; then
    echo "Expected ${path} to return 200, got ${status}." >&2
    cat "$output_file" >&2
    rm -f "$output_file"
    exit 1
  fi

  if [ "$path" = "/" ] && ! grep -qi "<!doctype html" "$output_file"; then
    echo "Expected / to return rendered HTML." >&2
    rm -f "$output_file"
    exit 1
  fi

  rm -f "$output_file"
  echo "OK ${path} returned 200"
}

assert_http_200 "/"
assert_http_200 "/assets/css/styles.css"
assert_http_200 "/assets/js/calculator.js"

echo "Smoke check passed for ${BASE_URL}"
