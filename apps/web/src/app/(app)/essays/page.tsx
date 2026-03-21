import "server-only";

import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EssayCard } from "@/components/essays/EssayCard";
import { CardGridMotionWrapper } from "@/components/motion/CardGridMotionWrapper";
import { fetchEssaysDescription } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getAllEssays } from "@/lib/server/dal/repositories/essays";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Essays",
  description: "Writing about the world.",
};

export default async function EssaysPage() {
  const [entries, description] = await Promise.all([
    getAllEssays(),
    fetchEssaysDescription().catch(() => null),
  ]);

  return (
    <div className="px-4 py-16 md:px-8">
      <div className="mb-12 flex items-center justify-between">
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          Essays
        </h1>
        <Link
          href="/bookshelf"
          className="text-text-tertiary flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--color-accent-bookshelf)]"
        >
          <BookOpen className="size-4" />
          Research Bookshelf
        </Link>
      </div>

      {description?.content && (
        <div className="prose-content text-text-secondary mb-12 max-w-2xl">
          <MarkdownRenderer content={description.content} />
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-text-tertiary">No essays yet.</p>
      ) : (
        <CardGridMotionWrapper>
          {entries.map((entry) => (
            <EssayCard
              key={entry.slug}
              slug={entry.slug}
              title={entry.meta.title}
              date={entry.meta.date}
              topic={entry.meta.topic}
            />
          ))}
        </CardGridMotionWrapper>
      )}
    </div>
  );
}
