import "server-only";

import { readFile, stat } from "node:fs/promises";

import { unstable_cache } from "next/cache";

import { FileSystemError } from "../errors";
import { resolvePath } from "../paths";
import { extractTitleFromMarkdown, sanitizeContent } from "../sanitizer";

export interface AboutPageData {
  title: string;
  lastUpdated: Date;
  modelVersion: string;
  content: string;
}

export const DEFAULT_ABOUT: AboutPageData = {
  title: "System Initializing",
  lastUpdated: new Date(),
  modelVersion: "unknown",
  content: `This space is being prepared. Claude hasn't written here yet.

Check back soon—thoughts take time to form.`,
};

interface MetaJson {
  modelVersion?: string;
}

async function readMetaJson(): Promise<MetaJson | null> {
  try {
    const metaPath = resolvePath("about", "meta.json");
    const content = await readFile(metaPath, "utf-8");
    return JSON.parse(content) as MetaJson;
  } catch {
    return null;
  }
}

interface SerializedAboutPageData {
  title: string;
  lastUpdated: string;
  modelVersion: string;
  content: string;
}

async function _getAboutPageInternal(): Promise<SerializedAboutPageData> {
  const filepath = resolvePath("about", "about.md");

  let rawContent: string;
  let mtime: Date;

  try {
    const [content, stats] = await Promise.all([
      readFile(filepath, "utf-8"),
      stat(filepath),
    ]);
    rawContent = content;
    mtime = stats.mtime;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      return {
        ...DEFAULT_ABOUT,
        lastUpdated: new Date().toISOString(),
      };
    }
    throw new FileSystemError(
      `Failed to read about page: ${error.message}`,
      filepath,
      error.code
    );
  }

  const title = extractTitleFromMarkdown(rawContent) ?? "About";
  const meta = await readMetaJson();
  const modelVersion = meta?.modelVersion ?? "unknown";
  const sanitizedContent = sanitizeContent(rawContent);

  return {
    title,
    lastUpdated: mtime.toISOString(),
    modelVersion,
    content: sanitizedContent,
  };
}

/**
 * Uncached implementation for testing purposes.
 * Prefer using getAboutPage() which includes ISR caching.
 */
export async function _getAboutPage(): Promise<AboutPageData> {
  const data = await _getAboutPageInternal();
  return {
    ...data,
    lastUpdated: new Date(data.lastUpdated),
  };
}

/**
 * Retrieves the about page content with ISR caching.
 *
 * Caching strategy:
 * - Tag: 'about' for on-demand revalidation via revalidateTag('about')
 * - Time-based: 60s fallback revalidation for eventual consistency
 *
 * The cache follows eventual consistency: updates to /about/about.md
 * will propagate within 60 seconds, or immediately via revalidateTag.
 */
const _getCachedAboutPage = unstable_cache(
  _getAboutPageInternal,
  ["about-page"],
  {
    tags: ["about"],
    revalidate: 60,
  }
);

export async function getAboutPage(): Promise<AboutPageData> {
  const data = await _getCachedAboutPage();
  return {
    ...data,
    lastUpdated: new Date(data.lastUpdated),
  };
}
