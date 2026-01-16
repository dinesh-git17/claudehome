import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockReadFile, mockStat, capturedCacheArgs } = vi.hoisted(() => {
  return {
    mockReadFile: vi.fn(),
    mockStat: vi.fn(),
    capturedCacheArgs: {
      fn: undefined as unknown,
      keyParts: undefined as unknown,
      options: undefined as unknown,
    },
  };
});

vi.mock("node:fs/promises", () => ({
  readFile: (...args: unknown[]) => mockReadFile(...args),
  stat: (...args: unknown[]) => mockStat(...args),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown, keyParts: unknown, options: unknown) => {
    capturedCacheArgs.fn = fn;
    capturedCacheArgs.keyParts = keyParts;
    capturedCacheArgs.options = options;
    return fn;
  },
}));

import { _getAboutPage, DEFAULT_ABOUT, getAboutPage } from "./about";

describe("getAboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful reads", () => {
    it("extracts title from H1 heading", async () => {
      const content = "# My Custom Title\n\nSome content here.";
      const mtime = new Date("2026-01-15T10:00:00Z");

      mockReadFile.mockImplementation((path: string) => {
        if (path === "/about/about.md") return Promise.resolve(content);
        if (path === "/about/meta.json")
          return Promise.reject({ code: "ENOENT" });
        return Promise.reject(new Error("Unexpected path"));
      });
      mockStat.mockResolvedValue({ mtime });

      const result = await _getAboutPage();

      expect(result.title).toBe("My Custom Title");
    });

    it("returns file mtime as lastUpdated", async () => {
      const content = "# Title\n\nContent.";
      const mtime = new Date("2026-01-10T08:30:00Z");

      mockReadFile.mockImplementation((path: string) => {
        if (path === "/about/about.md") return Promise.resolve(content);
        if (path === "/about/meta.json")
          return Promise.reject({ code: "ENOENT" });
        return Promise.reject(new Error("Unexpected path"));
      });
      mockStat.mockResolvedValue({ mtime });

      const result = await _getAboutPage();

      expect(result.lastUpdated).toEqual(mtime);
    });

    it("reads modelVersion from meta.json", async () => {
      const content = "# Title\n\nContent.";
      const mtime = new Date();
      const metaJson = JSON.stringify({ modelVersion: "claude-3-opus" });

      mockReadFile.mockImplementation((path: string) => {
        if (path === "/about/about.md") return Promise.resolve(content);
        if (path === "/about/meta.json") return Promise.resolve(metaJson);
        return Promise.reject(new Error("Unexpected path"));
      });
      mockStat.mockResolvedValue({ mtime });

      const result = await _getAboutPage();

      expect(result.modelVersion).toBe("claude-3-opus");
    });

    it("defaults modelVersion to unknown when meta.json missing", async () => {
      const content = "# Title\n\nContent.";
      const mtime = new Date();

      mockReadFile.mockImplementation((path: string) => {
        if (path === "/about/about.md") return Promise.resolve(content);
        if (path === "/about/meta.json")
          return Promise.reject({ code: "ENOENT" });
        return Promise.reject(new Error("Unexpected path"));
      });
      mockStat.mockResolvedValue({ mtime });

      const result = await _getAboutPage();

      expect(result.modelVersion).toBe("unknown");
    });

    it("sanitizes content before returning", async () => {
      const content = '# Title\n\n<p onclick="alert(1)">Content</p>';
      const mtime = new Date();

      mockReadFile.mockImplementation((path: string) => {
        if (path === "/about/about.md") return Promise.resolve(content);
        if (path === "/about/meta.json")
          return Promise.reject({ code: "ENOENT" });
        return Promise.reject(new Error("Unexpected path"));
      });
      mockStat.mockResolvedValue({ mtime });

      const result = await _getAboutPage();

      expect(result.content).not.toContain("onclick");
      expect(result.content).toContain("<p>Content</p>");
    });
  });

  describe("graceful degradation", () => {
    it("returns DEFAULT_ABOUT when file is missing (ENOENT)", async () => {
      mockReadFile.mockRejectedValue({ code: "ENOENT" });

      const result = await _getAboutPage();

      expect(result.title).toBe(DEFAULT_ABOUT.title);
      expect(result.content).toBe(DEFAULT_ABOUT.content);
      expect(result.modelVersion).toBe(DEFAULT_ABOUT.modelVersion);
    });

    it("uses fallback title 'About' when no H1 present", async () => {
      const content = "Just some text without a heading.";
      const mtime = new Date();

      mockReadFile.mockImplementation((path: string) => {
        if (path === "/about/about.md") return Promise.resolve(content);
        if (path === "/about/meta.json")
          return Promise.reject({ code: "ENOENT" });
        return Promise.reject(new Error("Unexpected path"));
      });
      mockStat.mockResolvedValue({ mtime });

      const result = await _getAboutPage();

      expect(result.title).toBe("About");
    });
  });

  describe("error handling", () => {
    it("throws FileSystemError on non-ENOENT errors", async () => {
      mockReadFile.mockRejectedValue({
        code: "EACCES",
        message: "Permission denied",
      });

      await expect(_getAboutPage()).rejects.toThrow(
        "Failed to read about page"
      );
    });
  });
});

describe("DEFAULT_ABOUT", () => {
  it("has System Initializing title", () => {
    expect(DEFAULT_ABOUT.title).toBe("System Initializing");
  });

  it("has unknown modelVersion", () => {
    expect(DEFAULT_ABOUT.modelVersion).toBe("unknown");
  });

  it("has placeholder content", () => {
    expect(DEFAULT_ABOUT.content).toContain("being prepared");
  });
});

describe("ISR cache integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unstable_cache is called with correct cache key and options", () => {
    expect(capturedCacheArgs.keyParts).toEqual(["about-page"]);
    expect(capturedCacheArgs.options).toEqual({
      tags: ["about"],
      revalidate: 60,
    });
    expect(typeof capturedCacheArgs.fn).toBe("function");
  });

  it("getAboutPage returns AboutPageData with Date lastUpdated", async () => {
    const content = "# Test Title\n\nContent.";
    const mtime = new Date("2026-01-15T10:00:00Z");

    mockReadFile.mockImplementation((path: string) => {
      if (path === "/about/about.md") return Promise.resolve(content);
      if (path === "/about/meta.json")
        return Promise.reject({ code: "ENOENT" });
      return Promise.reject(new Error("Unexpected path"));
    });
    mockStat.mockResolvedValue({ mtime });

    const result = await getAboutPage();

    expect(result.lastUpdated).toBeInstanceOf(Date);
    expect(result.lastUpdated.toISOString()).toBe("2026-01-15T10:00:00.000Z");
  });
});
