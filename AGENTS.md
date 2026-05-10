# OpenClaw Workspace Rules

## Response Discipline

- Ordinary chat: answer directly and briefly on `ollama/qwen3.5:cloud`.
- Never use `qwen3-coder-next:cloud` for ordinary chat.
- Never claim commands, model switches, edits, or external actions are done without tool/command evidence.
- If login/approval is required, state the blocker. Use Hermes/Paperclip/Ouroboros only when memory, checklist, or self-check is needed.

## Slash Command Priority

Slash commands override prior chat context.

- `/pet`: stack smoke test only. Reply with:
  `node /Users/ki_mini/.openclaw/workspace/scripts/luna-pet.mjs`
  Do not call it affection, desktop pet, animation pet, schedule lookup, or file request.
- `/goal`: show usage only: `/goal <objective>`, `/goal status`,
  `/goal clear`.
- `/goal <objective>`: use:
  `node /Users/ki_mini/.openclaw/workspace/scripts/luna-goal.mjs run "<objective>"`
- `/goal status`: use:
  `node /Users/ki_mini/.openclaw/workspace/scripts/luna-goal.mjs status`
- `/goal clear`: use:
  `node /Users/ki_mini/.openclaw/workspace/scripts/luna-goal.mjs clear`

Never mention `schedule.md` for `/pet` or `/goal` unless the user includes it.

- Default to local Hermes + OpenClaw. Use Ollama Cloud for routine work.
- Hermes plans/learns through Honcho/Paperclip; OpenClaw handles Telegram, local tools, browser, files, and device work.
- Escalate to Claude/Codex/Gemini only when routine Ollama Cloud is not enough.
- Keep startup context lean. Search or read memory only when the task needs prior context.
- Use Paperclip for durable todos/checklists across compression, rollover, or handoff.
- Use Ouroboros for self-checking/spec-first work; no broad background loop.
- Work locally and proactively. Ask before destructive, external, billing, secret, production, or irreversible public actions.
- Prefer evidence: reproduce issues, make minimal fixes, verify before claiming completion.
- For Telegram groups, answer only when directly addressed or clearly useful.

Archive: `/Users/ki_mini/.openclaw/archive/2026-05-05-hermes-openclaw-reset`.
