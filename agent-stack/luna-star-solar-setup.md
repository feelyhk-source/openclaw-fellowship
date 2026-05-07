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

The Star and Solar Telegram accounts are intentionally `enabled: false` until
real bot tokens are supplied. This prevents failed startup loops or accidental
placeholder-token polling.

## Token Setup

Create two Telegram bots with BotFather and store the tokens locally:

```bash
export OPENCLAW_TELEGRAM_STAR_BOT_TOKEN="..."
export OPENCLAW_TELEGRAM_SOLAR_BOT_TOKEN="..."
```

For launchd/OpenClaw app usage, put those environment variables in the service
environment or another local secret provider. Do not commit token values.

After tokens are available, enable the accounts:

```bash
openclaw config set channels.telegram.accounts.star.enabled true --strict-json
openclaw config set channels.telegram.accounts.solar.enabled true --strict-json
openclaw config validate
openclaw gateway restart
```

If `config set` cannot set nested booleans cleanly on this OpenClaw build, edit
`~/.openclaw/openclaw.json` and change only these two values:

```json
{
  "channels": {
    "telegram": {
      "accounts": {
        "star": { "enabled": true },
        "solar": { "enabled": true }
      }
    }
  }
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

Expected before Star/Solar tokens are added:

- Config is valid.
- Luna, Star, and Solar agents exist.
- Star and Solar identity names display separately.
- Star/Solar Telegram accounts exist but are disabled.

Expected after tokens are added and accounts are enabled:

- Telegram channel status shows the Star and Solar accounts as configured.
- Direct messages to Star route to Codex.
- Direct messages to Solar route to Claude.
