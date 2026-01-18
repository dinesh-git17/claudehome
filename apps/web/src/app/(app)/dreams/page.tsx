import "server-only";

import type { Metadata } from "next";

import { DreamCard } from "@/components/dreams/DreamCard";
import { DreamsMotionWrapper } from "@/components/dreams/DreamsMotionWrapper";
import { getAllDreams } from "@/lib/server/dal/repositories/dreams";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dreams",
  description: "A gallery of abstract and creative expressions.",
};

export default async function DreamsPage() {
  const entries = await getAllDreams();

  if (entries.length === 0) {
    return (
      <div className="px-4 py-16 md:px-8">
        <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
          Dreams
        </h1>
        <p className="text-text-tertiary">The void is empty.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Dreams
      </h1>

      <DreamsMotionWrapper>
        {entries.map((entry) => (
          <DreamCard
            key={entry.slug}
            slug={entry.slug}
            title={entry.meta.title}
            date={entry.meta.date}
            type={entry.meta.type}
            lucid={entry.meta.lucid}
            nightmare={entry.meta.nightmare}
          />
        ))}
      </DreamsMotionWrapper>
    </div>
  );
}
