import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

import { readdir, readFile } from "node:fs/promises";

import { ValidationError } from "../errors";
import {
  DreamSchema,
  DreamTypeEnum,
  getAllDreams,
  getDreamBySlug,
} from "./dreams";

const mockedReaddir = vi.mocked(readdir);
const mockedReadFile = vi.mocked(readFile);

describe("DreamSchema", () => {
  it("validates correct dream frontmatter", () => {
    const result = DreamSchema.safeParse({
      date: "2026-01-15",
      title: "Test Dream",
      type: "poetry",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid dream types", () => {
    for (const type of ["poetry", "ascii", "prose"]) {
      const result = DreamSchema.safeParse({
        date: "2026-01-15",
        title: "Test",
        type,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid dream type", () => {
    const result = DreamSchema.safeParse({
      date: "2026-01-15",
      title: "Test",
      type: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("requires type field", () => {
    const result = DreamSchema.safeParse({
      date: "2026-01-15",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("DreamTypeEnum", () => {
  it("exports enum values", () => {
    expect(DreamTypeEnum.options).toEqual(["poetry", "ascii", "prose"]);
  });
});

describe("getAllDreams", () => {
  it("returns dreams sorted by date descending", async () => {
    mockedReaddir.mockResolvedValue([
      "2026-01-10-early.md",
      "2026-01-15-latest.md",
    ] as unknown as Awaited<ReturnType<typeof readdir>>);

    mockedReadFile.mockImplementation((filepath) => {
      if ((filepath as string).includes("early")) {
        return Promise.resolve(`---
date: '2026-01-10'
title: Early Dream
type: prose
---
Content 1`);
      }
      return Promise.resolve(`---
date: '2026-01-15'
title: Latest Dream
type: poetry
---
Content 2`);
    });

    const result = await getAllDreams();

    expect(result).toHaveLength(2);
    expect(result[0].meta.title).toBe("Latest Dream");
    expect(result[1].meta.title).toBe("Early Dream");
  });

  it("derives slug from filename without extension", async () => {
    mockedReaddir.mockResolvedValue([
      "2026-01-15-awakening.md",
    ] as unknown as Awaited<ReturnType<typeof readdir>>);

    mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
title: Awakening
type: ascii
---
Content`);

    const result = await getAllDreams();

    expect(result[0].slug).toBe("2026-01-15-awakening");
  });

  it("returns empty array for empty directory", async () => {
    mockedReaddir.mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof readdir>>
    );

    const result = await getAllDreams();

    expect(result).toEqual([]);
  });

  it("returns empty array when directory does not exist", async () => {
    const enoent = new Error("ENOENT") as NodeJS.ErrnoException;
    enoent.code = "ENOENT";
    mockedReaddir.mockRejectedValue(enoent);

    const result = await getAllDreams();

    expect(result).toEqual([]);
  });

  it("skips files with invalid frontmatter", async () => {
    mockedReaddir.mockResolvedValue([
      "valid.md",
      "missing-type.md",
    ] as unknown as Awaited<ReturnType<typeof readdir>>);

    mockedReadFile.mockImplementation((filepath) => {
      if ((filepath as string).includes("missing-type")) {
        return Promise.resolve(`---
date: '2026-01-15'
title: No Type
---
Missing required type`);
      }
      return Promise.resolve(`---
date: '2026-01-15'
title: Valid Dream
type: prose
---
Content`);
    });

    const result = await getAllDreams();

    expect(result).toHaveLength(1);
    expect(result[0].meta.title).toBe("Valid Dream");
  });
});

describe("getDreamBySlug", () => {
  it("returns dream content for valid slug", async () => {
    mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
title: Found Dream
type: poetry
---
Dream verses here.`);

    const result = await getDreamBySlug("2026-01-15-vision");

    expect(result).not.toBeNull();
    expect(result?.meta.title).toBe("Found Dream");
    expect(result?.meta.type).toBe("poetry");
    expect(result?.content.trim()).toBe("Dream verses here.");
  });

  it("returns null for non-existent slug", async () => {
    const enoent = new Error("ENOENT") as NodeJS.ErrnoException;
    enoent.code = "ENOENT";
    mockedReadFile.mockRejectedValue(enoent);

    const result = await getDreamBySlug("nonexistent");

    expect(result).toBeNull();
  });

  it("throws ValidationError for file with invalid frontmatter", async () => {
    mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
title: Missing Type Field
---
Content without type.`);

    await expect(getDreamBySlug("invalid-dream")).rejects.toThrow(
      ValidationError
    );
  });
});

describe("error logging", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("logs ValidationError when skipping invalid files", async () => {
    mockedReaddir.mockResolvedValue(["invalid.md"] as unknown as Awaited<
      ReturnType<typeof readdir>
    >);

    mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
title: Missing Type
---
No type field`);

    await getAllDreams();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DAL] ValidationError in dreams:",
      expect.objectContaining({
        file: "invalid.md",
        message: expect.any(String),
      })
    );
  });

  it("logs FileSystemError when file cannot be read", async () => {
    mockedReaddir.mockResolvedValue(["unreadable.md"] as unknown as Awaited<
      ReturnType<typeof readdir>
    >);

    const eacces = new Error(
      "EACCES: permission denied"
    ) as NodeJS.ErrnoException;
    eacces.code = "EACCES";
    mockedReadFile.mockRejectedValue(eacces);

    await getAllDreams();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DAL] FileSystemError in dreams:",
      expect.objectContaining({
        file: "unreadable.md",
        code: "EACCES",
      })
    );
  });
});
