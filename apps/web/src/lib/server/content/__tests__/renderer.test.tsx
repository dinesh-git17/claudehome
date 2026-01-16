import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    title,
  }: {
    href: string;
    children: React.ReactNode;
    title?: string;
  }) => (
    <a href={href} data-nextjs-link="true" title={title}>
      {children}
    </a>
  ),
}));

import { renderToStaticMarkup } from "react-dom/server";

import { MarkdownRenderer } from "../renderer";

async function renderMarkdown(
  content: string,
  className?: string
): Promise<string> {
  const element = await MarkdownRenderer({ content, className });
  return renderToStaticMarkup(element);
}

describe("MarkdownRenderer", () => {
  describe("basic rendering", () => {
    it("renders paragraph content", async () => {
      const html = await renderMarkdown("Hello world");

      expect(html).toContain("<p>");
      expect(html).toContain("Hello world");
    });

    it("renders headings", async () => {
      const html = await renderMarkdown("# Heading 1\n## Heading 2");

      expect(html).toContain("<h1>");
      expect(html).toContain("Heading 1");
      expect(html).toContain("<h2>");
      expect(html).toContain("Heading 2");
    });

    it("renders emphasis and strong", async () => {
      const html = await renderMarkdown("*italic* and **bold**");

      expect(html).toContain("<em>");
      expect(html).toContain("italic");
      expect(html).toContain("<strong>");
      expect(html).toContain("bold");
    });

    it("wraps content in div when className provided", async () => {
      const html = await renderMarkdown("Content", "prose");

      expect(html).toContain('<div class="prose">');
    });
  });

  describe("link handling", () => {
    it("uses next/link for internal relative paths", async () => {
      const html = await renderMarkdown("[About](/about)");

      expect(html).toContain('data-nextjs-link="true"');
      expect(html).toContain('href="/about"');
    });

    it("uses next/link for anchor links", async () => {
      const html = await renderMarkdown("[Section](#section)");

      expect(html).toContain('data-nextjs-link="true"');
      expect(html).toContain('href="#section"');
    });

    it("uses standard anchor for external links", async () => {
      const html = await renderMarkdown("[External](https://example.com)");

      expect(html).not.toContain("data-nextjs-link");
      expect(html).toContain('href="https://example.com"');
    });

    it("preserves security attributes on external links", async () => {
      const html = await renderMarkdown("[External](https://example.com)");

      expect(html).toContain("noopener");
      expect(html).toContain("noreferrer");
      expect(html).toContain('target="_blank"');
    });

    it("does not add target to internal links", async () => {
      const html = await renderMarkdown("[Internal](/page)");

      expect(html).not.toContain('target="_blank"');
    });
  });

  describe("image handling", () => {
    it("renders images as standard img elements", async () => {
      const html = await renderMarkdown("![Alt text](/image.png)");

      expect(html).toContain("<img");
      expect(html).toContain('alt="Alt text"');
      expect(html).toContain('src="/image.png"');
    });

    it("handles images with titles", async () => {
      const html = await renderMarkdown('![Alt](/img.png "Title")');

      expect(html).toContain("<img");
      expect(html).toContain('title="Title"');
    });
  });

  describe("code blocks", () => {
    it("renders code blocks with pre element", async () => {
      const html = await renderMarkdown("```javascript\nconst x = 1;\n```");

      expect(html).toContain("<pre");
      expect(html).toContain("<code");
    });

    it("renders inline code", async () => {
      const html = await renderMarkdown("Use `const` keyword");

      expect(html).toContain("<code");
      expect(html).toContain("const");
    });
  });

  describe("lists", () => {
    it("renders unordered lists", async () => {
      const html = await renderMarkdown("- Item 1\n- Item 2\n- Item 3");

      expect(html).toContain("<ul>");
      expect(html).toContain("<li>");
      expect(html).toContain("Item 1");
      expect(html).toContain("Item 2");
      expect(html).toContain("Item 3");
    });

    it("renders ordered lists", async () => {
      const html = await renderMarkdown("1. First\n2. Second\n3. Third");

      expect(html).toContain("<ol>");
      expect(html).toContain("<li>");
    });

    it("renders nested lists without key warnings", async () => {
      const markdown = `- Parent 1
  - Child 1
  - Child 2
- Parent 2`;
      const html = await renderMarkdown(markdown);

      expect(html).toContain("<ul>");
      expect(html).toContain("Parent 1");
      expect(html).toContain("Child 1");
    });
  });

  describe("tables", () => {
    it("renders GFM tables", async () => {
      const markdown = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`;
      const html = await renderMarkdown(markdown);

      expect(html).toContain("<table>");
      expect(html).toContain("<thead>");
      expect(html).toContain("<tbody>");
      expect(html).toContain("<th>");
      expect(html).toContain("<td>");
    });
  });

  describe("error handling", () => {
    it("renders error message for malformed content", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const originalTransform = await import("../pipeline");
      vi.spyOn(originalTransform, "transformToHast").mockRejectedValueOnce(
        new Error("Parse error")
      );

      const { MarkdownRenderer: FreshRenderer } = await import("../renderer");
      const element = await FreshRenderer({ content: "test" });
      const html = renderToStaticMarkup(element);

      expect(html).toContain("Failed to render content");
      expect(html).toContain('role="alert"');

      vi.restoreAllMocks();
    });
  });

  describe("blockquotes", () => {
    it("renders blockquotes", async () => {
      const html = await renderMarkdown("> This is a quote");

      expect(html).toContain("<blockquote>");
      expect(html).toContain("This is a quote");
    });

    it("renders nested blockquotes", async () => {
      const html = await renderMarkdown("> Level 1\n>> Level 2");

      expect(html).toContain("<blockquote>");
    });
  });

  describe("horizontal rules", () => {
    it("renders horizontal rules", async () => {
      const html = await renderMarkdown("---");

      expect(html).toContain("<hr");
    });
  });
});
