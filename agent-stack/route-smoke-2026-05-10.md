# Route Smoke Test - 2026-05-10

Purpose: verify that the Luna/Hermes/OpenClaw stack routes routine, coding, and
risk-review tasks without breaking the token-saving architecture.

## Commands

```bash
node /Users/ki_mini/.openclaw/workspace/scripts/ascension-brain.mjs \
  "일반 대화야. 오늘 뭐부터 하면 좋을까?"

node /Users/ki_mini/.openclaw/workspace/scripts/ascension-brain.mjs \
  "React 빌드 에러 원인 찾아서 코드 수정하고 테스트까지 돌려줘"

node /Users/ki_mini/.openclaw/workspace/scripts/ascension-brain.mjs \
  "출시 전 개인정보 처리방침과 정책 리스크를 검토해줘"

openclaw config validate
openclaw channels status --probe
node /Users/ki_mini/.openclaw/workspace/scripts/luna-pet.mjs
```

## Results

- Routine chat routed to Luna with `ollama/qwen3.5:cloud`; no Hermes,
  Paperclip, Ouroboros, Star, or Solar escalation.
- Coding/build/test prompt routed through Hermes planning and OpenClaw
  execution, with `star/codex` escalation and Paperclip recovery enabled.
- Policy/privacy risk prompt routed through Hermes planning and Luna execution,
  with `solar/claude` escalation, Paperclip recovery, and bounded Ouroboros
  self-check enabled.
- `openclaw config validate` passed.
- Telegram channel probe showed Luna, Solar, and Star enabled, configured,
  running, connected, and working.
- `/pet` smoke returned `PET_OK`.

## Operating Notes

- Star is intentionally Codex-only and should receive compact RTK briefs for
  code work. Direct routine chat with Star is expensive because the Codex ACP
  runtime still injects a large tool catalog.
- Solar is Claude-only for reasoning/review/risk. Use it for architecture,
  policy, launch, privacy, and strategy checks rather than everyday chat.
- Luna remains the fast default coordinator; Hermes/Honcho handles durable
  planning and memory; Paperclip holds checklists; Ouroboros is bounded and
  explicit for repeated-mistake prevention.
