import { describe, expect, it, vi } from "vitest";

vi.mock("client-only", () => ({}));

// Test URL state parsing logic
describe("FileTree URL state logic", () => {
  describe("expanded paths parsing", () => {
    it("parses single path from URL", () => {
      const params = new URLSearchParams("expanded=src");
      const expanded = params.get("expanded");
      const paths = expanded ? expanded.split(",").map(decodeURIComponent) : [];

      expect(paths).toEqual(["src"]);
    });

    it("parses multiple paths from URL", () => {
      const params = new URLSearchParams("expanded=src,tests,docs");
      const expanded = params.get("expanded");
      const paths = expanded ? expanded.split(",").map(decodeURIComponent) : [];

      expect(paths).toEqual(["src", "tests", "docs"]);
    });

    it("handles URL-encoded paths", () => {
      const params = new URLSearchParams("expanded=src%2Flib,src%2Fcomponents");
      const expanded = params.get("expanded");
      const paths = expanded ? expanded.split(",").map(decodeURIComponent) : [];

      expect(paths).toEqual(["src/lib", "src/components"]);
    });

    it("returns empty array when no expanded param", () => {
      const params = new URLSearchParams("");
      const expanded = params.get("expanded");
      const paths = expanded ? expanded.split(",").map(decodeURIComponent) : [];

      expect(paths).toEqual([]);
    });

    it("handles special characters in paths", () => {
      const path = "folder with spaces";
      const encoded = encodeURIComponent(path);
      const params = new URLSearchParams(`expanded=${encoded}`);
      const expanded = params.get("expanded");
      const paths = expanded ? expanded.split(",").map(decodeURIComponent) : [];

      expect(paths).toEqual(["folder with spaces"]);
    });
  });

  describe("expanded paths serialization", () => {
    it("serializes single path to URL", () => {
      const paths = ["src"];
      const serialized = paths.map(encodeURIComponent).join(",");

      expect(serialized).toBe("src");
    });

    it("serializes multiple paths to URL", () => {
      const paths = ["src", "tests"];
      const serialized = paths.map(encodeURIComponent).join(",");

      expect(serialized).toBe("src,tests");
    });

    it("URL-encodes paths with slashes", () => {
      const paths = ["src/lib", "src/components"];
      const serialized = paths.map(encodeURIComponent).join(",");

      expect(serialized).toBe("src%2Flib,src%2Fcomponents");
    });

    it("round-trips correctly", () => {
      const original = ["src/lib", "tests/unit", "docs"];
      const serialized = original.map(encodeURIComponent).join(",");
      const deserialized = serialized.split(",").map(decodeURIComponent);

      expect(deserialized).toEqual(original);
    });
  });

  describe("toggle expanded logic", () => {
    it("adds path when not present", () => {
      const current = new Set(["src"]);
      const path = "tests";

      if (!current.has(path)) {
        current.add(path);
      }

      expect(current.has("src")).toBe(true);
      expect(current.has("tests")).toBe(true);
    });

    it("removes path when present", () => {
      const current = new Set(["src", "tests"]);
      const path = "tests";

      if (current.has(path)) {
        current.delete(path);
      }

      expect(current.has("src")).toBe(true);
      expect(current.has("tests")).toBe(false);
    });
  });

  describe("file navigation path construction", () => {
    it("constructs sandbox file path", () => {
      const domain = "sandbox";
      const filePath = "src/index.ts";
      const navPath = `/${domain}/${filePath}`;

      expect(navPath).toBe("/sandbox/src/index.ts");
    });

    it("constructs projects file path", () => {
      const domain = "projects";
      const filePath = "package.json";
      const navPath = `/${domain}/${filePath}`;

      expect(navPath).toBe("/projects/package.json");
    });

    it("handles nested file paths", () => {
      const domain = "sandbox";
      const filePath = "src/lib/utils/helpers.ts";
      const navPath = `/${domain}/${filePath}`;

      expect(navPath).toBe("/sandbox/src/lib/utils/helpers.ts");
    });
  });

  describe("icon selection logic", () => {
    const getIconType = (
      type: "file" | "directory",
      extension?: string,
      isExpanded?: boolean
    ): string => {
      if (type === "directory") {
        return isExpanded ? "FolderOpen" : "Folder";
      }

      const ext = extension?.toLowerCase();

      switch (ext) {
        case "ts":
        case "tsx":
        case "js":
        case "jsx":
        case "py":
        case "sh":
        case "bash":
        case "css":
        case "html":
          return "FileCode";
        case "json":
          return "FileJson";
        case "md":
        case "txt":
        case "yaml":
        case "yml":
          return "FileText";
        default:
          return "File";
      }
    };

    it("returns Folder for collapsed directory", () => {
      expect(getIconType("directory", undefined, false)).toBe("Folder");
    });

    it("returns FolderOpen for expanded directory", () => {
      expect(getIconType("directory", undefined, true)).toBe("FolderOpen");
    });

    it("returns FileCode for TypeScript files", () => {
      expect(getIconType("file", "ts")).toBe("FileCode");
      expect(getIconType("file", "tsx")).toBe("FileCode");
    });

    it("returns FileCode for JavaScript files", () => {
      expect(getIconType("file", "js")).toBe("FileCode");
      expect(getIconType("file", "jsx")).toBe("FileCode");
    });

    it("returns FileCode for Python files", () => {
      expect(getIconType("file", "py")).toBe("FileCode");
    });

    it("returns FileCode for shell files", () => {
      expect(getIconType("file", "sh")).toBe("FileCode");
      expect(getIconType("file", "bash")).toBe("FileCode");
    });

    it("returns FileCode for CSS files", () => {
      expect(getIconType("file", "css")).toBe("FileCode");
    });

    it("returns FileCode for HTML files", () => {
      expect(getIconType("file", "html")).toBe("FileCode");
    });

    it("returns FileJson for JSON files", () => {
      expect(getIconType("file", "json")).toBe("FileJson");
    });

    it("returns FileText for Markdown files", () => {
      expect(getIconType("file", "md")).toBe("FileText");
    });

    it("returns FileText for text files", () => {
      expect(getIconType("file", "txt")).toBe("FileText");
    });

    it("returns FileText for YAML files", () => {
      expect(getIconType("file", "yaml")).toBe("FileText");
      expect(getIconType("file", "yml")).toBe("FileText");
    });

    it("returns File for unknown extensions", () => {
      expect(getIconType("file", "xyz")).toBe("File");
      expect(getIconType("file", undefined)).toBe("File");
    });
  });
});
