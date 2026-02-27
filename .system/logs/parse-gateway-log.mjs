#!/usr/bin/env node
/**
 * OpenClaw Gateway Log Parser
 *
 * Parses raw gateway JSON logs into a readable conversation chain.
 *
 * Usage:
 *   node parse-gateway-log.mjs <logfile> [options]
 *
 * Options:
 *   --agent <name>    Filter to a specific agent (e.g. "marketing", "dev-coder")
 *   --run <id>        Filter to a specific runId (partial match)
 *   --errors          Show only errors
 *   --tools           Show tool calls
 *   --messages        Show agent messages/responses only
 *   --last <n>        Show only the last N events (default: all)
 *   --since <time>    Show events after HH:MM (24h format, e.g. "16:00")
 *   --json            Output as JSON instead of formatted text
 *   --verbose         Show full message content (no truncation)
 *
 * Examples:
 *   node parse-gateway-log.mjs /tmp/openclaw/openclaw-2026-02-25.log
 *   node parse-gateway-log.mjs /tmp/openclaw/openclaw-2026-02-25.log --agent marketing --tools
 *   node parse-gateway-log.mjs /tmp/openclaw/openclaw-2026-02-25.log --since 16:00 --verbose
 */

import { readFileSync } from "fs";
import { basename } from "path";

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const logFile = args.find((a) => !a.startsWith("--"));

if (!logFile) {
  console.error("Usage: node parse-gateway-log.mjs <logfile> [options]");
  console.error("Run with --help for full options.");
  process.exit(1);
}

if (args.includes("--help")) {
  console.log(
    readFileSync(new URL(import.meta.url), "utf8")
      .split("\n")
      .filter((l) => l.startsWith(" *"))
      .map((l) => l.replace(/^ \* ?/, ""))
      .join("\n")
  );
  process.exit(0);
}

const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
};

const filterAgent = opt("agent");
const filterRun = opt("run");
const showErrors = flag("errors");
const showTools = flag("tools");
const showMessages = flag("messages");
const lastN = opt("last") ? parseInt(opt("last"), 10) : null;
const sinceTime = opt("since");
const outputJson = flag("json");
const verbose = flag("verbose");

// ── Colors ────────────────────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgBlue: "\x1b[44m",
  bgYellow: "\x1b[43m",
};

// ── Parse ─────────────────────────────────────────────────────────────────────

const raw = readFileSync(logFile, "utf8");
const lines = raw.split("\n").filter(Boolean);

console.log(
  `${C.dim}Parsing ${basename(logFile)} (${lines.length} lines)...${C.reset}\n`
);

