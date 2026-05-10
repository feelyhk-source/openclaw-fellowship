# Luna, Star, Solar Setup

Updated: 2026-05-10

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
- `channels.telegram.accounts.star` as a token-file-backed Star Telegram account.
- `channels.telegram.accounts.solar` as a token-file-backed Solar Telegram account.
- `agents.list[].id=shorts` as ShortsMaker for Paw Studio short-form launch
  assets.
- `agents.list[].id=sns` as SNSManager for Paw Studio publishing/calendar
  operations.

Current token state:

- Luna uses `/Users/ki_mini/.openclaw/secrets/telegram/luna.token` and is
  enabled.
- Solar uses `/Users/ki_mini/.openclaw/secrets/telegram/solar.token` and is
  enabled. Claude auth is verified through `luna-pet.mjs`; if Claude CLI ever
  returns login/quota failures, keep the Solar agent definition but temporarily
  disable the Telegram account until auth is healthy again.
- Star uses `/Users/ki_mini/.openclaw/secrets/telegram/star.token` and is
  enabled. The token was recovered from the archived 2026-05-05 Star bridge
  env and verified as `@Codex_star_bot` before being moved to the token file.

All agents have RTK-first context limits: startup context is off, bootstrap is
bounded to `bootstrapMaxChars=2500` and `bootstrapTotalMaxChars=7000`, routine
Ollama agents cap runtime context at `65536`, Star caps at `65536`, and Solar
caps at `32768`. Star defaults to low thinking so short direct messages do not
pay the full high-reasoning cost; ask Star explicitly for higher reasoning on
difficult coding tasks. Solar defaults to minimal thinking and should be raised
only for deeper reviews.

Default Ollama fallback order is `qwen3.5:cloud` primary, then
`glm-5.1:cloud`, `kimi-k2.6:cloud`, `deepseek-v4-pro:cloud`, and
`minimax-m2.7:cloud`. `qwen3-coder-next:cloud` may stay available as a named
model, but it must not be Luna's ordinary conversation model.

Star has a narrow OpenClaw tool allowlist so Codex is reserved for coding work
and does not see every possible OpenClaw tool by default. Even with that
allowlist, Codex ACP calls can still inject a large tool catalog, so Star should
be treated as a high-value coding expert, not a routine chat bot.

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

Expected after Star and Solar token files are present and enabled:

- Telegram channel status shows Luna, Star, and Solar running and connected.
- Direct messages to Star route to Codex.
- Direct messages to Solar route to Claude only when Claude auth is healthy.
- Luna routes coding tasks to Star/Codex, review/risk/policy tasks to
  Solar/Claude, and routine chat to Luna/Ollama.

Routing smoke:

```bash
node /Users/ki_mini/.openclaw/workspace/scripts/ascension-brain.mjs \
  "React 빌드 에러 원인 찾아서 코드 수정하고 테스트까지 돌려줘"

node /Users/ki_mini/.openclaw/workspace/scripts/ascension-brain.mjs \
  "출시 전 개인정보 처리방침과 정책 리스크를 검토해줘"
```

Expected:

- The coding prompt includes `star/codex` in `route.escalation`.
- The policy/risk prompt includes `solar/claude` in `route.escalation` and
  enables bounded Ouroboros self-check.

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
