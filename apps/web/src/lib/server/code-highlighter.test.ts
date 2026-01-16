import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getLanguageFromExtension,
  highlightSourceCode,
  isBinaryContent,
  isLanguageSupported,
  MAX_FILE_SIZE,
  processCodeFile,
} from "./code-highlighter";

describe("code-highlighter", () => {
  describe("MAX_FILE_SIZE", () => {
    it("is 512KB (524288 bytes)", () => {
      expect(MAX_FILE_SIZE).toBe(524288);
    });
  });

  describe("getLanguageFromExtension", () => {
    it("maps ts to typescript", () => {
      expect(getLanguageFromExtension("ts")).toBe("typescript");
    });

    it("maps tsx to tsx", () => {
      expect(getLanguageFromExtension("tsx")).toBe("tsx");
    });

    it("maps js to javascript", () => {
      expect(getLanguageFromExtension("js")).toBe("javascript");
    });

    it("maps jsx to jsx", () => {
      expect(getLanguageFromExtension("jsx")).toBe("jsx");
    });

    it("maps json to json", () => {
      expect(getLanguageFromExtension("json")).toBe("json");
    });

    it("maps md to markdown", () => {
      expect(getLanguageFromExtension("md")).toBe("markdown");
    });

    it("maps css to css", () => {
      expect(getLanguageFromExtension("css")).toBe("css");
    });

    it("maps html to html", () => {
      expect(getLanguageFromExtension("html")).toBe("html");
    });

    it("maps yaml to yaml", () => {
      expect(getLanguageFromExtension("yaml")).toBe("yaml");
    });

    it("maps yml to yaml", () => {
      expect(getLanguageFromExtension("yml")).toBe("yaml");
    });

    it("maps py to python", () => {
      expect(getLanguageFromExtension("py")).toBe("python");
    });

    it("maps sh to bash", () => {
      expect(getLanguageFromExtension("sh")).toBe("bash");
    });

    it("handles extension with leading dot", () => {
      expect(getLanguageFromExtension(".ts")).toBe("typescript");
    });

    it("handles uppercase extension", () => {
      expect(getLanguageFromExtension("TS")).toBe("typescript");
    });

    it("returns text for unknown extension", () => {
      expect(getLanguageFromExtension("xyz")).toBe("text");
    });
  });

  describe("isLanguageSupported", () => {
    it("returns true for typescript", () => {
      expect(isLanguageSupported("typescript")).toBe(true);
    });

    it("returns true for javascript", () => {
      expect(isLanguageSupported("javascript")).toBe(true);
    });

    it("returns true for python", () => {
      expect(isLanguageSupported("python")).toBe(true);
    });

    it("returns false for text", () => {
      expect(isLanguageSupported("text")).toBe(false);
    });

    it("returns false for unknown language", () => {
      expect(isLanguageSupported("cobol")).toBe(false);
    });
  });

  describe("isBinaryContent", () => {
    it("returns true for content with null bytes", () => {
      expect(isBinaryContent("hello\0world")).toBe(true);
    });

    it("returns false for normal text", () => {
      expect(isBinaryContent("hello world")).toBe(false);
    });

    it("returns false for code with special characters", () => {
      const code = `const x = "hello";\nconsole.log(x);`;
      expect(isBinaryContent(code)).toBe(false);
    });

    it("returns true for high concentration of control characters", () => {
      // Create string with many non-printable characters
      const binary = Array(100)
        .fill(null)
        .map((_, i) => String.fromCharCode(i % 31))
        .join("");
      expect(isBinaryContent(binary)).toBe(true);
    });

    it("returns false for empty content", () => {
      expect(isBinaryContent("")).toBe(false);
    });

    it("allows tabs, newlines, and carriage returns", () => {
      const content = "line1\tindented\nline2\r\nline3";
      expect(isBinaryContent(content)).toBe(false);
    });
  });

  describe("highlightSourceCode", () => {
    it("returns HTML string for valid TypeScript code", async () => {
      const code = `const x: number = 42;`;
      const result = await highlightSourceCode(code, "typescript");

      expect(result.html).toContain("<pre");
      expect(result.html).toContain("</pre>");
      expect(result.language).toBe("typescript");
      expect(result.lineCount).toBe(1);
    });

    it("returns correct line count for multi-line code", async () => {
      const code = `line1\nline2\nline3`;
      const result = await highlightSourceCode(code, "javascript");

      expect(result.lineCount).toBe(3);
    });

    it("falls back to plain text for unsupported language", async () => {
      const code = `some content`;
      const result = await highlightSourceCode(code, "cobol");

      expect(result.language).toBe("text");
      expect(result.html).toContain("<pre");
    });

    it("escapes HTML in plain text fallback", async () => {
      const code = `<script>alert("xss")</script>`;
      const result = await highlightSourceCode(code, "unknown");

      expect(result.html).not.toContain("<script>");
      expect(result.html).toContain("&lt;script&gt;");
    });

    it("handles empty code", async () => {
      const result = await highlightSourceCode("", "typescript");
      expect(result.lineCount).toBe(1);
    });
  });

  describe("processCodeFile", () => {
    it("returns success for valid code file", async () => {
      const content = `const x = 1;`;
      const result = await processCodeFile(content, "ts");

      expect(result.status).toBe("success");
      expect(result.html).toBeDefined();
      expect(result.language).toBe("typescript");
      expect(result.fileSize).toBeGreaterThan(0);
    });

    it("returns too-large status for oversized file", async () => {
      const content = "x".repeat(MAX_FILE_SIZE + 1);
      const result = await processCodeFile(content, "ts");

      expect(result.status).toBe("too-large");
      expect(result.errorMessage).toContain("File too large");
      expect(result.errorMessage).toContain("512");
    });

    it("returns binary status for binary content", async () => {
      const content = "binary\0content";
      const result = await processCodeFile(content, "ts");

      expect(result.status).toBe("binary");
      expect(result.errorMessage).toContain("Binary file");
    });

    it("includes file size in result", async () => {
      const content = "test content";
      const result = await processCodeFile(content, "ts");

      expect(result.fileSize).toBe(Buffer.byteLength(content, "utf8"));
    });

    it("handles unknown extension by falling back to text", async () => {
      const content = "some content";
      const result = await processCodeFile(content, "xyz");

      expect(result.status).toBe("success");
      expect(result.language).toBe("text");
    });
  });
});
