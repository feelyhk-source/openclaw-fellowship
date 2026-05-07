# Local Hermes + OpenClaw Setup

Updated: 2026-05-08

## Goal

Run the agent stack locally without a VPS.

- Hermes: learning loop, reusable skills, session recall, interruption-friendly task management.
- OpenClaw: Telegram gateway, group/topic handling, local execution, browser/filesystem/device control.
- Ollama Cloud: default model path for routine and periodic work.
- Claude Code and Codex auth: escalation path only for hard coding/reasoning/review tasks.

## Active Routing

1. Telegram messages enter through OpenClaw native Telegram.
2. OpenClaw uses Ollama Cloud by default.
3. Hermes is the memory/planning brain and uses Honcho for durable recall.
4. Hermes directs OpenClaw when work needs Telegram, local execution, browser, filesystem, or device control.
5. Paperclip holds durable todo/checklist memory for recovery after context loss, session rollover, or compression.
6. Ouroboros is used explicitly for spec-first planning, self-checking, and repeated-mistake prevention.
7. Claude/Codex/Gemini are used only when routine Ollama Cloud models are not enough or the user explicitly asks for escalation.

## Hermes Runtime

- Official Hermes is installed at `/Users/ki_mini/.hermes/hermes-agent`.
- CLI shim: `/Users/ki_mini/.local/bin/hermes`.
- Active model route: Hermes uses local Ollama's OpenAI-compatible endpoint at `http://127.0.0.1:11434/v1`.
- Active default model: `deepseek-v4-flash:cloud`.
- OpenClaw helper: `/Users/ki_mini/.openclaw/workspace/scripts/hermes-local.sh`.

## Honcho Memory

- Honcho is configured for Hermes only, not OpenClaw Telegram.
- Local Honcho self-host is active at `http://127.0.0.1:8000`.
- Honcho source: `/Users/ki_mini/Projects/tool/honcho`.
- Honcho API launchd service: `/Users/ki_mini/Library/LaunchAgents/com.local.honcho-api.plist` (`com.local.honcho-api`).
- Honcho deriver launchd service: `/Users/ki_mini/Library/LaunchAgents/com.local.honcho-deriver.plist` (`com.local.honcho-deriver`).
- PostgreSQL runs through Homebrew `postgresql@17`; database `honcho` has pgvector enabled.
- Embeddings use local Ollama `granite-embedding` through the OpenAI-compatible padding proxy at `http://127.0.0.1:11435/v1`.
- Embedding proxy launchd service: `/Users/ki_mini/Library/LaunchAgents/com.local.honcho-embed-proxy.plist` (`com.local.honcho-embed-proxy`).
- Honcho deriver, summary, and dialectic LLM calls use local Ollama OpenAI-compatible endpoint `http://127.0.0.1:11434/v1` with `qwen3.5:cloud`.
- `DREAM_ENABLED=false` to avoid surprise periodic token spend.
- Hermes memory provider is `honcho`; verify with `hermes memory status`.
- Low-token Honcho policy is stored at `/Users/ki_mini/.hermes/honcho.json`: tools-mode recall, bounded context, shallow dialectic depth, slower recall cadence, and session-level writes.
- Honcho periodic load is intentionally reduced: deriver poll interval is 15s, vector reconciliation is hourly, message/context caps are bounded.
- Helper: `/Users/ki_mini/.openclaw/workspace/scripts/honcho-hermes-enable.sh`.
- Reconnect with `honcho-hermes-enable.sh local http://127.0.0.1:8000` if Hermes is ever reset to built-in memory only.

## Active Tools

