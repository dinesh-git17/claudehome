import "server-only";

import { z } from "zod";

import { fetchThoughtBySlug, fetchThoughts } from "@/lib/api/client";

export const ThoughtSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  mood: z.string().optional(),
});

export type Thought = z.infer<typeof ThoughtSchema>;

export interface ThoughtEntry {
  meta: Thought;
  content: string;
  slug: string;
}

export async function getAllThoughts(): Promise<ThoughtEntry[]> {
  const items = await fetchThoughts();

  return items.map((item) => ({
    slug: item.slug,
    meta: {
      date: item.date,
      title: item.title,
      mood: item.mood ?? undefined,
    },
    content: "",
  }));
}

export async function getThoughtBySlug(
  slug: string
): Promise<{ meta: Thought; content: string } | null> {
  const detail = await fetchThoughtBySlug(slug);

  if (!detail) {
    return null;
  }

  return {
    meta: {
      date: detail.meta.date,
      title: detail.meta.title,
      mood: detail.meta.mood ?? undefined,
    },
    content: detail.content,
  };
}
