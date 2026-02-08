import { describe, expect, it } from "vitest";
import { markdownToWhatsApp, markdownToWhatsAppChunks } from "./format.js";

describe("markdownToWhatsApp", () => {
  it("converts bold", () => {
    expect(markdownToWhatsApp("**hello**")).toBe("*hello*");
  });

  it("converts italic", () => {
    expect(markdownToWhatsApp("*hello*")).toBe("_hello_");
  });

  it("converts strikethrough", () => {
    expect(markdownToWhatsApp("~~hello~~")).toBe("~hello~");
  });

  it("converts inline code", () => {
    expect(markdownToWhatsApp("`code`")).toBe("`code`");
  });

  it("converts code block", () => {
    const result = markdownToWhatsApp("```\nconst x = 1;\n```");
    expect(result).toContain("```");
    expect(result).toContain("const x = 1;");
  });

  it("renders bare URL without formatting markers", () => {
    expect(markdownToWhatsApp("https://example.com")).toBe("https://example.com");
  });

  it("strips bold from URL (the bug fix)", () => {
    const result = markdownToWhatsApp("**https://intel-hub.vercel.app**");
    // The URL must not be wrapped in * markers
    expect(result).not.toMatch(/^\*https/);
    expect(result).toContain("https://intel-hub.vercel.app");
  });

  it("renders named link as label (url)", () => {
    const result = markdownToWhatsApp("[Click here](https://example.com)");
    expect(result).toContain("Click here");
    expect(result).toContain("(https://example.com)");
  });

  it("converts heading to bold", () => {
    const result = markdownToWhatsApp("# Title");
    expect(result).toBe("*Title*");
  });

  it("preserves bullet lists", () => {
    const result = markdownToWhatsApp("- one\n- two\n- three");
    expect(result).toContain("one");
    expect(result).toContain("two");
    expect(result).toContain("three");
  });

  it("handles mixed formatting", () => {
    const result = markdownToWhatsApp("This is **bold** and *italic* text");
    expect(result).toContain("*bold*");
    expect(result).toContain("_italic_");
  });

  it("handles empty string", () => {
    expect(markdownToWhatsApp("")).toBe("");
  });

  it("handles plain text", () => {
    expect(markdownToWhatsApp("hello world")).toBe("hello world");
  });
});

describe("markdownToWhatsAppChunks", () => {
  it("returns single chunk for short text", () => {
    const chunks = markdownToWhatsAppChunks("hello", 4000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("hello");
  });

  it("splits long text into chunks", () => {
    const long = "a".repeat(5000);
    const chunks = markdownToWhatsAppChunks(long, 4000);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(4000);
    }
  });

  it("preserves formatting in chunks", () => {
    const chunks = markdownToWhatsAppChunks("**bold text**", 4000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("*bold text*");
  });
});
