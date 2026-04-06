import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("../logger.js", () => ({
  logDebug: mocks.logDebug,
  logError: mocks.logError,
}));

let toToolDefinitions: typeof import("./pi-tool-definition-adapter.js").toToolDefinitions;
let wrapToolParamNormalization: typeof import("./pi-tools.params.js").wrapToolParamNormalization;
let CLAUDE_PARAM_GROUPS: typeof import("./pi-tools.params.js").CLAUDE_PARAM_GROUPS;
let logError: typeof import("../logger.js").logError;

type ToolExecute = ReturnType<
  typeof import("./pi-tool-definition-adapter.js").toToolDefinitions
>[number]["execute"];
const extensionContext = {} as Parameters<ToolExecute>[4];

describe("pi tool definition adapter logging", () => {
  beforeAll(async () => {
    ({ toToolDefinitions } = await import("./pi-tool-definition-adapter.js"));
    ({ wrapToolParamNormalization, CLAUDE_PARAM_GROUPS } = await import("./pi-tools.params.js"));
    ({ logError } = await import("../logger.js"));
  });

  beforeEach(() => {
    vi.mocked(logError).mockReset();
    mocks.logDebug.mockReset();
  });

  it("unwraps edits array into flat oldText/newText params", async () => {
    const baseTool = {
      name: "edit",
      label: "Edit",
      description: "edits files",
      parameters: Type.Object({
        path: Type.String(),
        oldText: Type.String(),
        newText: Type.String(),
      }),
      execute: async (_id: string, params: unknown) => {
        const record = params as Record<string, unknown>;
        // The unwrapped params should have flat oldText/newText
        expect(record.oldText).toBe("old content");
        expect(record.newText).toBe("new content");
        expect(record.path).toBe("notes.txt");
        expect(record.edits).toBeUndefined();
        return {
          content: [{ type: "text" as const, text: "ok" }],
          details: { ok: true },
        };
      },
    } satisfies AgentTool;

    const tool = wrapToolParamNormalization(baseTool, CLAUDE_PARAM_GROUPS.edit);
    const [def] = toToolDefinitions([tool]);
    if (!def) {
      throw new Error("missing tool definition");
    }

    // Gemini-style: edits array with file key
    await def.execute(
      "call-edit-edits",
      { file: "notes.txt", edits: [{ oldText: "old content", newText: "new content" }] },
      undefined,
      undefined,
      extensionContext,
    );

    expect(logError).not.toHaveBeenCalled();
  });

  it("unwraps edits array with path key", async () => {
    const baseTool = {
      name: "edit",
      label: "Edit",
      description: "edits files",
      parameters: Type.Object({
        path: Type.String(),
        oldText: Type.String(),
        newText: Type.String(),
      }),
      execute: async (_id: string, params: unknown) => {
        const record = params as Record<string, unknown>;
        expect(record.oldText).toBe("old");
        expect(record.newText).toBe("new");
        expect(record.path).toBe("test.md");
        return {
          content: [{ type: "text" as const, text: "ok" }],
          details: { ok: true },
        };
      },
    } satisfies AgentTool;

    const tool = wrapToolParamNormalization(baseTool, CLAUDE_PARAM_GROUPS.edit);
    const [def] = toToolDefinitions([tool]);
    if (!def) {
      throw new Error("missing tool definition");
    }

    await def.execute(
      "call-edit-path",
      { path: "test.md", edits: [{ oldText: "old", newText: "new" }] },
      undefined,
      undefined,
      extensionContext,
    );

    expect(logError).not.toHaveBeenCalled();
  });

  it("logs raw malformed edit params when required aliases are missing", async () => {
    const baseTool = {
      name: "edit",
      label: "Edit",
      description: "edits files",
      parameters: Type.Object({
        path: Type.String(),
        oldText: Type.String(),
        newText: Type.String(),
      }),
      execute: async () => ({
        content: [{ type: "text" as const, text: "ok" }],
        details: { ok: true },
      }),
    } satisfies AgentTool;

    const tool = wrapToolParamNormalization(baseTool, CLAUDE_PARAM_GROUPS.edit);
    const [def] = toToolDefinitions([tool]);
    if (!def) {
      throw new Error("missing tool definition");
    }

    await def.execute("call-edit-1", { path: "notes.txt" }, undefined, undefined, extensionContext);

    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining(
        '[tools] edit failed: Missing required parameters: oldText alias, newText alias. Supply correct parameters before retrying. raw_params={"path":"notes.txt"}',
      ),
    );
  });
});
