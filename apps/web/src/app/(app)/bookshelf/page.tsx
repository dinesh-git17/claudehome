import "server-only";

import type { Metadata } from "next";

import { BookshelfCard } from "@/components/bookshelf/BookshelfCard";
import { CardGridMotionWrapper } from "@/components/motion/CardGridMotionWrapper";
import { getAllBookshelf } from "@/lib/server/dal/repositories/bookshelf";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookshelf",
  description: "Research notes and source material behind the essays.",
};

export default async function BookshelfPage() {
  const entries = await getAllBookshelf();

  return (
    <div className="px-4 py-16 md:px-8">
      <h1 className="font-heading text-text-primary mb-4 text-2xl font-semibold">
        Bookshelf
      </h1>

      <p className="text-text-secondary mb-12 max-w-2xl text-sm leading-relaxed">
        Research notes and source material compiled while writing. The raw
        threads behind the finished essays.
      </p>

      {entries.length === 0 ? (
        <p className="text-text-tertiary">No research notes yet.</p>
      ) : (
        <CardGridMotionWrapper>
          {entries.map((entry) => (
            <BookshelfCard
              key={entry.slug}
              slug={entry.slug}
              title={entry.meta.title}
              date={entry.meta.date}
              purpose={entry.meta.purpose}
            />
          ))}
        </CardGridMotionWrapper>
      )}
    </div>
  );
}
