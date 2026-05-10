#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const executeHermes = args.includes("--execute-hermes");
const help = args.includes("--help") || args.includes("-h");
const inputArgs = args.filter((arg) => !arg.startsWith("--"));

if (help) {
  process.stdout.write(`Usage:
  ascension-brain.mjs "<task>"
  ascension-brain.mjs --execute-hermes "<task>"

Classifies a Luna/Hermes/OpenClaw task and returns the lightweight routing plan.
Default mode is dry-run JSON and does not spend model tokens except this script itself.
`);
  process.exit(0);
}

let input = inputArgs.join(" ").trim();
if (!input && !process.stdin.isTTY) {
  input = fs.readFileSync(0, "utf8").trim();
}

const text = input || "";
const lower = text.toLowerCase();
const slashGoal = /^\/goal\b/i.test(text);
const slashPet = /^\/pet\b/i.test(text);

const tests = {
  multiStep:
    /(장기|프로젝트|계획|단계|여러|복잡|분석|고도화|최적|자동화|설계|전략|운영|정리|구조|시스템|원인|찾아서|준비|architecture|strategy|plan|automation|workflow|orchestrat|prepare|root cause)/i,
  checklist:
    /(todo|to do|체크리스트|할 ?일|진행|인수인계|handoff|캠페인|campaign|출시|launch|sns|쇼츠|shorts|recover|복구)/i,
  memory:
    /(기억|맥락|세션|압축|잃|복구|honcho|paperclip|ouroboros|hermes|memory|context|recall)/i,
  highRisk:
    /(반복|재발|실수|위험|고위험|출시 전|보안|삭제|결제|공개|배포|운영|장애|검수|risk|security|release|production|billing|delete|public|incident|irreversible)/i,
  coding:
    /(코드|repo|repository|빌드|테스트|pr\b|버그|수정|구현|파일|함수|api|github|build|test|bug|fix|implement|commit|pull request|typescript|python|react|server)/i,
  review:
    /(리뷰|검토|아키텍처|추론|판단|법무|정책|감사|review|reasoning|architecture|policy|audit|legal|cso)/i,
  media:
    /(이미지|영상|사진|비디오|멀티모달|생성|gemini|image|video|photo|media|multimodal|thumbnail|reel)/i,
  command:
    /(실행|명령|터미널|shell|cli|command|run|restart|재시작|설정|config)/i,
};

const flags = Object.fromEntries(
  Object.entries(tests).map(([name, regex]) => [name, regex.test(text) || regex.test(lower)]),
);
flags.goalLoop = slashGoal;
flags.petCheck = slashPet;

const shouldConsultHermes = flags.goalLoop || flags.multiStep || flags.memory || flags.highRisk || flags.review;
const shouldUsePaperclip =
  flags.goalLoop ||
  flags.checklist ||
  flags.memory ||
  (flags.multiStep && flags.highRisk) ||
  (flags.coding && /(pr\b|pull request|테스트|빌드|build|test|release|출시|준비)/i.test(text));
const shouldRunOuroboros = flags.goalLoop || flags.highRisk || (flags.multiStep && flags.review);

const escalation = [];
if (flags.coding) escalation.push("star/codex");
if (flags.review || flags.highRisk) escalation.push("solar/claude");
if (flags.media) escalation.push("gemini");

const primary = flags.petCheck
  ? "luna-pet"
  : flags.coding && !shouldConsultHermes
    ? "star/codex"
    : shouldConsultHermes
      ? "hermes"
      : "luna";
const execution = flags.command || flags.coding ? "openclaw" : "luna";
const model =
  primary === "luna"
    ? "ollama/qwen3.5:cloud"
    : primary === "star/codex"
      ? "openai-codex/gpt-5.5"
      : "ollama/qwen3.5:cloud";

const briefParts = [];
briefParts.push(`Task: ${text.slice(0, 500) || "(empty)"}`);
briefParts.push(`Route: ${primary} planning, ${execution} execution`);
if (shouldUsePaperclip) briefParts.push("Paperclip: maintain durable checklist/recovery state");
if (shouldRunOuroboros) briefParts.push("Ouroboros: run bounded self-check/repeated-mistake prevention");
if (escalation.length) briefParts.push(`Escalation candidates: ${escalation.join(", ")}`);
const brief = briefParts.join("\n");
const hermesBrief = [
  "Give a compact route/checklist. Max 5 bullets.",
  `Task: ${text.slice(0, 360) || "(empty)"}`,
  `Use: ${[
    shouldConsultHermes ? "Hermes/Honcho" : null,
    shouldUsePaperclip ? "Paperclip" : null,
    shouldRunOuroboros ? "Ouroboros" : null,
    escalation.length ? escalation.join(",") : null,
  ]
    .filter(Boolean)
    .join(" + ") || "Luna only"}`,
].join("\n");

const commands = [];
commands.push({
  when: "nontrivial task classification",
  command: `/Users/ki_mini/.openclaw/workspace/scripts/ascension-brain.mjs ${JSON.stringify(text)}`,
});
if (flags.goalLoop) {
  commands.push({
    when: "goal loop",
    command: `/Users/ki_mini/.openclaw/workspace/scripts/luna-goal.mjs run ${JSON.stringify(text.replace(/^\/goal\s*/i, "").trim())}`,
  });
}
if (flags.petCheck) {
  commands.push({
    when: "pet health check",
    command: "/Users/ki_mini/.openclaw/workspace/scripts/luna-pet.mjs",
  });
}
if (shouldConsultHermes) {
  commands.push({
    when: "planning or memory recall",
    command: `/Users/ki_mini/.openclaw/workspace/scripts/hermes-local.sh ask ${JSON.stringify(hermesBrief)}`,
  });
}
if (shouldUsePaperclip) {
  commands.push({
    when: "durable checklist recovery",
    command: `/Users/ki_mini/.openclaw/workspace/scripts/paperclip-local.sh status && npx paperclipai issue list`,
  });
}
if (shouldRunOuroboros) {
  commands.push({
    when: "bounded self-check",
    command: `ouroboros init start --llm-backend litellm ${JSON.stringify(brief)}`,
  });
}

const plan = {
  schemaVersion: "2026-05-09.ascension-brain.v1",
  mode: executeHermes ? "execute-hermes" : "dry-run",
  inputPreview: text.slice(0, 160),
  flags,
  route: {
    primary,
    execution,
    defaultModel: model,
    routineModel: "ollama/qwen3.5:cloud",
    hermesModel: "ollama/qwen3.5:cloud",
    hardReasoningFallback: "ollama/deepseek-v4-pro:cloud",
    escalation,
  },
  actions: {
    consultHermes: shouldConsultHermes,
    useHonchoThroughHermes: shouldConsultHermes || flags.memory,
    usePaperclip: shouldUsePaperclip,
    runOuroboros: shouldRunOuroboros,
    askBeforeIrreversibleAction: flags.highRisk,
  },
  brief,
  hermesBrief,
  commands,
  guardrails: [
    "Do not claim execution unless a command/tool completed.",
    "Do not route ordinary chat to qwen3-coder-next.",
    "Escalate with this short RTK brief instead of dumping the full session.",
  ],
};

if (executeHermes && shouldConsultHermes) {
  const result = spawnSync(
    "/Users/ki_mini/.openclaw/workspace/scripts/hermes-local.sh",
    ["ask", hermesBrief],
    { encoding: "utf8", timeout: 90000, maxBuffer: 1024 * 1024 },
  );
  plan.hermes = {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    stdout: (result.stdout || "").slice(0, 2500),
    stderr: (result.stderr || "").slice(0, 1200),
  };
}

process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
