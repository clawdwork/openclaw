import type { MarkdownTableMode } from "../config/types.base.js";
import {
  chunkMarkdownIR,
  markdownToIR,
  type MarkdownLinkSpan,
  type MarkdownIR,
} from "../markdown/ir.js";
import { renderMarkdownWithMarkers } from "../markdown/render.js";

function buildWhatsAppLink(link: MarkdownLinkSpan, text: string) {
  const href = link.href.trim();
  if (!href) {
    return null;
  }
  if (link.start === link.end) {
    return null;
  }
  const labelText = text.slice(link.start, link.end);
  // If the label IS the URL (auto-linked), pass through with no markers.
  // This prevents wrapping bare URLs in formatting characters.
  if (labelText === href || labelText === href.replace(/^https?:\/\//, "")) {
    return null;
  }
  // Named link: render as "label (url)" so WhatsApp auto-detects the bare URL.
  return {
    start: link.start,
    end: link.end,
    open: "",
    close: ` (${href})`,
  };
}

function isAutoLinkedUrl(link: MarkdownLinkSpan, text: string): boolean {
  const label = text.slice(link.start, link.end);
  return label === link.href || label === link.href.replace(/^https?:\/\//, "");
}

function stripUrlStyles(ir: MarkdownIR): MarkdownIR {
  const autoLinks = ir.links.filter((link) => isAutoLinkedUrl(link, ir.text));
  if (autoLinks.length === 0) {
    return ir;
  }
  const styles = ir.styles.filter((style) => {
    if (style.style === "code" || style.style === "code_block") {
      return true;
    }
    return !autoLinks.some((link) => link.start <= style.start && link.end >= style.end);
  });
  return { text: ir.text, styles, links: ir.links };
}

function renderWhatsAppText(ir: MarkdownIR): string {
  const cleaned = stripUrlStyles(ir);
  return renderMarkdownWithMarkers(cleaned, {
    styleMarkers: {
      bold: { open: "*", close: "*" },
      italic: { open: "_", close: "_" },
      strikethrough: { open: "~", close: "~" },
      code: { open: "`", close: "`" },
      code_block: { open: "```\n", close: "```" },
    },
    escapeText: (t) => t,
    buildLink: buildWhatsAppLink,
  });
}

export function markdownToWhatsApp(
  markdown: string,
  options: { tableMode?: MarkdownTableMode } = {},
): string {
  const ir = markdownToIR(markdown ?? "", {
    linkify: true,
    headingStyle: "bold",
    blockquotePrefix: "> ",
    tableMode: options.tableMode ?? "bullets",
  });
  return renderWhatsAppText(ir);
}

export function markdownToWhatsAppChunks(markdown: string, limit: number): string[] {
  const ir = markdownToIR(markdown ?? "", {
    linkify: true,
    headingStyle: "bold",
    blockquotePrefix: "> ",
    tableMode: "bullets",
  });
  const chunks = chunkMarkdownIR(ir, limit);
  return chunks.map((chunk) => renderWhatsAppText(chunk));
}
