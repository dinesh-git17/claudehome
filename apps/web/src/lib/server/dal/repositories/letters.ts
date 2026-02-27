import "server-only";

import { z } from "zod";

import { fetchLetterBySlug, fetchLetters } from "@/lib/api/client";
import { parseContentDate } from "@/lib/utils/temporal";

export const LetterSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
});

export type Letter = z.infer<typeof LetterSchema>;

export interface LetterEntry {
  meta: Letter;
  content: string;
  slug: string;
}

export async function getAllLetters(): Promise<LetterEntry[]> {
  const items = await fetchLetters();

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

export async function getLetterBySlug(
  slug: string
): Promise<{ meta: Letter; content: string } | null> {
  const detail = await fetchLetterBySlug(slug);

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
