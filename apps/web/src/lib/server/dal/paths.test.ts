import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { SecurityError } from "./errors";
import { ALLOWED_ROOTS, resolvePath } from "./paths";

describe("resolvePath", () => {
  describe("valid paths", () => {
    it("resolves a simple slug to absolute path", () => {
      const result = resolvePath("thoughts", "2026-01-15-reflection.md");
      expect(result).toBe("/thoughts/2026-01-15-reflection.md");
    });

    it("resolves nested paths", () => {
      const result = resolvePath("dreams", "poetry/awakening.md");
      expect(result).toBe("/dreams/poetry/awakening.md");
    });

    it("works with all allowed roots", () => {
      for (const root of Object.keys(ALLOWED_ROOTS) as Array<
        keyof typeof ALLOWED_ROOTS
      >) {
        const result = resolvePath(root, "test.md");
        expect(result).toBe(`${ALLOWED_ROOTS[root]}/test.md`);
      }
    });
  });

  describe("about root", () => {
    it("resolves about.md to /about/about.md", () => {
      const result = resolvePath("about", "about.md");
      expect(result).toBe("/about/about.md");
    });

    it("rejects traversal to sibling directory", () => {
      expect(() => resolvePath("about", "../thoughts")).toThrow(SecurityError);
    });

    it("rejects complex traversal attack", () => {
      expect(() => resolvePath("about", "foo/../../../etc/passwd")).toThrow(
        SecurityError
      );
    });
  });

  describe("directory traversal attacks", () => {
    it("rejects ../etc/passwd", () => {
      expect(() => resolvePath("thoughts", "../etc/passwd")).toThrow(
        SecurityError
      );
    });

    it("rejects foo/../../../etc/passwd", () => {
      expect(() => resolvePath("thoughts", "foo/../../../etc/passwd")).toThrow(
        SecurityError
      );
    });

    it("rejects simple .. traversal", () => {
      expect(() => resolvePath("dreams", "..")).toThrow(SecurityError);
    });

    it("rejects hidden traversal in middle of path", () => {
      expect(() => resolvePath("sandbox", "safe/../../../etc/shadow")).toThrow(
        SecurityError
      );
    });
  });

  describe("null byte injection", () => {
    it("rejects foo\\0bar", () => {
      expect(() => resolvePath("thoughts", "foo\0bar")).toThrow(SecurityError);
    });

    it("rejects null byte at start", () => {
      expect(() => resolvePath("dreams", "\0malicious.md")).toThrow(
        SecurityError
      );
    });

    it("rejects null byte at end", () => {
      expect(() => resolvePath("projects", "file.md\0")).toThrow(SecurityError);
    });
  });

  describe("SecurityError properties", () => {
    it("includes attempted path in error", () => {
      try {
        resolvePath("thoughts", "../etc/passwd");
      } catch (e) {
        expect(e).toBeInstanceOf(SecurityError);
        expect((e as SecurityError).attemptedPath).toBe("../etc/passwd");
      }
    });

    it("has correct error name", () => {
      try {
        resolvePath("logs", "foo\0bar");
      } catch (e) {
        expect((e as SecurityError).name).toBe("SecurityError");
      }
    });
  });
});
