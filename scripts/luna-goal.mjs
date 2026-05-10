#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const stateDir = "/Users/ki_mini/.openclaw/workspace/goals";
const defaultSession = "luna-goal-main";

function ensureDir() {
  fs.mkdirSync(stateDir, { recursive: true });
}

function slug(s) {
  return String(s || defaultSession).replace(/[^a-zA-Z0-9_.:-]+/g, "-").slice(0, 80) || defaultSession;
}

function statePath(sessionId) {
  return path.join(stateDir, `${slug(sessionId)}.json`);
}

function load(sessionId) {
  const file = statePath(sessionId);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(state) {
  ensureDir();
  fs.writeFileSync(statePath(state.sessionId), `${JSON.stringify(state, null, 2)}\n`);
}

function usage() {
  process.stdout.write(`Usage:
  luna-goal.mjs set "<goal>" [--session luna-goal-main] [--max-turns 3]
  luna-goal.mjs run "<goal>" [--session luna-goal-main] [--max-turns 3]
  luna-goal.mjs status [--session luna-goal-main]
  luna-goal.mjs clear [--session luna-goal-main]

The loop asks Luna to produce one concrete next result per turn and to finish
with GOAL_DONE: yes when the stated goal is satisfied.
`);
}

const args = process.argv.slice(2);
const cmd = args.shift();
const sessionFlag = args.indexOf("--session");
const sessionId = sessionFlag >= 0 ? args[sessionFlag + 1] : defaultSession;
if (sessionFlag >= 0) args.splice(sessionFlag, 2);
const maxFlag = args.indexOf("--max-turns");
const maxTurns = maxFlag >= 0 ? Number(args[maxFlag + 1]) : 3;
if (maxFlag >= 0) args.splice(maxFlag, 2);

if (!cmd || cmd === "--help" || cmd === "-h") {
  usage();
  process.exit(0);
}

if (cmd === "status") {
  const state = load(sessionId);
  if (!state) {
    process.stdout.write(JSON.stringify({ ok: true, active: false, sessionId }, null, 2) + "\n");
  } else {
    process.stdout.write(JSON.stringify({ ok: true, ...state }, null, 2) + "\n");
  }
  process.exit(0);
}

if (cmd === "clear") {
  const file = statePath(sessionId);
  if (fs.existsSync(file)) fs.rmSync(file);
  process.stdout.write(JSON.stringify({ ok: true, cleared: true, sessionId }, null, 2) + "\n");
  process.exit(0);
}

if (cmd !== "set" && cmd !== "run") {
  usage();
  process.exit(2);
}

const goal = args.join(" ").trim();
if (!goal) {
  process.stderr.write("goal text is empty\n");
  process.exit(2);
}

const state = {
  ok: true,
  active: true,
  sessionId,
  goal,
  maxTurns,
  turnsUsed: 0,
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  transcript: [],
};
save(state);

if (cmd === "set") {
  process.stdout.write(JSON.stringify(state, null, 2) + "\n");
  process.exit(0);
}

for (let turn = 1; turn <= maxTurns; turn += 1) {
  const message =
    turn === 1
      ? `GOAL MODE START\nGoal: ${goal}\nWork one concrete step toward the goal. If the goal is fully satisfied, end with exactly: GOAL_DONE: yes. If not, end with exactly: GOAL_DONE: no. Keep the answer concise and do not claim external tool execution unless it actually happened.`
      : `GOAL MODE CONTINUE\nGoal: ${goal}\nPrevious result was not complete. Continue one concrete step toward the result. End with exactly GOAL_DONE: yes or GOAL_DONE: no.`;

  const result = spawnSync(
    "openclaw",
    [
      "agent",
      "--agent",
      "main",
      "--session-id",
      sessionId,
      "--message",
      message,
      "--json",
      "--timeout",
      "180",
      "--thinking",
      "off",
    ],
    { encoding: "utf8", timeout: 240000, maxBuffer: 1024 * 1024 },
  );

  const record = {
    turn,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
  };
  state.transcript.push(record);
  state.turnsUsed = turn;
  state.updatedAt = new Date().toISOString();

  const done = /GOAL_DONE:\s*yes/i.test(result.stdout || "");
  if (result.status !== 0) {
    state.status = "error";
    state.active = false;
    save(state);
    process.stdout.write(JSON.stringify(state, null, 2) + "\n");
    process.exit(result.status || 1);
  }
  if (done) {
    state.status = "done";
    state.active = false;
    save(state);
    process.stdout.write(JSON.stringify(state, null, 2) + "\n");
    process.exit(0);
  }
  save(state);
}

state.status = "paused";
state.active = false;
state.pausedReason = `turn budget exhausted (${state.turnsUsed}/${state.maxTurns})`;
save(state);
process.stdout.write(JSON.stringify(state, null, 2) + "\n");