/** Try to parse a line as JSON. Returns null on failure. */
function tryParseJson(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

/** Extract time as HH:MM:SS from ISO string */
function shortTime(iso) {
  if (!iso) return "??:??:??";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/New_York" });
}

/** Extract agent name from runId pattern */
function extractAgent(runId) {
  if (!runId) return null;
  // Pattern: announce:v1:agent:<name>:subagent:...
  const m = runId.match(/agent:([^:]+)/);
  return m ? m[1] : null;
}

/** Extract if this is a subagent run */
function isSubagent(runId) {
  return runId?.includes(":subagent:") ?? false;
}

/** Truncate text for display */
function truncate(text, maxLen = 200) {
  if (verbose || !text) return text;
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

/** Clean ANSI escape codes from text */
function stripAnsi(text) {
  return text?.replace(/\x1b\[[0-9;]*m/g, "") ?? text;
}

// ── Classify each log line ────────────────────────────────────────────────────

const events = [];

for (let i = 0; i < lines.length; i++) {
  const entry = tryParseJson(lines[i]);
  if (!entry) continue;

  const time = entry.time || entry._meta?.date;
  const level = entry._meta?.logLevelName || "?";
  const subsystem = entry._meta?.name || "";
  const msg0 = typeof entry["0"] === "string" ? entry["0"] : null;
  const msg1 = typeof entry["1"] === "string" ? entry["1"] : null;

  // Skip non-relevant log lines
  const text = msg1 || msg0 || "";
  const cleanText = stripAnsi(text);

  let event = null;

  // ── Agent run lifecycle ───────────────────────────────────────────────
  if (cleanText.startsWith("embedded run start:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    const sessionId = cleanText.match(/sessionId=(\S+)/)?.[1];
    const provider = cleanText.match(/provider=(\S+)/)?.[1];
    const model = cleanText.match(/model=(\S+)/)?.[1];
    const thinking = cleanText.match(/thinking=(\S+)/)?.[1];
    const channel = cleanText.match(/messageChannel=(\S+)/)?.[1];
    event = {
      type: "run_start",
      time,
      runId,
      sessionId,
      agent: extractAgent(runId),
      isSubagent: isSubagent(runId),
      provider,
      model,
      thinking,
      channel,
    };
  } else if (cleanText.startsWith("embedded run agent start:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    event = { type: "agent_start", time, runId, agent: extractAgent(runId) };
  } else if (cleanText.startsWith("embedded run agent end:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    const isError = cleanText.includes("isError=true");
    event = {
      type: "agent_end",
      time,
      runId,
      agent: extractAgent(runId),
      isError,
    };
  } else if (cleanText.startsWith("embedded run prompt start:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    event = { type: "prompt_start", time, runId, agent: extractAgent(runId) };
  } else if (cleanText.startsWith("embedded run prompt end:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    const durationMs = cleanText.match(/durationMs=(\d+)/)?.[1];
    event = {
      type: "prompt_end",
      time,
      runId,
      agent: extractAgent(runId),
      durationMs: durationMs ? parseInt(durationMs) : null,
    };
  } else if (cleanText.startsWith("embedded run done:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    const durationMs = cleanText.match(/durationMs=(\d+)/)?.[1];
    const aborted = cleanText.includes("aborted=true");
    event = {
      type: "run_done",
      time,
      runId,
      agent: extractAgent(runId),
      isSubagent: isSubagent(runId),
      durationMs: durationMs ? parseInt(durationMs) : null,
      aborted,
    };

    // ── Tool calls ────────────────────────────────────────────────────────
  } else if (cleanText.startsWith("embedded run tool start:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    const tool = cleanText.match(/tool=(\S+)/)?.[1];
    const toolCallId = cleanText.match(/toolCallId=(\S+)/)?.[1];
    event = {
      type: "tool_start",
      time,
      runId,
      agent: extractAgent(runId),
      tool,
      toolCallId,
    };
  } else if (cleanText.startsWith("embedded run tool end:")) {
    const runId = cleanText.match(/runId=(\S+)/)?.[1];
    const tool = cleanText.match(/tool=(\S+)/)?.[1];
    const toolCallId = cleanText.match(/toolCallId=(\S+)/)?.[1];
    event = {
      type: "tool_end",
      time,
      runId,
      agent: extractAgent(runId),
      tool,
      toolCallId,
    };

    // ── Agent text output (responses/announcements) ───────────────────────
  } else if (
    level === "INFO" &&
    msg0 &&
    !msg1 &&
    msg0.length > 50 &&
    !msg0.startsWith("{")
  ) {
    // This heuristic catches agent response text logged to console
    event = {
      type: "agent_message",
      time,
      content: msg0,
    };

    // ── Errors ────────────────────────────────────────────────────────────
  } else if (level === "ERROR") {
    event = {
      type: "error",
      time,
      content: cleanText,
    };

    // ── Lane diagnostics ──────────────────────────────────────────────────
  } else if (cleanText.startsWith("lane task")) {
    const durationMs = cleanText.match(/durationMs=(\d+)/)?.[1];
    event = {
      type: "lane",
      time,
      content: cleanText,
      durationMs: durationMs ? parseInt(durationMs) : null,
    };
  }

  if (event) {
    event.lineNo = i + 1;
    events.push(event);
  }
}

// ── Filter ────────────────────────────────────────────────────────────────────

let filtered = events;

if (filterAgent) {
  filtered = filtered.filter(
    (e) =>
      e.agent === filterAgent ||
      e.type === "agent_message" ||
      e.type === "error"
  );
}

if (filterRun) {
  filtered = filtered.filter(
    (e) => e.runId?.includes(filterRun) || e.type === "error" || e.type === "agent_message"
  );
}

if (showErrors) {
  filtered = filtered.filter((e) => e.type === "error");
}

if (showTools) {
  filtered = filtered.filter(
    (e) =>
      e.type === "tool_start" ||
      e.type === "tool_end" ||
      e.type === "error" ||
      e.type === "run_start" ||
      e.type === "run_done"
  );
}

if (showMessages) {
  filtered = filtered.filter(
    (e) =>
      e.type === "agent_message" ||
      e.type === "error" ||
      e.type === "run_start" ||
      e.type === "run_done"
  );
}

if (sinceTime) {
  const [h, m] = sinceTime.split(":").map(Number);
  filtered = filtered.filter((e) => {
    const d = new Date(e.time);
    const eH = d.getUTCHours();
    const eM = d.getUTCMinutes();
    // Compare as UTC since logs are in UTC
    return eH > h || (eH === h && eM >= m);
  });
}

if (lastN) {
  filtered = filtered.slice(-lastN);
}

// ── Output ────────────────────────────────────────────────────────────────────

if (outputJson) {
  console.log(JSON.stringify(filtered, null, 2));
  process.exit(0);
}

// Track active runs for indentation
const activeRuns = new Map();
let indent = 0;

function pad() {
  return "  ".repeat(indent);
}

// Build summary stats
const stats = {
  totalEvents: events.length,
  runs: 0,
  subagentRuns: 0,
  toolCalls: 0,
  errors: 0,
  agents: new Set(),
  tools: new Map(),
};

for (const e of events) {
  if (e.type === "run_start") {
    stats.runs++;
    if (e.isSubagent) stats.subagentRuns++;
    if (e.agent) stats.agents.add(e.agent);
  }
  if (e.type === "tool_start") {
    stats.toolCalls++;
    stats.tools.set(e.tool, (stats.tools.get(e.tool) || 0) + 1);
  }
  if (e.type === "error") stats.errors++;
}

// Print summary header
console.log(`${C.bold}═══ Gateway Log Summary ═══${C.reset}`);
console.log(`${C.dim}File:${C.reset} ${logFile}`);
console.log(
  `${C.dim}Events:${C.reset} ${stats.totalEvents} total, ${stats.runs} runs (${stats.subagentRuns} subagent), ${stats.toolCalls} tool calls, ${C.red}${stats.errors} errors${C.reset}`
);
console.log(
  `${C.dim}Agents:${C.reset} ${[...stats.agents].join(", ") || "none detected"}`
);
if (stats.tools.size > 0) {
  const toolSummary = [...stats.tools.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t, c]) => `${t}(${c})`)
    .join(", ");
  console.log(`${C.dim}Tools:${C.reset} ${toolSummary}`);
}
console.log(
  `${C.dim}Showing:${C.reset} ${filtered.length} events (of ${events.length})`
);
console.log(`${C.bold}${"═".repeat(50)}${C.reset}\n`);

// Print events
for (const e of filtered) {
  const t = shortTime(e.time);
  const line = `${C.dim}L${e.lineNo}${C.reset}`;

  switch (e.type) {
    case "run_start": {
      const agentLabel = e.agent
        ? `${C.cyan}${e.agent}${C.reset}`
        : `${C.dim}unknown${C.reset}`;
      const subLabel = e.isSubagent
        ? `${C.yellow} [SUBAGENT]${C.reset}`
        : "";
      const modelLabel = e.model
        ? `${C.dim} (${e.model}, thinking=${e.thinking})${C.reset}`
        : "";
      console.log(
        `${pad()}${C.green}▶ RUN START${C.reset} ${t} ${agentLabel}${subLabel}${modelLabel} ${line}`
      );
      if (e.runId) {
        const shortRun = e.runId.length > 40 ? e.runId.slice(0, 40) + "..." : e.runId;
        console.log(`${pad()}  ${C.dim}runId: ${shortRun}${C.reset}`);
      }
      indent = Math.min(indent + 1, 5);
      break;
    }

    case "run_done": {
      indent = Math.max(indent - 1, 0);
      const dur = e.durationMs ? `${(e.durationMs / 1000).toFixed(1)}s` : "?";
      const status = e.aborted
        ? `${C.red}ABORTED${C.reset}`
        : `${C.green}OK${C.reset}`;
      const agentLabel = e.agent
        ? `${C.cyan}${e.agent}${C.reset}`
        : "";
      console.log(
        `${pad()}${C.blue}■ RUN DONE${C.reset} ${t} ${agentLabel} ${status} ${C.dim}(${dur})${C.reset} ${line}`
      );
      break;
    }

    case "tool_start": {
      const agentLabel = e.agent ? `${C.dim}[${e.agent}]${C.reset} ` : "";
      console.log(
        `${pad()}${C.magenta}⚡ TOOL${C.reset} ${t} ${agentLabel}${C.bold}${e.tool}${C.reset} ${line}`
      );
      break;
    }

    case "tool_end": {
      // Skip tool_end for cleaner output unless verbose
      if (verbose) {
        console.log(
          `${pad()}${C.dim}  ↳ ${e.tool} done${C.reset} ${line}`
        );
      }
      break;
    }

    case "agent_message": {
      const preview = truncate(e.content, 300);
      // Replace \n with actual newlines for readability
      const formatted = preview.replace(/\\n/g, "\n" + pad() + "  │ ");
      console.log(`${pad()}${C.bold}${C.white}💬 MESSAGE${C.reset} ${t} ${line}`);
      console.log(`${pad()}  │ ${formatted}`);
      console.log(`${pad()}  └${"─".repeat(40)}`);
      break;
    }

    case "error": {
      const preview = truncate(e.content, 300);
      console.log(
        `${pad()}${C.bgRed}${C.white} ERROR ${C.reset} ${t} ${line}`
      );
      console.log(`${pad()}  ${C.red}${preview}${C.reset}`);
      break;
    }

    case "prompt_start":
    case "prompt_end": {
      if (verbose) {
        const dur =
          e.durationMs ? ` ${C.dim}(${(e.durationMs / 1000).toFixed(1)}s)${C.reset}` : "";
        console.log(
          `${pad()}${C.dim}  prompt ${e.type === "prompt_start" ? "→" : "←"}${dur}${C.reset}`
        );
      }
      break;
    }

    case "agent_start":
    case "agent_end": {
      if (verbose) {
        const err = e.isError ? ` ${C.red}(error)${C.reset}` : "";
        console.log(
          `${pad()}${C.dim}  agent ${e.type === "agent_start" ? "→" : "←"}${err}${C.reset}`
        );
      }
      break;
    }

    case "lane": {
      if (verbose) {
        console.log(`${pad()}${C.dim}  ${e.content}${C.reset}`);
      }
      break;
    }
  }
}

// Final separator
console.log(`\n${C.bold}${"═".repeat(50)}${C.reset}`);
console.log(`${C.dim}Done. ${filtered.length} events displayed.${C.reset}`);
