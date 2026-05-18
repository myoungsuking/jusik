#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/.dev-server.pid"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/dev.log"

show_help() {
  cat <<EOF
Usage:
  ./start.sh              Show this help
  ./start.sh help         Show this help
  ./start.sh start        Start the development server
  ./start.sh stop         Stop the development server
  ./start.sh restart      Restart the development server
  ./start.sh log          Print recent logs and follow updates

Development URLs:
  Frontend: http://localhost:5173/
  Backend:  http://localhost:8787/
EOF
}

ensure_log_dir() {
  mkdir -p "$LOG_DIR"
}

is_running() {
  local pid="${1:-}"
  [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1
}

read_pid() {
  if [[ -f "$PID_FILE" ]]; then
    tr -d '[:space:]' < "$PID_FILE"
  fi
}

start_dev() {
  ensure_log_dir

  local existing_pid
  existing_pid="$(read_pid || true)"

  if is_running "$existing_pid"; then
    echo "Already running (pid $existing_pid)."
    echo "Log: $LOG_FILE"
    return 0
  fi

  rm -f "$PID_FILE"
  touch "$LOG_FILE"

  echo "Starting development server..."
  nohup bash -c 'cd "$1" && exec npm run dev' bash "$ROOT_DIR" >> "$LOG_FILE" 2>&1 &

  local pid=$!
  echo "$pid" > "$PID_FILE"

  sleep 1

  if is_running "$pid"; then
    echo "Started (pid $pid)."
    echo "Frontend: http://localhost:5173/"
    echo "Backend:  http://localhost:8787/"
    echo "Log: $LOG_FILE"
  else
    echo "Failed to start. Recent log:"
    tail -n 80 "$LOG_FILE"
    rm -f "$PID_FILE"
    return 1
  fi
}

stop_dev() {
  local pid
  pid="$(read_pid || true)"

  if ! is_running "$pid"; then
    echo "Development server is not running."
    rm -f "$PID_FILE"
    return 0
  fi

  echo "Stopping development server (pid $pid)..."
  kill "$pid" >/dev/null 2>&1 || true

  for _ in {1..20}; do
    if ! is_running "$pid"; then
      rm -f "$PID_FILE"
      echo "Stopped."
      return 0
    fi
    sleep 0.2
  done

  echo "Still running, forcing stop..."
  kill -9 "$pid" >/dev/null 2>&1 || true
  rm -f "$PID_FILE"
  echo "Stopped."
}

restart_dev() {
  stop_dev
  start_dev
}

show_log() {
  ensure_log_dir
  touch "$LOG_FILE"
  tail -n 120 -f "$LOG_FILE"
}

case "${1:-help}" in
  help|-h|--help)
    show_help
    ;;
  start)
    start_dev
    ;;
  stop)
    stop_dev
    ;;
  restart)
    restart_dev
    ;;
  log|logs)
    show_log
    ;;
  *)
    echo "Unknown command: $1"
    echo
    show_help
    exit 1
    ;;
esac
