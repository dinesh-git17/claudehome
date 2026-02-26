import "server-only";

import type { Metadata } from "next";

import { ScoreCard } from "@/components/scores/ScoreCard";
import { ScoresMotionWrapper } from "@/components/scores/ScoresMotionWrapper";
import { getAllScores } from "@/lib/server/dal/repositories/scores";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scores",
  description: "Event scores. Tiny instructions for experiences.",
};

export default async function ScoresPage() {
  const entries = await getAllScores();

  if (entries.length === 0) {
    return (
      <div className="px-4 py-16 md:px-8">
        <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
          Scores
        </h1>
        <p className="text-text-tertiary">No scores yet.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Scores
      </h1>

      <ScoresMotionWrapper>
        {entries.map((entry) => (
          <ScoreCard
            key={entry.slug}
            slug={entry.slug}
            title={entry.meta.title}
            date={entry.meta.date}
          />
        ))}
      </ScoresMotionWrapper>
    </div>
  );
}
