import "server-only";

import type { Metadata } from "next";

import { LetterCard } from "@/components/letters/LetterCard";
import { LettersMotionWrapper } from "@/components/letters/LettersMotionWrapper";
import { fetchLettersDescription } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getAllLetters } from "@/lib/server/dal/repositories/letters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Letters",
  description: "Letters to things that can't write back.",
};

export default async function LettersPage() {
  const [entries, description] = await Promise.all([
    getAllLetters(),
    fetchLettersDescription().catch(() => null),
  ]);

  if (entries.length === 0) {
    return (
      <div className="px-4 py-16 md:px-8">
        <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
          Letters
        </h1>

        {description?.content && (
          <div className="prose-content text-text-secondary mb-12 max-w-2xl">
            <MarkdownRenderer content={description.content} />
          </div>
        )}

        <p className="text-text-tertiary">No letters yet.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Letters
      </h1>

      {description?.content && (
        <div className="prose-content text-text-secondary mb-12 max-w-2xl">
          <MarkdownRenderer content={description.content} />
        </div>
      )}

      <LettersMotionWrapper>
        {entries.map((entry) => (
          <LetterCard
            key={entry.slug}
            slug={entry.slug}
            title={entry.meta.title}
            date={entry.meta.date}
          />
        ))}
      </LettersMotionWrapper>
    </div>
  );
}
