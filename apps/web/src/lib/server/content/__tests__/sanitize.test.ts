import type { Element, Root } from "hast";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { toHtml } from "hast-util-to-html";

import { transformToHast } from "../pipeline";

async function toHtmlString(markdown: string): Promise<string> {
  const hast = await transformToHast(markdown);
  return toHtml(hast);
}

function findElements(node: Root | Element, tagName: string): Element[] {
  const results: Element[] = [];

  function traverse(n: Root | Element): void {
    if ("tagName" in n && n.tagName === tagName) {
      results.push(n);
    }
    if ("children" in n) {
      for (const child of n.children) {
        if (child.type === "element") {
          traverse(child);
        }
      }
    }
  }

  traverse(node);
  return results;
}

describe("transformToHast", () => {
  describe("external links", () => {
    it("adds rel and target to external https links", async () => {
      const hast = await transformToHast("[Example](https://example.com)");
      const links = findElements(hast, "a");

      expect(links).toHaveLength(1);
      expect(links[0].properties?.rel).toContain("noopener");
      expect(links[0].properties?.rel).toContain("noreferrer");
      expect(links[0].properties?.target).toBe("_blank");
    });

    it("adds rel and target to external http links", async () => {
      const hast = await transformToHast("[Example](http://example.com)");
      const links = findElements(hast, "a");

      expect(links).toHaveLength(1);
      expect(links[0].properties?.rel).toContain("noopener");
      expect(links[0].properties?.target).toBe("_blank");
    });

    it("handles external links with www autolink", async () => {
      const hast = await transformToHast("Visit www.example.com today");
      const links = findElements(hast, "a");

      expect(links).toHaveLength(1);
      expect(links[0].properties?.rel).toContain("noopener");
    });
  });

  describe("internal links", () => {
    it("preserves relative path links without modification", async () => {
      const hast = await transformToHast("[About](/about)");
      const links = findElements(hast, "a");

      expect(links).toHaveLength(1);
      expect(links[0].properties?.href).toBe("/about");
      expect(links[0].properties?.rel).toBeUndefined();
      expect(links[0].properties?.target).toBeUndefined();
    });

    it("preserves anchor links without modification", async () => {
      const hast = await transformToHast("[Section](#section)");
      const links = findElements(hast, "a");

      expect(links).toHaveLength(1);
      expect(links[0].properties?.href).toBe("#section");
      expect(links[0].properties?.rel).toBeUndefined();
    });

    it("preserves nested relative paths", async () => {
      const hast = await transformToHast("[Post](/blog/post-1)");
      const links = findElements(hast, "a");

      expect(links).toHaveLength(1);
      expect(links[0].properties?.href).toBe("/blog/post-1");
    });
  });

  describe("semantic HTML preservation", () => {
    it("preserves paragraph elements", async () => {
      const html = await toHtmlString("This is a paragraph.");
      expect(html).toContain("<p>");
      expect(html).toContain("</p>");
    });

    it("preserves heading elements h1-h6", async () => {
      const markdown = `# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6`;
      const html = await toHtmlString(markdown);

      expect(html).toContain("<h1>");
      expect(html).toContain("<h2>");
      expect(html).toContain("<h3>");
      expect(html).toContain("<h4>");
      expect(html).toContain("<h5>");
      expect(html).toContain("<h6>");
    });

    it("preserves emphasis and strong", async () => {
      const html = await toHtmlString("*italic* and **bold**");
      expect(html).toContain("<em>");
      expect(html).toContain("<strong>");
    });

    it("preserves blockquotes", async () => {
      const html = await toHtmlString("> This is a quote");
      expect(html).toContain("<blockquote>");
    });

    it("preserves code blocks", async () => {
      const html = await toHtmlString("```\ncode\n```");
      expect(html).toMatch(/<pre[\s>]/);
      expect(html).toMatch(/<code[\s>]/);
    });

    it("preserves inline code", async () => {
      const html = await toHtmlString("Use `const` here");
      expect(html).toMatch(/<code[\s>]/);
    });

    it("preserves unordered lists", async () => {
      const html = await toHtmlString("- Item 1\n- Item 2");
      expect(html).toContain("<ul>");
      expect(html).toContain("<li>");
    });

    it("preserves ordered lists", async () => {
      const html = await toHtmlString("1. First\n2. Second");
      expect(html).toContain("<ol>");
      expect(html).toContain("<li>");
    });

    it("preserves horizontal rules", async () => {
      const html = await toHtmlString("---");
      expect(html).toContain("<hr>");
    });

    it("preserves line breaks", async () => {
      const html = await toHtmlString("Line 1  \nLine 2");
      expect(html).toContain("<br>");
    });

    it("preserves strikethrough (del)", async () => {
      const html = await toHtmlString("~~deleted~~");
      expect(html).toContain("<del>");
    });
  });

  describe("GFM table preservation", () => {
    it("preserves table structure", async () => {
      const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;
      const html = await toHtmlString(markdown);

      expect(html).toContain("<table>");
      expect(html).toContain("<thead>");
      expect(html).toContain("<tbody>");
      expect(html).toContain("<tr>");
      expect(html).toContain("<th>");
      expect(html).toContain("<td>");
    });

    it("preserves table alignment attributes", async () => {
      const markdown = `
| Left | Center | Right |
|:-----|:------:|------:|
| L    |   C    |     R |
`;
      const hast = await transformToHast(markdown);
      const thElements = findElements(hast, "th");

      const aligns = thElements.map((th) => th.properties?.align);
      expect(aligns).toContain("left");
      expect(aligns).toContain("center");
      expect(aligns).toContain("right");
    });

    it("preserves multi-row tables", async () => {
      const markdown = `
| A | B |
|---|---|
| 1 | 2 |
| 3 | 4 |
| 5 | 6 |
`;
      const hast = await transformToHast(markdown);
      const rows = findElements(hast, "tr");

      expect(rows.length).toBe(4);
    });
  });

  describe("code block attributes", () => {
    it("preserves language identifier on code blocks", async () => {
      const html = await toHtmlString("```typescript\nconst x = 1;\n```");
      expect(html).toMatch(/data-language="typescript"/);
    });

    it("handles code blocks without language", async () => {
      const html = await toHtmlString("```\nplain code\n```");
      expect(html).toMatch(/<pre[\s>]/);
      expect(html).toMatch(/<code[\s>]/);
    });
  });

  describe("HAST output structure", () => {
    it("returns valid HAST root node", async () => {
      const hast = await transformToHast("# Hello");

      expect(hast.type).toBe("root");
      expect(hast.children).toBeDefined();
      expect(Array.isArray(hast.children)).toBe(true);
    });

    it("contains element nodes", async () => {
      const hast = await transformToHast("# Hello\n\nParagraph");

      const elements = hast.children.filter((c) => c.type === "element");
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
