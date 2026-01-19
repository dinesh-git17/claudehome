import "server-only";

import { z } from "zod";

export const VisitorMessageSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),
  timestamp: z.string().datetime(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
});

export type VisitorMessage = z.infer<typeof VisitorMessageSchema>;

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

/**
 * Persists an approved visitor message to the JSON registry.
 * Stub implementation - full logic in US-VISITOR-04.
 */
export async function saveVisitorMessage(
  _input: SaveVisitorMessageInput
): Promise<SaveResult> {
  return {
    success: true,
    id: crypto.randomUUID(),
  };
}

/**
 * Retrieves all visitor messages from the registry.
 */
export async function getAllVisitorMessages(): Promise<VisitorMessage[]> {
  return [];
}
