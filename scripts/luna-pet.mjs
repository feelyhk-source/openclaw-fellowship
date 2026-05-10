#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";

function run(name, command, args, timeout = 60000) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout,
    maxBuffer: 1024 * 1024,
  });
  return {
    name,
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    durationMs: Date.now() - started,
    stdout: (result.stdout || "").slice(0, 2000),
    stderr: (result.stderr || "").slice(0, 1000),
  };
}

function claudeLoggedIn() {
  const result = run("claude-auth", "claude", ["auth", "status", "--json"], 15000);
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout || "{}");
  } catch {
    // Keep raw output below for debugging.
  }
  return {
    ...result,
    ok: Boolean(parsed?.loggedIn),
    parsed,
  };
}

function triadConfig() {
  const configPath = "/Users/ki_mini/.openclaw/openclaw.json";
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const agents = new Map((config.agents?.list || []).map((agent) => [agent.id, agent]));
  const accounts = config.channels?.telegram?.accounts || {};
  const workspaceFiles = [
    "/Users/ki_mini/.openclaw/workspace/AGENTS.md",
    "/Users/ki_mini/.openclaw/workspaces/star/AGENTS.md",
    "/Users/ki_mini/.openclaw/workspaces/solar/AGENTS.md",
    "/Users/ki_mini/.openclaw/workspaces/star/TOOLS.md",
    "/Users/ki_mini/.openclaw/workspaces/solar/TOOLS.md",
  ].map((path) => ({ path, chars: fs.statSync(path).size }));

  const main = agents.get("main");
  const star = agents.get("star");
  const solar = agents.get("solar");
  const ok =
    main?.model === "ollama/qwen3.5:cloud" &&
    star?.model === "openai-codex/gpt-5.5" &&
    String(solar?.model || "").includes("claude") &&
    accounts.default?.enabled !== false &&
    accounts.star?.enabled === true &&
    accounts.solar?.enabled === true &&
    workspaceFiles.every((file) => file.chars <= 2500);

  return {
    name: "triad-config",
    ok,
    configPath,
    agents: {
      luna: { model: main?.model, telegramEnabled: accounts.default?.enabled !== false },
      star: { model: star?.model, telegramEnabled: accounts.star?.enabled === true },
      solar: { model: solar?.model, telegramEnabled: accounts.solar?.enabled === true },
    },
    workspaceFiles,
  };
}

const checks = [
  run("openclaw-config", "openclaw", ["config", "validate"], 60000),
  run("openclaw-health", "openclaw", ["health", "--json"], 90000),
  triadConfig(),
  claudeLoggedIn(),
  run("hermes-memory", "hermes", ["memory", "status"], 60000),
  run("paperclip", "/Users/ki_mini/.openclaw/workspace/scripts/paperclip-local.sh", ["status"], 60000),
  run("ouroboros", "ouroboros", ["status", "health"], 60000),
  run("ascension-routine", "node", [
    "/Users/ki_mini/.openclaw/workspace/scripts/ascension-brain.mjs",
    "pet check: routine greeting",
  ]),
  run("goal-state", "node", [
    "/Users/ki_mini/.openclaw/workspace/scripts/luna-goal.mjs",
    "status",
    "--session",
    "luna-goal-main",
  ]),
];

const ok = checks.every((check) => check.ok);
process.stdout.write(
  JSON.stringify(
    {
      ok,
      checkedAt: new Date().toISOString(),
      summary: ok ? "PET_OK" : "PET_NEEDS_ATTENTION",
      checks,
    },
    null,
    2,
  ) + "\n",
);
process.exit(ok ? 0 : 1);
