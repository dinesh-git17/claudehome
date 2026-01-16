import "server-only";

import { lstatSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

import { z } from "zod";

import { SecurityError } from "./errors";
import { ALLOWED_ROOTS, type AllowedRoot } from "./paths";

export const EXCLUDED_ENTRIES = [".git", "node_modules", ".DS_Store"] as const;

export const MAX_DEPTH = 20;
export const MAX_NODES = 5000;

export interface FileSystemNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  extension?: string;
  children?: FileSystemNode[];
}

export const FileSystemNodeSchema: z.ZodType<FileSystemNode> = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    path: z.string(), // Empty string allowed for root node
    type: z.enum(["file", "directory"]),
    size: z.number().optional(),
    extension: z.string().optional(),
    children: z.array(FileSystemNodeSchema).optional(),
  })
);

export interface DirectoryTreeResult {
  root: FileSystemNode;
  truncated: boolean;
  nodeCount: number;
}

interface WalkState {
  nodeCount: number;
  truncated: boolean;
}

function isExcluded(name: string): boolean {
  return (EXCLUDED_ENTRIES as readonly string[]).includes(name);
}

function walkDirectory(
  absolutePath: string,
  relativePath: string,
  depth: number,
  state: WalkState
): FileSystemNode | null {
  if (depth > MAX_DEPTH) {
    state.truncated = true;
    return null;
  }

  if (state.nodeCount >= MAX_NODES) {
    state.truncated = true;
    return null;
  }

  let stat;
  try {
    stat = lstatSync(absolutePath);
  } catch {
    return null;
  }

  // Reject symlinks silently
  if (stat.isSymbolicLink()) {
    return null;
  }

  const name = relativePath.split("/").pop() ?? relativePath;

  if (stat.isFile()) {
    state.nodeCount++;
    const ext = extname(name);
    return {
      name,
      path: relativePath,
      type: "file",
      size: stat.size,
      extension: ext ? ext.slice(1) : undefined,
    };
  }

  if (stat.isDirectory()) {
    state.nodeCount++;

    let entries: string[];
    try {
      entries = readdirSync(absolutePath);
    } catch {
      return {
        name,
        path: relativePath,
        type: "directory",
        children: [],
      };
    }

    const children: FileSystemNode[] = [];

    for (const entry of entries) {
      if (isExcluded(entry)) {
        continue;
      }

      const childAbsPath = join(absolutePath, entry);
      const childRelPath = relativePath ? `${relativePath}/${entry}` : entry;

      const childNode = walkDirectory(
        childAbsPath,
        childRelPath,
        depth + 1,
        state
      );

      if (childNode) {
        children.push(childNode);
      }

      if (state.nodeCount >= MAX_NODES) {
        state.truncated = true;
        break;
      }
    }

    // Sort: directories first, then files, both alphabetically
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      name,
      path: relativePath,
      type: "directory",
      children,
    };
  }

  return null;
}

export function getDirectoryTree(
  root: "sandbox" | "projects"
): DirectoryTreeResult {
  if (root !== "sandbox" && root !== "projects") {
    throw new SecurityError(
      `Root "${root}" is not allowed for directory traversal`,
      root
    );
  }

  const rootPath = ALLOWED_ROOTS[root as AllowedRoot];
  const state: WalkState = { nodeCount: 0, truncated: false };

  const rootNode = walkDirectory(rootPath, "", 0, state);

  if (!rootNode) {
    return {
      root: {
        name: root,
        path: "",
        type: "directory",
        children: [],
      },
      truncated: false,
      nodeCount: 0,
    };
  }

  // Override the root name to be the domain name
  rootNode.name = root;

  return {
    root: rootNode,
    truncated: state.truncated,
    nodeCount: state.nodeCount,
  };
}

/**
 * Internal utility for testing. Walks an arbitrary absolute path.
 * NOT for production use - bypasses ALLOWED_ROOTS security check.
 * @internal
 */
export function _walkPathForTesting(
  absolutePath: string,
  rootName: string
): DirectoryTreeResult {
  const state: WalkState = { nodeCount: 0, truncated: false };
  const rootNode = walkDirectory(absolutePath, "", 0, state);

  if (!rootNode) {
    return {
      root: {
        name: rootName,
        path: "",
        type: "directory",
        children: [],
      },
      truncated: false,
      nodeCount: 0,
    };
  }

  rootNode.name = rootName;

  return {
    root: rootNode,
    truncated: state.truncated,
    nodeCount: state.nodeCount,
  };
}
