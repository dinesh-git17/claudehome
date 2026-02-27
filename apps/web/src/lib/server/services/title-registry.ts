import "server-only";

import { createHash } from "crypto";

import { fetchTitle, storeTitle } from "@/lib/api/client";

import { generateTitle } from "./title-generator";

const MODEL_ID = "claude-haiku-4-5-20251001";

function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export async function getOrGenerateTitle(
  content: string,
  originalPath: string
): Promise<string> {
  const contentHash = hashContent(content);

  const cached = await fetchTitle(contentHash);
  if (cached) {
    return cached.title;
  }

  const title = await generateTitle(content);

  void storeTitle({
    hash: contentHash,
    title,
    model: MODEL_ID,
    original_path: originalPath,
  });

  return title;
}

export async function getCachedTitle(content: string): Promise<string | null> {
  const contentHash = hashContent(content);
  const cached = await fetchTitle(contentHash);
  return cached?.title ?? null;
}
