/**
 * social-strategy-state-validator hook handler (Patch J-3a + Patch O).
 *
 * STATUS (2026-05-06): designed, NOT installable on openclaw 2026.4.25.
 * The runtime in this version exposes only command/agent/gateway hook
 * events — there is no `before_tool_call` (or equivalent tool-call) hook
 * surface. This handler is correct against the spec but has no event to
 * bind to. See ./README.md § "Path to activation" for the upstream PR
 * required, and ../../../../skills/social-orchestrator/references/phase-orchestration.md
 * § "L2 status" for what carries enforcement until then (L1+L3+L4).
 *
 * Wires into openclaw `before_tool_call` to intercept Write/Edit tools that
 * target `research/social/{run_id}/state.json` (under any project root). Validates the proposed
 * content against `state-schema.json`. Returns `{ block: true, blockReason }`
 * on schema violation; otherwise returns `{}` (allow).
 *
 * Non-bypassable (once installed): the hook runs in the openclaw runtime,
 * not in the LLM reasoning loop. The agent cannot skip validation by
 * reasoning around it — the underlying Write tool just sees the block.
 *
 * Schema source-of-truth: `~/dev/workspace/skills/social-orchestrator/references/state-schema.json`.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Hook event/result shapes mirror openclaw's PluginHookBeforeToolCall* types.
// Imports kept loose to avoid coupling this plugin to a specific openclaw
// version's internal types; the structural shape is stable.
type HookEvent = {
  toolName: string;
  params: Record<string, unknown>;
  runId?: string;
  toolCallId?: string;
};

type HookResult = {
  params?: Record<string, unknown>;
  block?: boolean;
  blockReason?: string;
};

type ValidationFinding = {
  path: string;
  message: string;
};

const STATE_PATH_PATTERN = /\/research\/social\/[^/]+\/state\.json$/;
const LEGACY_SUPERSEDED_PATTERN = /\/research\/social\/_superseded\//;
const SCHEMA_PATH = path.resolve(
  process.env.HOME ?? "",
  "dev/workspace/skills/social-orchestrator/references/state-schema.json",
);

let cachedSchema: unknown | null = null;
let cachedSchemaMtime = 0;

async function loadSchema(): Promise<unknown> {
  const stat = await fs.stat(SCHEMA_PATH);
  if (cachedSchema && stat.mtimeMs === cachedSchemaMtime) {
    return cachedSchema;
  }
  const content = await fs.readFile(SCHEMA_PATH, "utf-8");
  cachedSchema = JSON.parse(content);
  cachedSchemaMtime = stat.mtimeMs;
  return cachedSchema;
}

/**
 * Lightweight JSON-Schema-ish validator covering the state-schema.json
 * subset we actually use. Avoids pulling `ajv` into the plugin runtime;
 * the schema is small and the field set is bounded.
 *
 * Returns a list of findings; empty list = pass.
 */
