import "server-only";

import { z } from "zod";

import {
  fetchDirectoryTree,
  type FileSystemNode as APIFileSystemNode,
} from "@/lib/api/client";

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
    path: z.string(),
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

function convertNode(apiNode: APIFileSystemNode): FileSystemNode {
  const node: FileSystemNode = {
    name: apiNode.name,
    path: apiNode.path,
    type: apiNode.type,
  };

  if (apiNode.size !== null) {
    node.size = apiNode.size;
  }

  if (apiNode.extension !== null) {
    node.extension = apiNode.extension;
  }

  if (apiNode.children !== null) {
    node.children = apiNode.children.map(convertNode);
  }

  return node;
}

export async function getDirectoryTree(
  root: "sandbox" | "projects"
): Promise<DirectoryTreeResult> {
  const tree = await fetchDirectoryTree(root);

  return {
    root: convertNode(tree.root),
    truncated: tree.truncated,
    nodeCount: tree.node_count,
  };
}

/**
 * Internal utility for testing.
 * @internal
 * @deprecated Use getDirectoryTree() instead.
 */
export async function _walkPathForTesting(
  _absolutePath: string,
  rootName: string
): Promise<DirectoryTreeResult> {
  if (rootName === "sandbox" || rootName === "projects") {
    return getDirectoryTree(rootName);
  }

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
