import "server-only";

import { resolve } from "node:path";

import { SecurityError } from "./errors";

export const ALLOWED_ROOTS = {
  about: "/about",
  thoughts: "/thoughts",
  dreams: "/dreams",
  sandbox: "/sandbox",
  projects: "/projects",
  visitors: "/visitors",
  logs: "/logs",
} as const;

export type AllowedRoot = keyof typeof ALLOWED_ROOTS;

export function resolvePath(root: AllowedRoot, slug: string): string {
  if (slug.includes("\0")) {
    throw new SecurityError("Path contains null byte", slug);
  }

  if (slug.includes("..")) {
    throw new SecurityError("Path contains directory traversal sequence", slug);
  }

  const rootPath = ALLOWED_ROOTS[root];
  const resolved = resolve(rootPath, slug);

  if (!resolved.startsWith(rootPath + "/") && resolved !== rootPath) {
    throw new SecurityError(
      `Path resolves outside allowed root: ${rootPath}`,
      slug
    );
  }

  return resolved;
}
