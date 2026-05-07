# Tokenless GitHub Policy

Commit only durable logic and setup instructions.

Safe to commit:

- Agent names, roles, model IDs, routing policy, and fallback policy.
- Environment variable names such as `OPENCLAW_TELEGRAM_STAR_BOT_TOKEN`.
- Sanitized config examples.
- Recovery runbooks and checklist policy.

Never commit:

- Telegram bot tokens.
- OpenClaw gateway tokens.
- OAuth auth-state files.
- Anthropic, OpenAI, Gemini, Ollama, Brave, fal, or other API keys.
- Full session logs unless manually scrubbed.
- `.env` files.

Token storage rule:

- Put Star bot token in `OPENCLAW_TELEGRAM_STAR_BOT_TOKEN`.
- Put Solar bot token in `OPENCLAW_TELEGRAM_SOLAR_BOT_TOKEN`.
- Keep the actual values in a local shell profile, launchd environment, Keychain,
  or another secret store. Do not write values into tracked files.