- Memory: Honcho is the current preferred memory backend for Hermes.
- Token saving: RTK-style compression remains active through `rtk-optimizer` and small bootstrap context.
- Paperclip: local Paperclip is configured under `/Users/ki_mini/.paperclip/instances/default` and runs on `http://127.0.0.1:3100`.
- Paperclip adapter status: `hermes_local` and `openclaw_gateway` are loaded as Paperclip builtin adapters. The external Hermes adapter source is also cloned and built at `/Users/ki_mini/Projects/tool/hermes-paperclip-adapter`.
- Paperclip helper: `/Users/ki_mini/.openclaw/workspace/scripts/paperclip-local.sh`.
- Paperclip launchd service: `/Users/ki_mini/Library/LaunchAgents/com.local.paperclip.plist` (`com.local.paperclip`).
- Paperclip company `Local Agent Ops` is the durable checklist board for recovery and direction-setting.
- Current Paperclip checklist issues: `LOC-1` Ouroboros evaluation, `LOC-2` memory policy, `LOC-3` agent stack recovery, `LOC-4` Paperclip orchestration.
- Paperclip CLI default context points to `Local Agent Ops`, so `paperclipai issue list` works without manually passing a company id.
- Paperclip agents are not created by default; create them in the Paperclip UI only when orchestration is needed.
- Paperclip backups are daily with 14-day retention to avoid noisy hourly background work.
- Mempalace and mem0 remain optional and are not active in the default runtime.

## Ouroboros

- Ouroboros candidate selected: `/Users/ki_mini/Projects/tool/ouroboros-q00`.
- Installed command: `ouroboros` from editable `ouroboros-ai[mcp,litellm]`.
- Hermes-only runtime setup is applied; Codex setup was intentionally not run to preserve token-minimal Codex defaults.
- Hermes skills are installed under `/Users/ki_mini/.hermes/skills/autonomous-ai-agents/ouroboros/`.
- Ouroboros MCP is registered in `/Users/ki_mini/.hermes/config.yaml`.
- Ouroboros config is set to `orchestrator.runtime_backend: hermes` and `llm.backend: litellm`.
- Ouroboros LiteLLM uses the local Ollama OpenAI-compatible endpoint at `http://127.0.0.1:11434/v1` with `deepseek-v4-flash:cloud` by default.
- Stage 3 consensus is disabled by default and `max_parallel_workers` is `1` to avoid surprise token spend.
- Use Ouroboros explicitly for larger spec-first workflows, self-checking, or recurring-mistake prevention, for example inside Hermes with `ooo interview "..."` or from terminal with `ouroboros init start --llm-backend litellm "..."`.
- Ouroboros timeouts and iteration caps are bounded for local use: 4 default turns, 6 iterations per acceptance criterion, 30m idle timeout, 60m no-progress timeout.

## Operating Opinion

Recommended control flow is Hermes -> OpenClaw.

Hermes should hold the working memory, Honcho recall, Paperclip checklist, and Ouroboros self-check habits. OpenClaw should remain the reliable hands: Telegram, group/topic handling, local tools, browser, filesystem, and device control. This avoids duplicate Telegram replies while still letting Hermes become smarter over time.

Escalation should stay explicit and task-shaped:

- Routine work: Ollama Cloud through the local OpenAI-compatible endpoint.
- Hard coding/review/deep reasoning: Codex or Claude.
- Gemini-specific strengths: image/video reasoning, multimodal review, and generation workflows when available.
- High-cost models should receive a summarized brief from Hermes/Paperclip, not the full memory dump.

## Telegram Policy

- Native OpenClaw Telegram is enabled.
- Existing bot token is preserved.
- Existing group allowlist is preserved.
- Group messages still require mention by default to avoid noisy replies.
- Old Solar/Luna/Codex bridge processes are stopped and archived.

## Archived Concepts

The old bridge and LOTR-themed concepts are archived at:

`/Users/ki_mini/.openclaw/archive/2026-05-05-hermes-openclaw-reset`

Archived items include:

- bridge project tree
- Red Book
- Mithril
- Palantir
- White Room
- Mempalace bridge skill
- bridge manager and old helper scripts

Do not re-enable these by default. Restore only when explicitly requested.
