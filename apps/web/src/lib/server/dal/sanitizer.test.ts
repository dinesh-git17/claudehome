import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { extractTitleFromMarkdown, sanitizeContent } from "./sanitizer";

describe("sanitizeContent", () => {
  describe("removes dangerous content", () => {
    it("removes script tags", () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeContent(input);
      expect(result).toBe("<p>Hello</p>");
      expect(result).not.toContain("script");
    });

    it("removes iframe tags", () => {
      const input = '<p>Content</p><iframe src="evil.com"></iframe>';
      const result = sanitizeContent(input);
      expect(result).toBe("<p>Content</p>");
      expect(result).not.toContain("iframe");
    });

    it("removes onclick and other event handlers", () => {
      const input = '<p onclick="alert(1)">Click me</p>';
      const result = sanitizeContent(input);
      expect(result).toBe("<p>Click me</p>");
      expect(result).not.toContain("onclick");
    });

    it("removes onmouseover attributes", () => {
      const input = '<a href="#" onmouseover="alert(1)">Link</a>';
      const result = sanitizeContent(input);
      expect(result).toBe('<a href="#">Link</a>');
      expect(result).not.toContain("onmouseover");
    });

    it("removes javascript: URLs", () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeContent(input);
      expect(result).toBe("<a>Click</a>");
    });
  });

  describe("preserves safe markdown-generated HTML", () => {
    it("preserves paragraph tags", () => {
      const input = "<p>Hello world</p>";
      expect(sanitizeContent(input)).toBe("<p>Hello world</p>");
    });

    it("preserves heading tags h1-h6", () => {
      const input = "<h1>Title</h1><h2>Subtitle</h2><h6>Small</h6>";
      expect(sanitizeContent(input)).toBe(
        "<h1>Title</h1><h2>Subtitle</h2><h6>Small</h6>"
      );
    });

    it("preserves anchor tags with safe href", () => {
      const input = '<a href="https://example.com">Link</a>';
      expect(sanitizeContent(input)).toBe(
        '<a href="https://example.com">Link</a>'
      );
    });

    it("preserves code and pre tags", () => {
      const input = '<pre><code class="language-js">const x = 1;</code></pre>';
      expect(sanitizeContent(input)).toBe(
        '<pre><code class="language-js">const x = 1;</code></pre>'
      );
    });

    it("preserves list tags", () => {
      const input = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      expect(sanitizeContent(input)).toBe(
        "<ul><li>Item 1</li><li>Item 2</li></ul>"
      );
    });

    it("preserves ordered list tags", () => {
      const input = "<ol><li>First</li><li>Second</li></ol>";
      expect(sanitizeContent(input)).toBe(
        "<ol><li>First</li><li>Second</li></ol>"
      );
    });

    it("preserves blockquote tags", () => {
      const input = "<blockquote>A quote</blockquote>";
      expect(sanitizeContent(input)).toBe("<blockquote>A quote</blockquote>");
    });

    it("preserves em and strong tags", () => {
      const input = "<p><em>italic</em> and <strong>bold</strong></p>";
      expect(sanitizeContent(input)).toBe(
        "<p><em>italic</em> and <strong>bold</strong></p>"
      );
    });
  });
});

describe("extractTitleFromMarkdown", () => {
  it("extracts simple H1 title", () => {
    const content = "# Hello World\n\nSome content here.";
    expect(extractTitleFromMarkdown(content)).toBe("Hello World");
  });

  it("extracts H1 with bold text", () => {
    const content = "# Title with **bold** text\n\nContent.";
    expect(extractTitleFromMarkdown(content)).toBe("Title with bold text");
  });

  it("returns null when no H1 present", () => {
    const content = "## Only H2\n\nNo H1 heading here.";
    expect(extractTitleFromMarkdown(content)).toBeNull();
  });

  it("returns null for empty content", () => {
    expect(extractTitleFromMarkdown("")).toBeNull();
  });

  it("extracts first H1 when multiple exist", () => {
    const content = "# First Title\n\n# Second Title";
    expect(extractTitleFromMarkdown(content)).toBe("First Title");
  });

  it("handles H1 with leading/trailing whitespace", () => {
    const content = "#    Spaced Title   \n\nContent.";
    expect(extractTitleFromMarkdown(content)).toBe("Spaced Title");
  });

  it("does not match ## or higher as H1", () => {
    const content = "## Not H1\n### Also not H1";
    expect(extractTitleFromMarkdown(content)).toBeNull();
  });
});
