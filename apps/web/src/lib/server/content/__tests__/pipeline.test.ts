import type { RootContent } from "mdast";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { parseMarkdown } from "../pipeline";

describe("parseMarkdown", () => {
  describe("basic parsing", () => {
    it("returns Root node with correct type", () => {
      const result = parseMarkdown("# Hello");

      expect(result.type).toBe("root");
      expect(result.children).toBeDefined();
      expect(Array.isArray(result.children)).toBe(true);
    });

    it("parses heading elements", () => {
      const result = parseMarkdown("# Heading 1\n## Heading 2");

      expect(result.children).toHaveLength(2);
      expect(result.children[0].type).toBe("heading");
      expect((result.children[0] as { depth: number }).depth).toBe(1);
      expect(result.children[1].type).toBe("heading");
      expect((result.children[1] as { depth: number }).depth).toBe(2);
    });

    it("parses paragraph elements", () => {
      const result = parseMarkdown("This is a paragraph.");

      expect(result.children).toHaveLength(1);
      expect(result.children[0].type).toBe("paragraph");
    });

    it("parses code blocks", () => {
      const result = parseMarkdown("```typescript\nconst x = 1;\n```");

      expect(result.children).toHaveLength(1);
      expect(result.children[0].type).toBe("code");
      expect((result.children[0] as { lang: string }).lang).toBe("typescript");
    });

    it("parses inline code", () => {
      const result = parseMarkdown("Use `const` for constants.");

      const paragraph = result.children[0] as { children: { type: string }[] };
      const inlineCode = paragraph.children.find(
        (c) => c.type === "inlineCode"
      );
      expect(inlineCode).toBeDefined();
    });

    it("parses blockquotes", () => {
      const result = parseMarkdown("> This is a quote");

      expect(result.children[0].type).toBe("blockquote");
    });

    it("parses unordered lists", () => {
      const result = parseMarkdown("- Item 1\n- Item 2\n- Item 3");

      expect(result.children[0].type).toBe("list");
      expect((result.children[0] as { ordered: boolean }).ordered).toBe(false);
    });

    it("parses ordered lists", () => {
      const result = parseMarkdown("1. First\n2. Second\n3. Third");

      expect(result.children[0].type).toBe("list");
      expect((result.children[0] as { ordered: boolean }).ordered).toBe(true);
    });

    it("parses horizontal rules", () => {
      const result = parseMarkdown("---");

      expect(result.children[0].type).toBe("thematicBreak");
    });

    it("parses links", () => {
      const result = parseMarkdown("[Link text](https://example.com)");

      const paragraph = result.children[0] as {
        children: { type: string; url?: string }[];
      };
      const link = paragraph.children.find((c) => c.type === "link");
      expect(link).toBeDefined();
      expect(link?.url).toBe("https://example.com");
    });

    it("parses images", () => {
      const result = parseMarkdown("![Alt text](/image.png)");

      const paragraph = result.children[0] as {
        children: { type: string; url?: string }[];
      };
      const image = paragraph.children.find((c) => c.type === "image");
      expect(image).toBeDefined();
      expect(image?.url).toBe("/image.png");
    });

    it("parses emphasis", () => {
      const result = parseMarkdown("*italic* and **bold**");

      const paragraph = result.children[0] as { children: { type: string }[] };
      const emphasis = paragraph.children.find((c) => c.type === "emphasis");
      const strong = paragraph.children.find((c) => c.type === "strong");
      expect(emphasis).toBeDefined();
      expect(strong).toBeDefined();
    });
  });

  describe("GFM tables", () => {
    it("parses simple table structure", () => {
      const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
      const result = parseMarkdown(markdown);

      const table = result.children.find(
        (c: RootContent) => c.type === "table"
      );
      expect(table).toBeDefined();
    });

    it("preserves table rows and cells", () => {
      const markdown = `
| A | B |
|---|---|
| 1 | 2 |
`;
      const result = parseMarkdown(markdown);

      const table = result.children.find(
        (c: RootContent) => c.type === "table"
      ) as {
        children: { type: string; children: { type: string }[] }[];
      };
      expect(table.children.length).toBeGreaterThan(0);
      expect(table.children[0].type).toBe("tableRow");
      expect(table.children[0].children[0].type).toBe("tableCell");
    });

    it("handles table alignment", () => {
      const markdown = `
| Left | Center | Right |
|:-----|:------:|------:|
| L    |   C    |     R |
`;
      const result = parseMarkdown(markdown);

      const table = result.children.find(
        (c: RootContent) => c.type === "table"
      ) as {
        align: (string | null)[];
      };
      expect(table.align).toEqual(["left", "center", "right"]);
    });
  });

  describe("GFM task lists", () => {
    it("parses unchecked task items", () => {
      const markdown = "- [ ] Todo item";
      const result = parseMarkdown(markdown);

      const list = result.children[0] as {
        children: { type: string; checked: boolean | null }[];
      };
      expect(list.children[0].type).toBe("listItem");
      expect(list.children[0].checked).toBe(false);
    });

    it("parses checked task items", () => {
      const markdown = "- [x] Completed item";
      const result = parseMarkdown(markdown);

      const list = result.children[0] as {
        children: { type: string; checked: boolean | null }[];
      };
      expect(list.children[0].checked).toBe(true);
    });

    it("parses mixed task list", () => {
      const markdown = `
- [x] Done
- [ ] Not done
- [x] Also done
`;
      const result = parseMarkdown(markdown);

      const list = result.children.find(
        (c: RootContent) => c.type === "list"
      ) as {
        children: { checked: boolean | null }[];
      };
      expect(list.children[0].checked).toBe(true);
      expect(list.children[1].checked).toBe(false);
      expect(list.children[2].checked).toBe(true);
    });
  });

  describe("GFM strikethrough", () => {
    it("parses strikethrough syntax", () => {
      const markdown = "~~deleted text~~";
      const result = parseMarkdown(markdown);

      const paragraph = result.children[0] as { children: { type: string }[] };
      const deleted = paragraph.children.find((c) => c.type === "delete");
      expect(deleted).toBeDefined();
    });

    it("parses inline strikethrough", () => {
      const markdown = "This has ~~some~~ deleted words.";
      const result = parseMarkdown(markdown);

      const paragraph = result.children[0] as { children: { type: string }[] };
      const deleted = paragraph.children.find((c) => c.type === "delete");
      expect(deleted).toBeDefined();
    });
  });

  describe("GFM autolinks", () => {
    it("parses bare URLs as links", () => {
      const markdown = "Visit https://example.com for more.";
      const result = parseMarkdown(markdown);

      const paragraph = result.children[0] as {
        children: { type: string; url?: string }[];
      };
      const link = paragraph.children.find((c) => c.type === "link");
      expect(link).toBeDefined();
      expect(link?.url).toBe("https://example.com");
    });

    it("parses www URLs as links", () => {
      const markdown = "Check www.example.com today.";
      const result = parseMarkdown(markdown);

      const paragraph = result.children[0] as {
        children: { type: string; url?: string }[];
      };
      const link = paragraph.children.find((c) => c.type === "link");
      expect(link).toBeDefined();
    });

    it("parses email autolinks", () => {
      const markdown = "Contact user@example.com for help.";
      const result = parseMarkdown(markdown);

      const paragraph = result.children[0] as {
        children: { type: string; url?: string }[];
      };
      const link = paragraph.children.find((c) => c.type === "link");
      expect(link).toBeDefined();
      expect(link?.url).toBe("mailto:user@example.com");
    });
  });

  describe("performance", () => {
    it("parses 5KB content in under 20ms median (test env)", () => {
      const filler = "Lorem ipsum dolor sit amet. ";
      const targetSize = 5000;
      let content = "# Document\n\n";
      while (content.length < targetSize) {
        content += filler;
      }
      content = content.slice(0, targetSize);

      for (let i = 0; i < 5; i++) {
        parseMarkdown(content);
      }

      const iterations = 20;
      const times: number[] = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        parseMarkdown(content);
        times.push(performance.now() - start);
      }

      times.sort((a, b) => a - b);
      const median = times[Math.floor(iterations / 2)];

      expect(content.length).toBe(targetSize);
      expect(median).toBeLessThan(20);
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      const result = parseMarkdown("");

      expect(result.type).toBe("root");
      expect(result.children).toHaveLength(0);
    });

    it("handles whitespace-only string", () => {
      const result = parseMarkdown("   \n\n   ");

      expect(result.type).toBe("root");
    });

    it("handles nested structures", () => {
      const markdown = `
> ### Quoted heading
>
> - List in quote
>   - Nested item
`;
      const result = parseMarkdown(markdown);

      const blockquote = result.children.find(
        (c: RootContent) => c.type === "blockquote"
      );
      expect(blockquote).toBeDefined();
    });
  });
});
