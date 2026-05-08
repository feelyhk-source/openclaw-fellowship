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
- `agents.list[].id=shorts` as ShortsMaker for Paw Studio short-form launch
  assets.
- `agents.list[].id=sns` as SNSManager for Paw Studio publishing/calendar
  operations.

Current token state:

- Luna uses `/Users/ki_mini/.openclaw/secrets/telegram/luna.token` and is
  enabled.
- Solar uses `/Users/ki_mini/.openclaw/secrets/telegram/solar.token` and is
  enabled.
- Star uses `/Users/ki_mini/.openclaw/secrets/telegram/star.token` and is
  enabled. The token was recovered from the archived 2026-05-05 Star bridge
  env and verified as `@Codex_star_bot` before being moved to the token file.

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

If Star is ever reset or disabled, verify the token file and re-enable the
account:

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

Expected after Star token is added and Star is enabled:

- Telegram channel status shows Luna, Solar, and Star accounts as configured.
- Direct messages to Star route to Codex.
- Direct messages to Solar route to Claude.

## Paw Studio Growth Agents

ShortsMaker and SNSManager are local OpenClaw agents, not separate Telegram bots
yet. They should be invoked through Luna/Hermes until separate bot tokens are
created.

- ShortsMaker: makes Paw Studio ad shorts scripts, shot lists, media prompts,
  edit checklists, and campaign variants. Uses Ollama Cloud by default and
  escalates to Star for automation code, Solar for strategy/risk review, and
  Gemini/image-video tools only when media generation is needed.
- SNSManager: manages platform calendar, upload checklists, captions, hashtags,
  and analytics summaries. Uses Ollama Cloud by default and requires explicit
  human approval before public posting, deleting, DMs, or ad spend.
- Paperclip remains the durable checklist store for campaign direction and
  context-loss recovery.
- Ouroboros is the explicit self-check loop before repeated campaign templates
  or automation rules are treated as stable.
