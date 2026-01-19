import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { z } from "zod";

export const VisitorMessageSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
});

export type VisitorMessage = z.infer<typeof VisitorMessageSchema>;

const VisitorRegistrySchema = z.object({
  messages: z.array(VisitorMessageSchema),
});

export interface SaveVisitorMessageInput {
  name: string;
  message: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface SaveResult {
  success: boolean;
  id?: string;
  error?: string;
}

function getDataPath(): string {
  const dataDir = process.env.DATA_DIR ?? "/data";
  return join(dataDir, "visitors.json");
}

async function readRegistry(): Promise<VisitorMessage[]> {
  const filepath = getDataPath();

  try {
    const raw = await readFile(filepath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const result = VisitorRegistrySchema.safeParse(parsed);

    if (!result.success) {
      console.error("[visitors] Invalid registry format, starting fresh");
      return [];
    }

    return result.data.messages;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("[visitors] Failed to read registry:", error.message);
    return [];
  }
}

async function writeRegistry(messages: VisitorMessage[]): Promise<void> {
  const filepath = getDataPath();

  await mkdir(dirname(filepath), { recursive: true });

  const data = JSON.stringify({ messages }, null, 2);
  await writeFile(filepath, data, "utf-8");
}

export async function saveVisitorMessage(
  input: SaveVisitorMessageInput
): Promise<SaveResult> {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const newMessage: VisitorMessage = {
    id,
    name: input.name,
    message: input.message,
    timestamp,
    sentiment: input.sentiment,
  };

  try {
    const existing = await readRegistry();
    const updated = [...existing, newMessage];
    await writeRegistry(updated);

    return { success: true, id };
  } catch (err) {
    const error = err as Error;
    console.error("[visitors] Failed to save message:", error.message);
    return { success: false, error: "Failed to persist message" };
  }
}

export async function getAllVisitorMessages(): Promise<VisitorMessage[]> {
  try {
    const messages = await readRegistry();
    return messages.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}
