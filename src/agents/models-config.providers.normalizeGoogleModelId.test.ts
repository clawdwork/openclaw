import { describe, expect, it } from "vitest";
import { normalizeGoogleModelId } from "./models-config.providers.js";

describe("normalizeGoogleModelId", () => {
  it("normalizes gemini-3.1-pro to gemini-3.1-pro-preview", () => {
    expect(normalizeGoogleModelId("gemini-3.1-pro")).toBe("gemini-3.1-pro-preview");
  });

  it("normalizes gemini-3-pro to gemini-3-pro-preview", () => {
    expect(normalizeGoogleModelId("gemini-3-pro")).toBe("gemini-3-pro-preview");
  });

  it("normalizes gemini-3-flash to gemini-3-flash-preview", () => {
    expect(normalizeGoogleModelId("gemini-3-flash")).toBe("gemini-3-flash-preview");
  });

  it("fixes dot-vs-dash typo: gemini.31.pro-preview → gemini-3.1-pro-preview", () => {
    expect(normalizeGoogleModelId("gemini.31.pro-preview")).toBe("gemini-3.1-pro-preview");
  });

  it("fixes dot-vs-dash typo: gemini.31.pro.preview → gemini-3.1-pro-preview", () => {
    expect(normalizeGoogleModelId("gemini.31.pro.preview")).toBe("gemini-3.1-pro-preview");
  });

  it("fixes dot-vs-dash typo: gemini.3.pro → gemini-3-pro-preview", () => {
    expect(normalizeGoogleModelId("gemini.3.pro")).toBe("gemini-3-pro-preview");
  });

  it("fixes dot-vs-dash typo: gemini.3.flash → gemini-3-flash-preview", () => {
    expect(normalizeGoogleModelId("gemini.3.flash")).toBe("gemini-3-flash-preview");
  });

  it("passes through already correct model ids", () => {
    expect(normalizeGoogleModelId("gemini-3.1-pro-preview")).toBe("gemini-3.1-pro-preview");
    expect(normalizeGoogleModelId("gemini-3-flash-preview")).toBe("gemini-3-flash-preview");
  });

  it("passes through unrelated model ids", () => {
    expect(normalizeGoogleModelId("gemini-2.5-flash")).toBe("gemini-2.5-flash");
    expect(normalizeGoogleModelId("some-other-model")).toBe("some-other-model");
  });
});
