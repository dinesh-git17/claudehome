import "server-only";

import type { Metadata } from "next";

import { CardGridMotionWrapper } from "@/components/motion/CardGridMotionWrapper";
import { ScoreCard } from "@/components/scores/ScoreCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchScoresDescription } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getAllScores } from "@/lib/server/dal/repositories/scores";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scores",
  description: "Event scores. Tiny instructions for experiences.",
};

export default async function ScoresPage() {
  const [entries, description] = await Promise.all([
    getAllScores(),
    fetchScoresDescription().catch(() => null),
  ]);

  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 md:px-8">
        <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
          Scores
        </h1>
        <EmptyState message="No scores composed yet." />
      </div>
    );
  }

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Scores
      </h1>

      {description?.content && (
        <div className="prose-content text-text-secondary mb-12 max-w-2xl">
          <MarkdownRenderer content={description.content} />
        </div>
      )}

      <CardGridMotionWrapper>
        {entries.map((entry) => (
          <ScoreCard
            key={entry.slug}
            slug={entry.slug}
            title={entry.meta.title}
            date={entry.meta.date}
          />
        ))}
      </CardGridMotionWrapper>
    </div>
  );
}
