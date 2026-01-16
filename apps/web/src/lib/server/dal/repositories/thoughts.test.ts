import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

import { readdir, readFile } from "node:fs/promises";

import { ValidationError } from "../errors";
import { getAllThoughts, getThoughtBySlug, ThoughtSchema } from "./thoughts";

const mockedReaddir = vi.mocked(readdir);
const mockedReadFile = vi.mocked(readFile);

describe("ThoughtSchema", () => {
  it("validates correct thought frontmatter", () => {
    const result = ThoughtSchema.safeParse({
      date: "2026-01-15",
      title: "Test Thought",
      mood: "contemplative",
    });
    expect(result.success).toBe(true);
  });

  it("allows optional mood field", () => {
    const result = ThoughtSchema.safeParse({
      date: "2026-01-15",
      title: "Test Thought",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date format", () => {
    const result = ThoughtSchema.safeParse({
      date: "not-a-date",
      title: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = ThoughtSchema.safeParse({
      date: "2026-01-15",
      title: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("getAllThoughts", () => {
  it("returns thoughts sorted by date descending", async () => {
    mockedReaddir.mockResolvedValue([
      "2026-01-10-older.md",
      "2026-01-15-newer.md",
      "2026-01-12-middle.md",
    ] as unknown as Awaited<ReturnType<typeof readdir>>);

    mockedReadFile.mockImplementation((filepath) => {
      const path = filepath as string;
      if (path.includes("older")) {
        return Promise.resolve(`---
date: '2026-01-10'
title: Older Thought
---
Content 1`);
      }
      if (path.includes("newer")) {
        return Promise.resolve(`---
date: '2026-01-15'
title: Newer Thought
---
Content 2`);
      }
      return Promise.resolve(`---
date: '2026-01-12'
title: Middle Thought
---
Content 3`);
    });

    const result = await getAllThoughts();

    expect(result).toHaveLength(3);
    expect(result[0].meta.title).toBe("Newer Thought");
    expect(result[1].meta.title).toBe("Middle Thought");
    expect(result[2].meta.title).toBe("Older Thought");
  });

  it("derives slug from filename without extension", async () => {
    mockedReaddir.mockResolvedValue([
      "2026-01-15-awakening.md",
    ] as unknown as Awaited<ReturnType<typeof readdir>>);

    mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
title: Awakening
---
Content`);

    const result = await getAllThoughts();

    expect(result[0].slug).toBe("2026-01-15-awakening");
  });

  it("returns empty array for empty directory", async () => {
    mockedReaddir.mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof readdir>>
    );

    const result = await getAllThoughts();

    expect(result).toEqual([]);
  });

  it("returns empty array when directory does not exist", async () => {
    const enoent = new Error("ENOENT") as NodeJS.ErrnoException;
    enoent.code = "ENOENT";
    mockedReaddir.mockRejectedValue(enoent);

    const result = await getAllThoughts();

    expect(result).toEqual([]);
  });

  it("filters non-md files", async () => {
    mockedReaddir.mockResolvedValue([
      "thought.md",
      "readme.txt",
      ".DS_Store",
    ] as unknown as Awaited<ReturnType<typeof readdir>>);

    mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
title: Only MD
---
Content`);

    const result = await getAllThoughts();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("thought");
  });

  it("skips files with invalid frontmatter", async () => {
    mockedReaddir.mockResolvedValue([
      "valid.md",
      "invalid.md",
    ] as unknown as Awaited<ReturnType<typeof readdir>>);

    mockedReadFile.mockImplementation((filepath) => {
      if ((filepath as string).includes("invalid")) {
        return Promise.resolve(`---
title: Missing Date
---
No date field`);
      }
      return Promise.resolve(`---
date: '2026-01-15'
title: Valid
---
Content`);
    });

    const result = await getAllThoughts();

    expect(result).toHaveLength(1);
    expect(result[0].meta.title).toBe("Valid");
  });
});

describe("getThoughtBySlug", () => {
  it("returns thought content for valid slug", async () => {
    mockedReadFile.mockResolvedValue(`---
date: '2026-01-15'
title: Found Thought
mood: curious
---
The content body.`);

    const result = await getThoughtBySlug("2026-01-15-reflection");

    expect(result).not.toBeNull();
    expect(result?.meta.title).toBe("Found Thought");
    expect(result?.meta.mood).toBe("curious");
    expect(result?.content.trim()).toBe("The content body.");
  });

  it("returns null for non-existent slug", async () => {
    const enoent = new Error("ENOENT") as NodeJS.ErrnoException;
    enoent.code = "ENOENT";
    mockedReadFile.mockRejectedValue(enoent);

    const result = await getThoughtBySlug("nonexistent");

    expect(result).toBeNull();
  });

  it("throws ValidationError for file with invalid frontmatter", async () => {
    mockedReadFile.mockResolvedValue(`---
title: Missing Date Field
---
Content without date.`);

    await expect(getThoughtBySlug("invalid-thought")).rejects.toThrow(
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
title: No Date
---
Missing required date field`);

    await getAllThoughts();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DAL] ValidationError in thoughts:",
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

    await getAllThoughts();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[DAL] FileSystemError in thoughts:",
      expect.objectContaining({
        file: "unreadable.md",
        code: "EACCES",
      })
    );
  });
});
