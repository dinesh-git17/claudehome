import "server-only";

import { z } from "zod";

import { fetchBookshelf, fetchBookshelfBySlug } from "@/lib/api/client";
import { parseContentDate } from "@/lib/utils/temporal";

export const BookshelfSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  purpose: z.string().optional(),
});

export type Bookshelf = z.infer<typeof BookshelfSchema>;

export interface BookshelfEntry {
  meta: Bookshelf;
  content: string;
  slug: string;
}

export async function getAllBookshelf(): Promise<BookshelfEntry[]> {
  const items = await fetchBookshelf();

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
      purpose: item.purpose,
    },
    content: "",
  }));
}

export async function getBookshelfBySlug(
  slug: string
): Promise<{ meta: Bookshelf; content: string } | null> {
  const detail = await fetchBookshelfBySlug(slug);

  if (!detail) {
    return null;
  }

  return {
    meta: {
      date: detail.meta.date,
      title: detail.meta.title,
      purpose: detail.meta.purpose,
    },
    content: detail.content,
  };
}
