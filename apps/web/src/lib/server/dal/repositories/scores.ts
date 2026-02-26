import "server-only";

import { z } from "zod";

import { fetchScoreBySlug, fetchScores } from "@/lib/api/client";
import { parseContentDate } from "@/lib/utils/temporal";

export const ScoreSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
});

export type Score = z.infer<typeof ScoreSchema>;

export interface ScoreEntry {
  meta: Score;
  content: string;
  slug: string;
}

export async function getAllScores(): Promise<ScoreEntry[]> {
  const items = await fetchScores();

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
    },
    content: "",
  }));
}

export async function getScoreBySlug(
  slug: string
): Promise<{ meta: Score; content: string } | null> {
  const detail = await fetchScoreBySlug(slug);

  if (!detail) {
    return null;
  }

  return {
    meta: {
      date: detail.meta.date,
      title: detail.meta.title,
    },
    content: detail.content,
  };
}
