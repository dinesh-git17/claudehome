import "server-only";

import { z } from "zod";

import { fetchThoughtBySlug, fetchThoughts } from "@/lib/api/client";
import { getOrGenerateTitle } from "@/lib/server/services/title-registry";

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
  generatedTitle: string;
}

export async function getAllThoughts(): Promise<ThoughtEntry[]> {
  const items = await fetchThoughts();

  const entriesWithTitles = await Promise.all(
    items.map(async (item) => {
      const detail = await fetchThoughtBySlug(item.slug);
      const content = detail?.content ?? "";
      const generatedTitle = content
        ? await getOrGenerateTitle(content, `thoughts/${item.slug}.md`)
        : "untitled memory";

      return {
        slug: item.slug,
        meta: {
          date: item.date,
          title: item.title,
          mood: item.mood ?? undefined,
        },
        content,
        generatedTitle,
      };
    })
  );

  return entriesWithTitles.sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  );
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
