#!/usr/bin/env bash
# Local Hermes runner for OpenClaw-owned Telegram/workspace flows.

set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
export HERMES_INFERENCE_PROVIDER="${HERMES_INFERENCE_PROVIDER:-custom}"
export HERMES_INFERENCE_MODEL="${HERMES_INFERENCE_MODEL:-qwen3.5:cloud}"
export OPENAI_BASE_URL="${OPENAI_BASE_URL:-http://127.0.0.1:11434/v1}"
export OPENAI_API_KEY="${OPENAI_API_KEY:-ollama-local}"

WORKDIR="${HERMES_OPENCLAW_WORKDIR:-$HOME/.openclaw/workspace}"

usage() {
  cat <<'EOF'
Usage:
  hermes-local.sh ask <prompt>
  hermes-local.sh status
  hermes-local.sh doctor

Policy:
  - Telegram remains owned by OpenClaw native Telegram.
  - Hermes uses local Ollama's OpenAI-compatible endpoint for routine work.
  - Claude/Codex are escalation tools, not default periodic runtimes.
EOF
}

case "${1:-}" in
  ask)
    shift
    [ $# -gt 0 ] || { usage >&2; exit 1; }
    cd "$WORKDIR"
    hermes -z "$*" --provider "$HERMES_INFERENCE_PROVIDER" --model "$HERMES_INFERENCE_MODEL"
    ;;
  status)
    hermes status
    ;;
  doctor)
    hermes doctor
    ;;
  *)
    usage
    exit 1
    ;;
esac
