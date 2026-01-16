import "server-only";

import { readdir } from "node:fs/promises";
import { basename, extname } from "node:path";

import { z } from "zod";

import { FileSystemError, ValidationError } from "../errors";
import { readContent } from "../loader";
import { ALLOWED_ROOTS, resolvePath } from "../paths";

export const DreamTypeEnum = z.enum(["poetry", "ascii", "prose"]);

export const DreamSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  type: DreamTypeEnum,
  immersive: z.boolean().default(false),
});

export type Dream = z.infer<typeof DreamSchema>;
export type DreamType = z.infer<typeof DreamTypeEnum>;

export interface DreamEntry {
  meta: Dream;
  content: string;
  slug: string;
}

function slugFromFilename(filename: string): string {
  return basename(filename, extname(filename));
}

export async function getAllDreams(): Promise<DreamEntry[]> {
  const dirPath = ALLOWED_ROOTS.dreams;
  let files: string[];

  try {
    files = await readdir(dirPath);
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      return [];
    }
    throw new FileSystemError(
      `Failed to read dreams directory: ${error.message}`,
      dirPath,
      error.code
    );
  }

  const mdFiles = files.filter((f) => extname(f) === ".md");
  const entries: DreamEntry[] = [];

  for (const file of mdFiles) {
    const filepath = resolvePath("dreams", file);
    try {
      const result = await readContent(filepath, DreamSchema);
      entries.push({
        meta: result.meta,
        content: result.content,
        slug: slugFromFilename(file),
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        console.error("[DAL] ValidationError in dreams:", {
          file,
          message: err.message,
          zodError: err.zodError?.format(),
        });
      } else if (err instanceof FileSystemError) {
        console.error("[DAL] FileSystemError in dreams:", {
          file,
          message: err.message,
          code: err.code,
        });
      } else {
        console.error("[DAL] Unknown error in dreams:", {
          file,
          error: err,
        });
      }
      continue;
    }
  }

  return entries.sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  );
}

export async function getDreamBySlug(
  slug: string
): Promise<{ meta: Dream; content: string } | null> {
  const filepath = resolvePath("dreams", `${slug}.md`);

  try {
    return await readContent(filepath, DreamSchema);
  } catch (err) {
    if (err instanceof FileSystemError && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}
