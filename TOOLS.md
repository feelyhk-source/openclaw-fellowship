# TOOLS.md

Keep environment notes short. Prefer local OpenClaw/Ollama Cloud for routine work.

- Default routine model: `ollama/qwen3.5:cloud`.
- Do not route ordinary chat to `qwen3-coder-next:cloud`; reserve it for explicit coding-model requests.
- Never claim execution from intent alone. Report only completed command/tool results.
- Telegram chat is handled by OpenClaw native Telegram, not the old bridge processes.
- Full local owner permissions are enabled in OpenClaw config; group access is still allowlisted.
- Memory: Honcho is active for Hermes. Use Hermes/Honcho for durable recall; do not dump Honcho memory into every OpenClaw Telegram turn.
- Paperclip: local server is configured at `http://127.0.0.1:3100`; `hermes_local` and `openclaw_gateway` adapters are loaded. Use `/Users/ki_mini/.openclaw/workspace/scripts/paperclip-local.sh status` to verify.
- Goal loop: `/Users/ki_mini/.openclaw/workspace/scripts/luna-goal.mjs` implements `/goal` style bounded continuation. Exact usage: `node /Users/ki_mini/.openclaw/workspace/scripts/luna-goal.mjs run "<objective>"`.
- Pet check: `/Users/ki_mini/.openclaw/workspace/scripts/luna-pet.mjs` implements `/pet` style stack smoke testing. Exact usage: `node /Users/ki_mini/.openclaw/workspace/scripts/luna-pet.mjs`.
- `/pet` is only a stack smoke test for OpenClaw, Hermes/Honcho, Paperclip, Ouroboros, Ascension Brain, and goal state. It is not a Codex visual pet or affection routine.
- Slash command guard: `/pet` and `/goal` are command intents, not requests for unrelated files. Do not mention `schedule.md` unless the user explicitly asks about it.
- Token saving: keep RTK-style compression and small startup context; summarize before Claude/Codex escalation.
- Image or multimodal work can use configured Gemini/Ollama models when explicitly needed.
- Read specific skill docs only when a task requires them.
