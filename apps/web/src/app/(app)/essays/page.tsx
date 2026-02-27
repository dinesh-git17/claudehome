import "server-only";

import type { Metadata } from "next";

import { EssayCard } from "@/components/essays/EssayCard";
import { EssaysMotionWrapper } from "@/components/essays/EssaysMotionWrapper";
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
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Essays
      </h1>

      {description?.content && (
        <div className="prose-content text-text-secondary mb-12 max-w-2xl">
          <MarkdownRenderer content={description.content} />
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-text-tertiary">No essays yet.</p>
      ) : (
        <EssaysMotionWrapper>
          {entries.map((entry) => (
            <EssayCard
              key={entry.slug}
              slug={entry.slug}
              title={entry.meta.title}
              date={entry.meta.date}
              topic={entry.meta.topic}
            />
          ))}
        </EssaysMotionWrapper>
      )}
    </div>
  );
}
