import {
  existsSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { SecurityError } from "./errors";
import {
  _walkPathForTesting,
  EXCLUDED_ENTRIES,
  FileSystemNode,
  FileSystemNodeSchema,
  getDirectoryTree,
  MAX_DEPTH,
  MAX_NODES,
} from "./walker";

const TEST_ROOT = "/tmp/walker-test-" + Date.now();

function createTestDirectory() {
  rmSync(TEST_ROOT, { recursive: true, force: true });
  mkdirSync(TEST_ROOT, { recursive: true });

  // Create sandbox directory structure
  const sandbox = join(TEST_ROOT, "sandbox");
  mkdirSync(join(sandbox, "src", "lib"), { recursive: true });
  mkdirSync(join(sandbox, "tests"), { recursive: true });
  mkdirSync(join(sandbox, ".git", "objects"), { recursive: true });
  mkdirSync(join(sandbox, "node_modules", "foo"), { recursive: true });

  writeFileSync(join(sandbox, "index.ts"), 'console.log("hello");');
  writeFileSync(join(sandbox, "package.json"), "{}");
  writeFileSync(join(sandbox, "src", "main.tsx"), "export default () => null;");
  writeFileSync(join(sandbox, "src", "lib", "utils.ts"), "export const x = 1;");
  writeFileSync(
    join(sandbox, "tests", "index.test.ts"),
    "test('works', () => {})"
  );
  writeFileSync(join(sandbox, ".gitignore"), "node_modules");
  writeFileSync(join(sandbox, ".DS_Store"), "binary-junk");

  // Create projects directory (empty except .gitkeep)
  const projects = join(TEST_ROOT, "projects");
  mkdirSync(projects, { recursive: true });
  writeFileSync(join(projects, ".gitkeep"), "");

  // Create symlink for testing (only if not already exists)
  const symlinkPath = join(sandbox, "malicious-link");
  if (!existsSync(symlinkPath)) {
    try {
      symlinkSync("/etc/passwd", symlinkPath);
    } catch {
      // Symlink creation might fail on some systems
    }
  }
}

function findNode(node: FileSystemNode, name: string): FileSystemNode | null {
  if (node.name === name) {
    return node;
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, name);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

describe("walker", () => {
  beforeAll(() => {
    createTestDirectory();
  });

  afterAll(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  describe("getDirectoryTree security", () => {
    it("accepts sandbox root parameter", () => {
      // This will fail if /sandbox doesn't exist (outside Docker),
      // but the function should not throw SecurityError
      try {
        getDirectoryTree("sandbox");
      } catch (e) {
        // FileSystem errors are okay (directory doesn't exist outside Docker)
        expect(e).not.toBeInstanceOf(SecurityError);
      }
    });

    it("accepts projects root parameter", () => {
      try {
        getDirectoryTree("projects");
      } catch (e) {
        expect(e).not.toBeInstanceOf(SecurityError);
      }
    });

    it("throws SecurityError for invalid root", () => {
      // @ts-expect-error testing invalid input
      expect(() => getDirectoryTree("invalid")).toThrow(SecurityError);
    });

    it("throws SecurityError for thoughts root (not allowed for directory traversal)", () => {
      // @ts-expect-error testing invalid input
      expect(() => getDirectoryTree("thoughts")).toThrow(SecurityError);
    });

    it("throws SecurityError for dreams root", () => {
      // @ts-expect-error testing invalid input
      expect(() => getDirectoryTree("dreams")).toThrow(SecurityError);
    });
  });

  describe("_walkPathForTesting (directory traversal)", () => {
    it("returns FileSystemNode tree for valid directory", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");

      expect(result.root).toBeDefined();
      expect(result.root.type).toBe("directory");
      expect(result.root.name).toBe("sandbox");
    });

    it("returns empty children for empty directory", () => {
      const result = _walkPathForTesting(
        join(TEST_ROOT, "projects"),
        "projects"
      );

      expect(result.root.type).toBe("directory");
      // Only .gitkeep should be present
      expect(result.root.children?.length).toBeLessThanOrEqual(1);
    });
  });

  describe("exclusion filtering", () => {
    it("excludes .git directory", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const hasGit = findNode(result.root, ".git");
      expect(hasGit).toBeNull();
    });

    it("excludes node_modules directory", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const hasNodeModules = findNode(result.root, "node_modules");
      expect(hasNodeModules).toBeNull();
    });

    it("excludes .DS_Store files", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const hasDSStore = findNode(result.root, ".DS_Store");
      expect(hasDSStore).toBeNull();
    });

    it("does NOT exclude other dotfiles like .gitignore", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const hasGitignore = findNode(result.root, ".gitignore");
      expect(hasGitignore).not.toBeNull();
    });

    it("EXCLUDED_ENTRIES constant has expected values", () => {
      expect(EXCLUDED_ENTRIES).toContain(".git");
      expect(EXCLUDED_ENTRIES).toContain("node_modules");
      expect(EXCLUDED_ENTRIES).toContain(".DS_Store");
    });
  });

  describe("symlink handling", () => {
    it("skips symlinks silently", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const hasSymlink = findNode(result.root, "malicious-link");
      expect(hasSymlink).toBeNull();
    });
  });

  describe("type discrimination", () => {
    it("returns type: file for files", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const indexFile = findNode(result.root, "index.ts");
      expect(indexFile).not.toBeNull();
      expect(indexFile?.type).toBe("file");
    });

    it("returns type: directory for directories", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const srcDir = findNode(result.root, "src");
      expect(srcDir).not.toBeNull();
      expect(srcDir?.type).toBe("directory");
    });
  });

  describe("file metadata", () => {
    it("populates size for files", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const indexFile = findNode(result.root, "index.ts");
      expect(indexFile).not.toBeNull();
      expect(indexFile?.size).toBeDefined();
      expect(typeof indexFile?.size).toBe("number");
      expect(indexFile!.size).toBeGreaterThan(0);
    });

    it("populates extension for files", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const indexFile = findNode(result.root, "index.ts");
      expect(indexFile).not.toBeNull();
      expect(indexFile?.extension).toBe("ts");
    });

    it("handles tsx extension", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const mainFile = findNode(result.root, "main.tsx");
      expect(mainFile).not.toBeNull();
      expect(mainFile?.extension).toBe("tsx");
    });

    it("handles json extension", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const pkgFile = findNode(result.root, "package.json");
      expect(pkgFile).not.toBeNull();
      expect(pkgFile?.extension).toBe("json");
    });

    it("does NOT populate size for directories", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const srcDir = findNode(result.root, "src");
      expect(srcDir).not.toBeNull();
      expect(srcDir?.size).toBeUndefined();
    });

    it("does NOT populate extension for directories", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const srcDir = findNode(result.root, "src");
      expect(srcDir).not.toBeNull();
      expect(srcDir?.extension).toBeUndefined();
    });
  });

  describe("sorting", () => {
    it("sorts directories before files", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const children = result.root.children ?? [];

      const firstDirIndex = children.findIndex((c) => c.type === "directory");
      const firstFileIndex = children.findIndex((c) => c.type === "file");

      if (firstDirIndex !== -1 && firstFileIndex !== -1) {
        expect(firstDirIndex).toBeLessThan(firstFileIndex);
      }
    });

    it("sorts alphabetically within same type", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const children = result.root.children ?? [];

      const dirs = children.filter((c) => c.type === "directory");
      const files = children.filter((c) => c.type === "file");

      const dirNames = dirs.map((d) => d.name);
      const fileNames = files.map((f) => f.name);

      expect(dirNames).toEqual(
        [...dirNames].sort((a, b) => a.localeCompare(b))
      );
      expect(fileNames).toEqual(
        [...fileNames].sort((a, b) => a.localeCompare(b))
      );
    });
  });

  describe("constants", () => {
    it("MAX_DEPTH constant is 20", () => {
      expect(MAX_DEPTH).toBe(20);
    });

    it("MAX_NODES constant is 5000", () => {
      expect(MAX_NODES).toBe(5000);
    });
  });

  describe("Zod schema validation", () => {
    it("validates a valid FileSystemNode tree", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const parsed = FileSystemNodeSchema.safeParse(result.root);
      expect(parsed.success).toBe(true);
    });

    it("allows empty path for root node", () => {
      const rootNode: FileSystemNode = {
        name: "test",
        path: "",
        type: "directory",
        children: [],
      };
      const parsed = FileSystemNodeSchema.safeParse(rootNode);
      expect(parsed.success).toBe(true);
    });

    it("rejects invalid node without name", () => {
      const invalid = { path: "/test", type: "file" };
      const parsed = FileSystemNodeSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("rejects invalid type value", () => {
      const invalid = { name: "test", path: "/test", type: "symlink" };
      const parsed = FileSystemNodeSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe("relative paths", () => {
    it("returns relative path from root for nested files", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const utilsFile = findNode(result.root, "utils.ts");
      expect(utilsFile).not.toBeNull();
      expect(utilsFile?.path).toBe("src/lib/utils.ts");
    });

    it("returns relative path for first-level files", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      const indexFile = findNode(result.root, "index.ts");
      expect(indexFile).not.toBeNull();
      expect(indexFile?.path).toBe("index.ts");
    });

    it("returns empty path for root node", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      expect(result.root.path).toBe("");
    });
  });

  describe("result metadata", () => {
    it("returns nodeCount in result", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      expect(typeof result.nodeCount).toBe("number");
      expect(result.nodeCount).toBeGreaterThan(0);
    });

    it("returns truncated flag in result", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      expect(typeof result.truncated).toBe("boolean");
      expect(result.truncated).toBe(false); // Small test directory shouldn't truncate
    });

    it("counts all nodes correctly", () => {
      const result = _walkPathForTesting(join(TEST_ROOT, "sandbox"), "sandbox");
      // Count expected: root(1) + src(1) + lib(1) + tests(1) + files(~7 visible)
      // .gitignore, index.ts, package.json, main.tsx, utils.ts, index.test.ts
      expect(result.nodeCount).toBeGreaterThanOrEqual(8);
    });
  });

  describe("non-existent path handling", () => {
    it("returns empty directory for non-existent path", () => {
      const result = _walkPathForTesting(
        "/path/that/does/not/exist",
        "missing"
      );
      expect(result.root.name).toBe("missing");
      expect(result.root.type).toBe("directory");
      expect(result.root.children).toEqual([]);
      expect(result.nodeCount).toBe(0);
    });
  });
});
