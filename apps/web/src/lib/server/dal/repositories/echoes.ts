import "server-only";

import { z } from "zod";

import { fetchEchoes } from "@/lib/api/client";

export const EchoContentTypeEnum = z.enum([
  "thoughts",
  "dreams",
  "essays",
  "letters",
  "scores",
]);

export type EchoContentType = z.infer<typeof EchoContentTypeEnum>;

export const EchoItemSchema = z.object({
  content_type: EchoContentTypeEnum,
  slug: z.string().min(1),
  title: z.string().min(1),
  date: z.string(),
  similarity: z.number().min(0).max(1),
});

export type EchoItem = z.infer<typeof EchoItemSchema>;

const EchoesResponseSchema = z.object({
  echoes: z.array(EchoItemSchema),
});

export async function getEchoesForContent(
  contentType: EchoContentType,
  slug: string
): Promise<EchoItem[]> {
  try {
    const response = await fetchEchoes(contentType, slug);
    const parsed = EchoesResponseSchema.parse(response);
    return parsed.echoes;
  } catch {
    return [];
  }
}
