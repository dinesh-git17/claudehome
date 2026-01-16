import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { toHtml } from "hast-util-to-html";

import { transformToHast } from "../pipeline";

async function toHtmlString(markdown: string): Promise<string> {
  const hast = await transformToHast(markdown);
  return toHtml(hast);
}

describe("Syntax Highlighting", () => {
  describe("code block transformation", () => {
    it("transforms TypeScript code blocks with syntax tokens", async () => {
      const html = await toHtmlString(
        "```typescript\nconst x: number = 42;\n```"
      );

      expect(html).toContain('data-language="typescript"');
      expect(html).toContain("<span");
      expect(html).toContain("const");
    });

    it("transforms JavaScript code blocks", async () => {
      const html = await toHtmlString(
        "```javascript\nfunction hello() { return 'world'; }\n```"
      );

      expect(html).toContain('data-language="javascript"');
      expect(html).toContain("<span");
    });

    it("transforms JSX code blocks", async () => {
      const html = await toHtmlString(
        "```jsx\nconst App = () => <div>Hello</div>;\n```"
      );

      expect(html).toContain('data-language="jsx"');
    });

    it("transforms TSX code blocks", async () => {
      const html = await toHtmlString(
        "```tsx\nconst App: React.FC = () => <div>Hello</div>;\n```"
      );

      expect(html).toContain('data-language="tsx"');
    });

    it("transforms JSON code blocks", async () => {
      const html = await toHtmlString('```json\n{"key": "value"}\n```');

      expect(html).toContain('data-language="json"');
    });

    it("transforms bash code blocks", async () => {
      const html = await toHtmlString("```bash\necho 'hello world'\n```");

      expect(html).toContain('data-language="bash"');
    });

    it("transforms Python code blocks", async () => {
      const html = await toHtmlString(
        "```python\ndef hello():\n    return 'world'\n```"
      );

      expect(html).toContain('data-language="python"');
    });

    it("transforms CSS code blocks", async () => {
      const html = await toHtmlString("```css\n.foo { color: red; }\n```");

      expect(html).toContain('data-language="css"');
    });

    it("transforms HTML code blocks", async () => {
      const html = await toHtmlString(
        '```html\n<div class="foo">bar</div>\n```'
      );

      expect(html).toContain('data-language="html"');
    });

    it("transforms YAML code blocks", async () => {
      const html = await toHtmlString("```yaml\nkey: value\n```");

      expect(html).toContain('data-language="yaml"');
    });

    it("transforms Markdown code blocks", async () => {
      const html = await toHtmlString("```markdown\n# Heading\n```");

      expect(html).toContain('data-language="markdown"');
    });
  });

  describe("CSS variable theming", () => {
    it("uses CSS variables for syntax colors", async () => {
      const html = await toHtmlString(
        "```typescript\nconst x = 'string';\n```"
      );

      expect(html).toMatch(/var\(--color-/);
    });

    it("does not contain hardcoded hex colors", async () => {
      const html = await toHtmlString(
        "```typescript\nconst x = 42;\nfunction foo() { return x; }\n```"
      );

      expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    });

    it("does not contain rgb/rgba colors", async () => {
      const html = await toHtmlString("```typescript\nconst x = 'test';\n```");

      expect(html).not.toMatch(/rgba?\s*\(/i);
    });

    it("applies theme-specific colors to keywords", async () => {
      const html = await toHtmlString("```typescript\nconst x = 1;\n```");

      expect(html).toContain("var(--color-");
    });
  });

  describe("unsupported language fallback", () => {
    it("handles unknown languages gracefully", async () => {
      const html = await toHtmlString("```unknownlang\nsome code here\n```");

      expect(html).toMatch(/<pre[\s>]/);
      expect(html).toMatch(/<code[\s>]/);
      expect(html).toContain("some code here");
    });

    it("treats unknown languages as plain text", async () => {
      const html = await toHtmlString("```rust\nfn main() {}\n```");

      expect(html).toMatch(/<pre[\s>]/);
    });

    it("handles code blocks without language specifier", async () => {
      const html = await toHtmlString("```\nplain text\n```");

      expect(html).toContain('data-language="text"');
      expect(html).toContain("plain text");
    });
  });

  describe("inline code", () => {
    it("transforms inline code with syntax highlighting", async () => {
      const html = await toHtmlString("Use `const` for constants.");

      expect(html).toMatch(/<code[\s>]/);
      expect(html).toContain("const");
    });
  });

  describe("multi-line code blocks", () => {
    it("preserves line structure", async () => {
      const code =
        "```typescript\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```";
      const html = await toHtmlString(code);

      expect(html).toContain("data-line");
    });

    it("handles large code blocks", async () => {
      const lines = Array.from(
        { length: 50 },
        (_, i) => `const line${i} = ${i};`
      );
      const code = "```typescript\n" + lines.join("\n") + "\n```";
      const html = await toHtmlString(code);

      expect(html).toContain('data-language="typescript"');
      expect(html).toContain("line49");
    });
  });

  describe("special characters in code", () => {
    it("handles HTML entities in code", async () => {
      const html = await toHtmlString(
        "```html\n<div>&amp; &lt; &gt;</div>\n```"
      );

      expect(html).toContain('data-language="html"');
    });

    it("handles quotes in strings", async () => {
      const html = await toHtmlString(
        '```javascript\nconst x = "hello \\"world\\"";\n```'
      );

      expect(html).toContain('data-language="javascript"');
    });

    it("handles backticks in code", async () => {
      const html = await toHtmlString(
        "````typescript\nconst x = `template`;\n````"
      );

      expect(html).toContain('data-language="typescript"');
    });
  });

  describe("code block structure", () => {
    it("wraps code blocks in figure element", async () => {
      const html = await toHtmlString("```typescript\nconst x = 1;\n```");

      expect(html).toContain("<figure");
      expect(html).toContain("data-rehype-pretty-code-figure");
    });

    it("includes theme identifier", async () => {
      const html = await toHtmlString("```typescript\nconst x = 1;\n```");

      expect(html).toContain('data-theme="contemplative"');
    });
  });

  describe("line highlighting", () => {
    it("highlights single line with {N} syntax", async () => {
      const html = await toHtmlString(
        "```typescript {1}\nconst a = 1;\nconst b = 2;\n```"
      );

      expect(html).toContain("data-highlighted-line");
    });

    it("highlights range of lines with {N-M} syntax", async () => {
      const html = await toHtmlString(
        "```typescript {1-2}\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```"
      );

      const matches = html.match(/data-highlighted-line/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(2);
    });

    it("highlights multiple specific lines with {N,M,O} syntax", async () => {
      const html = await toHtmlString(
        "```typescript {1,3}\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```"
      );

      expect(html).toContain("data-highlighted-line");
    });

    it("highlights mixed ranges with {N,M-O} syntax", async () => {
      const html = await toHtmlString(
        "```typescript {1,3-4}\nconst a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\n```"
      );

      expect(html).toContain("data-highlighted-line");
    });

    it("preserves line data attributes for non-highlighted lines", async () => {
      const html = await toHtmlString(
        "```typescript {1}\nconst a = 1;\nconst b = 2;\n```"
      );

      expect(html).toContain("data-line");
    });
  });

  describe("line numbers", () => {
    it("renders line numbers with showLineNumbers", async () => {
      const html = await toHtmlString(
        "```typescript showLineNumbers\nconst a = 1;\nconst b = 2;\n```"
      );

      expect(html).toContain("data-line-numbers");
    });

    it("renders line numbers starting from custom value", async () => {
      const html = await toHtmlString(
        "```typescript showLineNumbers{5}\nconst a = 1;\nconst b = 2;\n```"
      );

      expect(html).toContain("data-line-numbers");
    });

    it("combines line numbers with line highlighting", async () => {
      const html = await toHtmlString(
        "```typescript showLineNumbers {2}\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```"
      );

      expect(html).toContain("data-line-numbers");
      expect(html).toContain("data-highlighted-line");
    });
  });
});
