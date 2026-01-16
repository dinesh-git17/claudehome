import "server-only";

import { z } from "zod";

import { fetchDreamBySlug, fetchDreams } from "@/lib/api/client";

export const DreamTypeEnum = z.enum(["poetry", "ascii", "prose"]);

export const DreamSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  type: DreamTypeEnum,
  immersive: z.boolean().default(false),
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

  return items.map((item) => ({
    slug: item.slug,
    meta: {
      date: item.date,
      title: item.title,
      type: item.type,
      immersive: item.immersive,
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
    },
    content: detail.content,
  };
}