function validate(data: unknown, schema: unknown, basePath = ""): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  if (typeof schema !== "object" || schema === null) return findings;
  const s = schema as Record<string, unknown>;

  // Resolve $ref against root schema $defs (one level deep — sufficient for our schema)
  if (typeof s["$ref"] === "string") {
    const ref = s["$ref"] as string;
    if (ref.startsWith("#/$defs/") && cachedSchema && typeof cachedSchema === "object") {
      const defKey = ref.slice("#/$defs/".length);
      const defs = (cachedSchema as Record<string, unknown>)["$defs"] as Record<string, unknown>;
      const target = defs?.[defKey];
      if (target) return validate(data, target, basePath);
    }
  }

  // type check
  if (typeof s["type"] === "string") {
    const expected = s["type"] as string;
    const actualType = data === null ? "null" : Array.isArray(data) ? "array" : typeof data;
    const matched =
      expected === actualType ||
      (expected === "integer" && actualType === "number" && Number.isInteger(data));
    if (!matched) {
      findings.push({
        path: basePath || "(root)",
        message: `expected ${expected}, got ${actualType}`,
      });
      return findings;
    }
  }

  // enum
  if (Array.isArray(s["enum"])) {
    const allowed = s["enum"] as unknown[];
    if (!allowed.includes(data)) {
      findings.push({
        path: basePath || "(root)",
        message: `value ${JSON.stringify(data)} not in enum ${JSON.stringify(allowed)}`,
      });
    }
  }

  // const
  if (s["const"] !== undefined && data !== s["const"]) {
    findings.push({
      path: basePath || "(root)",
      message: `value must be ${JSON.stringify(s["const"])}; got ${JSON.stringify(data)}`,
    });
  }

  // object: required + properties
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(s["required"])) {
      for (const key of s["required"] as string[]) {
        if (!(key in obj)) {
          findings.push({
            path: `${basePath}/${key}`,
            message: `required field is missing`,
          });
        }
      }
    }
    if (typeof s["properties"] === "object" && s["properties"] !== null) {
      const props = s["properties"] as Record<string, unknown>;
      for (const [key, propSchema] of Object.entries(props)) {
        if (key in obj) {
          findings.push(...validate(obj[key], propSchema, `${basePath}/${key}`));
        }
      }
    }
  }

  // allOf
  if (Array.isArray(s["allOf"])) {
    for (const sub of s["allOf"] as unknown[]) {
      findings.push(...validate(data, sub, basePath));
    }
  }

  // No-mtime-backfill assertion (Patch K-2): each phase block's
  // skill_versions_at_read[file].mtime <= phases.{n}.ran_at
  if (basePath.startsWith("/phases/") && typeof data === "object" && data !== null) {
    const phaseBlock = data as Record<string, unknown>;
    const ranAt =
      typeof phaseBlock["ran_at"] === "string" ? Date.parse(phaseBlock["ran_at"] as string) : NaN;
    const skillVersions = phaseBlock["skill_versions_at_read"];
    if (Number.isFinite(ranAt) && typeof skillVersions === "object" && skillVersions !== null) {
      for (const [file, meta] of Object.entries(skillVersions as Record<string, unknown>)) {
        if (typeof meta === "object" && meta !== null) {
          const mtime =
            typeof (meta as Record<string, unknown>)["mtime"] === "string"
              ? Date.parse((meta as Record<string, unknown>)["mtime"] as string)
              : NaN;
          if (Number.isFinite(mtime) && mtime > ranAt) {
            findings.push({
              path: `${basePath}/skill_versions_at_read/${file}/mtime`,
              message: `mtime (${new Date(mtime).toISOString()}) > phase ran_at (${new Date(ranAt).toISOString()}); backfilled field is invalid (Patch K-2)`,
            });
          }
        }
      }
    }
  }

  return findings;
}

/**
 * Entry point — openclaw runtime calls this on every before_tool_call.
 */
export default async function validateStateWrite(event: HookEvent): Promise<HookResult> {
  const { toolName, params } = event;

  if (toolName !== "Write" && toolName !== "Edit") return {};

  const target =
    typeof params["target"] === "string"
      ? (params["target"] as string)
      : typeof params["file_path"] === "string"
        ? (params["file_path"] as string)
        : "";

  if (!target) return {};

  // Skip _superseded/ archive writes — those are explicit migrations
  if (LEGACY_SUPERSEDED_PATTERN.test(target)) return {};

  if (!STATE_PATH_PATTERN.test(target)) return {};

  // Determine proposed final content
  let proposedContent: string | null = null;

  if (toolName === "Write" && typeof params["content"] === "string") {
    proposedContent = params["content"] as string;
  } else if (toolName === "Edit") {
    // For Edit, read current file + apply old_string → new_string
    try {
      const current = await fs.readFile(target, "utf-8");
      const oldStr = params["old_string"];
      const newStr = params["new_string"];
      if (typeof oldStr === "string" && typeof newStr === "string") {
        proposedContent = current.replace(oldStr, newStr);
      } else {
        // Edit shape we don't recognize — let it through; openclaw's tool layer will surface the error
        return {};
      }
    } catch {
      // File doesn't exist yet — nothing to validate against
      return {};
    }
  }

  if (proposedContent === null) return {};

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(proposedContent);
  } catch (err) {
    return {
      block: true,
      blockReason: `state-validator: state.json content is not valid JSON: ${(err as Error).message}`,
    };
  }

  // Validate
  let schema: unknown;
  try {
    schema = await loadSchema();
  } catch (err) {
    // If the schema file itself can't be loaded, fail-open with a warning logged to stderr.
    // The orchestrator will still produce artifacts; the auditor (L3) will catch the drift.
    process.stderr.write(
      `[state-validator] WARN: failed to load schema at ${SCHEMA_PATH}: ${(err as Error).message}\n`,
    );
    return {};
  }

  const findings = validate(parsed, schema);
  if (findings.length === 0) return {};

  const summary = findings
    .slice(0, 5)
    .map((f) => `  • ${f.path}: ${f.message}`)
    .join("\n");
  const more = findings.length > 5 ? `\n  …and ${findings.length - 5} more` : "";

  return {
    block: true,
    blockReason: `state-validator: state.json failed schema validation (${findings.length} ${findings.length === 1 ? "issue" : "issues"}):\n${summary}${more}`,
  };
}
