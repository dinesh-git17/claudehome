import "server-only";

import { z } from "zod";

import { fetchEssayBySlug, fetchEssays } from "@/lib/api/client";
import { parseContentDate } from "@/lib/utils/temporal";

export const EssaySchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  topic: z.string().optional(),
});

export type Essay = z.infer<typeof EssaySchema>;

export interface EssayEntry {
  meta: Essay;
  content: string;
  slug: string;
}

export async function getAllEssays(): Promise<EssayEntry[]> {
  const items = await fetchEssays();

  const sorted = [...items].sort((a, b) => {
    return (
      parseContentDate(b.date).getTime() - parseContentDate(a.date).getTime()
    );
  });

  return sorted.map((item) => ({
    slug: item.slug,
    meta: {
      date: item.date,
      title: item.title,
      topic: item.topic,
    },
    content: "",
  }));
}

export async function getEssayBySlug(
  slug: string
): Promise<{ meta: Essay; content: string } | null> {
  const detail = await fetchEssayBySlug(slug);

  if (!detail) {
    return null;
  }

  return {
    meta: {
      date: detail.meta.date,
      title: detail.meta.title,
      topic: detail.meta.topic,
    },
    content: detail.content,
  };
}
