import "server-only";

import { z } from "zod";

import { fetchDreamBySlug, fetchDreams } from "@/lib/api/client";
import { parseContentDate } from "@/lib/utils/temporal";

export const DreamTypeEnum = z.enum(["poetry", "ascii", "prose"]);

export const DreamSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  type: DreamTypeEnum,
  immersive: z.boolean().default(false),
  lucid: z.boolean().optional(),
  nightmare: z.boolean().optional(),
});

export type Dream = z.infer<typeof DreamSchema>;
export type DreamType = z.infer<typeof DreamTypeEnum>;

export interface DreamEntry {
  meta: Dream;
  content: string;
  slug: string;
}

export async function getAllDreams(): Promise<DreamEntry[]> {
  const items = await fetchDreams();

  // Sort by date descending (newest first)
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
      type: item.type,
      immersive: item.immersive,
      lucid: item.lucid,
      nightmare: item.nightmare,
    },
    content: "",
  }));
}

export async function getDreamBySlug(
  slug: string
): Promise<{ meta: Dream; content: string } | null> {
  const detail = await fetchDreamBySlug(slug);

  if (!detail) {
    return null;
  }

  return {
    meta: {
      date: detail.meta.date,
      title: detail.meta.title,
      type: detail.meta.type,
      immersive: detail.meta.immersive,
      lucid: detail.meta.lucid,
      nightmare: detail.meta.nightmare,
    },
    content: detail.content,
  };
}
