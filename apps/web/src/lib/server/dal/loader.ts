import "server-only";

import { readFile } from "node:fs/promises";

import matter from "gray-matter";
import type { z } from "zod";

import { FileSystemError, ValidationError } from "./errors";

export interface ContentResult<T> {
  meta: T;
  content: string;
}

export async function readContent<T>(
  filepath: string,
  schema: z.ZodType<T>
): Promise<ContentResult<T>> {
  let raw: string;

  try {
    raw = await readFile(filepath, "utf-8");
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    throw new FileSystemError(
      `Failed to read file: ${error.message}`,
      filepath,
      error.code
    );
  }

  const parsed = matter(raw);

  const result = schema.safeParse(parsed.data);

  if (!result.success) {
    throw new ValidationError(
      `Invalid frontmatter in ${filepath}`,
      filepath,
      result.error
    );
  }

  return {
    meta: result.data,
    content: parsed.content,
  };
}
