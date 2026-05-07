# Luna, Star, Solar Setup

Updated: 2026-05-08

## Roles

- Luna: main OpenClaw assistant. Uses Ollama Cloud by default for routine
  Telegram, local execution, browser, filesystem, and device work.
- Star: dedicated Codex agent. Uses `openai-codex/gpt-5.5` with
  `agentRuntime.id=codex` for coding, repo analysis, implementation, tests, and
  PR-style work.
- Solar: dedicated Claude agent. Uses `anthropic/claude-sonnet-4-6` with
  `agentRuntime.id=claude-cli` for architecture, deep reasoning, code review,
  debugging strategy, and careful written analysis.

## Current Local State

`~/.openclaw/openclaw.json` has:

- `agents.list[].id=main` as Luna.
- `agents.list[].id=star` as Star with Codex runtime.
- `agents.list[].id=solar` as Solar with Claude runtime.
- Star workspace is `/Users/ki_mini/.openclaw/workspaces/star` so its
  `IDENTITY.md` displays as Star instead of inheriting Luna's workspace
  identity.
- Solar workspace is `/Users/ki_mini/.openclaw/workspaces/solar` so its
  `IDENTITY.md` displays as Solar instead of inheriting Luna's workspace
  identity.
- `channels.telegram.accounts.star` as an env-backed Star Telegram account.
- `channels.telegram.accounts.solar` as an env-backed Solar Telegram account.

Current token state:

- Luna uses `/Users/ki_mini/.openclaw/secrets/telegram/luna.token` and is
  enabled.
- Solar uses `/Users/ki_mini/.openclaw/secrets/telegram/solar.token` and is
  enabled.
- Star is configured to use
  `/Users/ki_mini/.openclaw/secrets/telegram/star.token`, but remains disabled
  until that token file exists.

Star staying disabled prevents failed startup loops or accidental
placeholder-token polling.

All three agents have RTK-first context limits: small startup context, bounded
memory reads, bounded tool results, and short Paperclip/Hermes handoff summaries
before Codex/Claude/Gemini escalation.

## Token Setup

Create missing Telegram bots with BotFather and store the tokens locally.
Preferred token-file setup:

```bash
mkdir -p /Users/ki_mini/.openclaw/secrets/telegram
printf '%s\n' 'PASTE_STAR_TOKEN_HERE' > /Users/ki_mini/.openclaw/secrets/telegram/star.token
chmod 600 /Users/ki_mini/.openclaw/secrets/telegram/star.token
```

Environment variables are also acceptable for discovery, but OpenClaw runtime
uses token files so tokens do not live inside `openclaw.json`. Do not commit
token values.

After the Star token is available, enable the account:

```bash
openclaw config set channels.telegram.accounts.star.enabled true --strict-json
openclaw config validate
openclaw gateway restart
```

If `config set` cannot set nested booleans cleanly on this OpenClaw build, edit
`~/.openclaw/openclaw.json` and change only these two values:

```json
{
  "channels": { "telegram": { "accounts": { "star": { "enabled": true } } } }
}
```

## Direct And Group Use

Direct use:

- Message Luna for routine assistant and local execution work.
- Message Star for Codex coding work.
- Message Solar for Claude review, architecture, and reasoning work.

Group use:

- Put Luna, Star, and Solar bots in the same Telegram group.
- Keep `requireMention: true` in group config so they do not all reply to every
  message.
- Address each bot by name or mention.
- Use Luna as the coordinator when the task is mixed: Luna keeps the local
  OpenClaw execution context, Star handles coding, Solar handles review and
  reasoning.

## Memory And Checklist Policy

- Hermes remains the planning and learning layer.
- Honcho is active only for Hermes memory.
- Paperclip `Local Agent Ops` is the durable checklist board for context loss,
  compression, and handoff recovery.
- Ouroboros is explicit-only for spec-first planning, self-checking, and
  repeated-mistake prevention.

## Escalation Policy

- Routine: Ollama Cloud through OpenClaw/Luna.
- Coding: Star/Codex.
- Architecture/review/deep reasoning: Solar/Claude.
- Image/video/multimodal: Gemini where available, with Codex/Claude used only
  for prompt/code/review support.

## Verification

Run:

```bash
openclaw config validate
openclaw agents list --bindings --json
openclaw channels status --probe
```

Expected while Star token is still missing:

- Config is valid.
- Luna, Star, and Solar agents exist.
- Star and Solar identity names display separately.
- Luna and Solar Telegram accounts are enabled.
- Star Telegram account exists but is disabled.

Expected after Star token is added and Star is enabled:

- Telegram channel status shows Luna, Solar, and Star accounts as configured.
- Direct messages to Star route to Codex.
- Direct messages to Solar route to Claude.
