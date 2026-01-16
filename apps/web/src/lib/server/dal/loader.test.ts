import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

import { readFile } from "node:fs/promises";

import { FileSystemError, ValidationError } from "./errors";
import { readContent } from "./loader";

const mockedReadFile = vi.mocked(readFile);

const TestSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  tags: z.array(z.string()).optional(),
});

describe("readContent", () => {
  describe("successful parsing", () => {
    it("parses valid frontmatter and returns typed result", async () => {
      mockedReadFile.mockResolvedValue(`---
title: Test Post
date: '2026-01-15'
tags:
  - typescript
  - testing
---
# Hello World

This is the content.
`);

      const result = await readContent("/thoughts/test.md", TestSchema);

      expect(result.meta).toEqual({
        title: "Test Post",
        date: "2026-01-15",
        tags: ["typescript", "testing"],
      });
      expect(result.content.trim()).toBe(
        "# Hello World\n\nThis is the content."
      );
    });

    it("handles optional fields correctly", async () => {
      mockedReadFile.mockResolvedValue(`---
title: Minimal Post
date: '2026-01-16'
---
Content without tags.
`);

      const result = await readContent("/dreams/minimal.md", TestSchema);

      expect(result.meta.title).toBe("Minimal Post");
      expect(result.meta.tags).toBeUndefined();
    });

    it("preserves raw content without frontmatter delimiters", async () => {
      mockedReadFile.mockResolvedValue(`---
title: Content Test
date: '2026-01-15'
---
Line 1
Line 2
Line 3
`);

      const result = await readContent("/test.md", TestSchema);

      expect(result.content).not.toContain("---");
      expect(result.content.trim()).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("validation errors", () => {
    it("throws ValidationError when required field is missing", async () => {
      mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
---
Missing title field.
`);

      await expect(readContent("/test.md", TestSchema)).rejects.toThrow(
        ValidationError
      );
    });

    it("includes zodError in ValidationError", async () => {
      mockedReadFile.mockResolvedValue(`---
title: ''
date: '2026-01-15'
---
Empty title should fail min(1).
`);

      try {
        await readContent("/test.md", TestSchema);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        const ve = e as ValidationError;
        expect(ve.zodError).toBeDefined();
        expect(ve.path).toBe("/test.md");
      }
    });

    it("throws ValidationError for wrong field type", async () => {
      mockedReadFile.mockResolvedValue(`---
title: Valid Title
date: 12345
---
Date should be string, not number.
`);

      await expect(readContent("/test.md", TestSchema)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe("filesystem errors", () => {
    it("throws FileSystemError on ENOENT", async () => {
      const enoent = new Error("ENOENT: no such file") as NodeJS.ErrnoException;
      enoent.code = "ENOENT";
      mockedReadFile.mockRejectedValue(enoent);

      try {
        await readContent("/nonexistent.md", TestSchema);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(FileSystemError);
        const fse = e as FileSystemError;
        expect(fse.code).toBe("ENOENT");
        expect(fse.path).toBe("/nonexistent.md");
      }
    });

    it("throws FileSystemError on EACCES", async () => {
      const eacces = new Error(
        "EACCES: permission denied"
      ) as NodeJS.ErrnoException;
      eacces.code = "EACCES";
      mockedReadFile.mockRejectedValue(eacces);

      try {
        await readContent("/protected.md", TestSchema);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(FileSystemError);
        const fse = e as FileSystemError;
        expect(fse.code).toBe("EACCES");
      }
    });

    it("throws FileSystemError on other IO errors", async () => {
      const eio = new Error("EIO: input/output error") as NodeJS.ErrnoException;
      eio.code = "EIO";
      mockedReadFile.mockRejectedValue(eio);

      await expect(readContent("/bad-disk.md", TestSchema)).rejects.toThrow(
        FileSystemError
      );
    });
  });
});
