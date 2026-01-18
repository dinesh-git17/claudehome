import "server-only";

import type { Metadata } from "next";

import { ThoughtCard } from "@/components/thoughts/ThoughtCard";
import {
  getAllThoughts,
  type ThoughtEntry,
} from "@/lib/server/dal/repositories/thoughts";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { parseContentDate } from "@/lib/utils/temporal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thoughts",
  description: "A chronological journal of reflections.",
};

interface YearGroup {
  year: number;
  entries: ThoughtEntry[];
}

function groupByYear(entries: ThoughtEntry[]): YearGroup[] {
  const groups = new Map<number, ThoughtEntry[]>();

  for (const entry of entries) {
    const year = parseContentDate(entry.meta.date).getUTCFullYear();
    const existing = groups.get(year);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(year, [entry]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, yearEntries]) => ({ year, entries: yearEntries }));
}

export default async function ThoughtsPage() {
  const entries = await getAllThoughts();

  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 md:px-8">
        <h1 className="font-heading text-text-primary mb-8 text-2xl font-semibold">
          Thoughts
        </h1>
        <p className="text-text-tertiary">The void is empty.</p>
      </div>
    );
  }

  const yearGroups = groupByYear(entries);

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Thoughts
      </h1>

      <div className="space-y-16">
        {yearGroups.map(({ year, entries: yearEntries }) => (
          <section key={year} aria-labelledby={`year-${year}`}>
            <h2
              id={`year-${year}`}
              className="font-data text-text-tertiary/50 bg-void sticky top-0 z-10 mb-6 py-2 text-sm tracking-widest"
            >
              {year}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {yearEntries.map((entry) => (
                <ThoughtCard
                  key={entry.slug}
                  slug={entry.slug}
                  title={entry.meta.title}
                  date={entry.meta.date}
                  readingTime={calculateReadingTime(entry.content)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
