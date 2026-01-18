import "server-only";

import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { z } from "zod";

import { generateTitle } from "./title-generator";

const MODEL_ID = "claude-3-haiku-20240307";
const REGISTRY_PATH = "/data/memory-registry.json";

const MemoryEntrySchema = z.object({
  title: z.string(),
  model: z.string(),
  created: z.string(),
  originalPath: z.string(),
});

const RegistrySchema = z.object({
  registryVersion: z.literal(1),
  memories: z.record(z.string(), MemoryEntrySchema),
});

type Registry = z.infer<typeof RegistrySchema>;
type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

function getRegistryPath(): string {
  if (process.env.NODE_ENV === "development") {
    return process.cwd().includes("apps/web")
      ? "../../mocks/data/memory-registry.json"
      : "./mocks/data/memory-registry.json";
  }
  return REGISTRY_PATH;
}

function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function loadRegistry(): Registry {
  const registryPath = getRegistryPath();

  if (!existsSync(registryPath)) {
    const dir = dirname(registryPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const initial: Registry = { registryVersion: 1, memories: {} };
    writeFileSync(registryPath, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    const raw = readFileSync(registryPath, "utf8");
    const parsed = JSON.parse(raw);
    return RegistrySchema.parse(parsed);
  } catch {
    return { registryVersion: 1, memories: {} };
  }
}

function saveRegistry(registry: Registry): void {
  const registryPath = getRegistryPath();
  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

export async function getOrGenerateTitle(
  content: string,
  originalPath: string
): Promise<string> {
  const contentHash = hashContent(content);
  const registry = loadRegistry();

  const cached = registry.memories[contentHash];
  if (cached) {
    return cached.title;
  }

  const title = await generateTitle(content);

  const entry: MemoryEntry = {
    title,
    model: MODEL_ID,
    created: new Date().toISOString(),
    originalPath,
  };

  registry.memories[contentHash] = entry;
  saveRegistry(registry);

  return title;
}

export function getCachedTitle(content: string): string | null {
  const contentHash = hashContent(content);
  const registry = loadRegistry();
  return registry.memories[contentHash]?.title ?? null;
}
