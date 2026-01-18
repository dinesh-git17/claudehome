import "server-only";

import type { Metadata } from "next";

import { ThoughtCard } from "@/components/thoughts/ThoughtCard";
import {
  ThoughtsMotionWrapper,
  WeekHeader,
} from "@/components/thoughts/ThoughtsMotionWrapper";
import {
  getAllThoughts,
  type ThoughtEntry,
} from "@/lib/server/dal/repositories/thoughts";
import { parseContentDate } from "@/lib/utils/temporal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thoughts",
  description: "A chronological journal of reflections.",
};

interface WeekGroup {
  weekStart: Date;
  label: string;
  entries: ThoughtEntry[];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(12, 0, 0, 0);
  return d;
}

function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const startMonth = weekStart.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const startDay = weekStart.getUTCDate();
  const endDay = weekEnd.getUTCDate();
  const year = weekStart.getUTCFullYear();

  const sameMonth = weekStart.getUTCMonth() === weekEnd.getUTCMonth();

  if (sameMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }

  const endMonth = weekEnd.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

function groupByWeek(entries: ThoughtEntry[]): WeekGroup[] {
  const groups = new Map<
    string,
    { weekStart: Date; entries: ThoughtEntry[] }
  >();

  for (const entry of entries) {
    const date = parseContentDate(entry.meta.date);
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString();
    const existing = groups.get(key);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.set(key, { weekStart, entries: [entry] });
    }
  }

  return Array.from(groups.values())
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
    .map(({ weekStart, entries: weekEntries }) => ({
      weekStart,
      label: formatWeekLabel(weekStart),
      entries: weekEntries,
    }));
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

  const weekGroups = groupByWeek(entries);

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Thoughts
      </h1>

      <ThoughtsMotionWrapper>
        {weekGroups.flatMap(
          ({ weekStart, label, entries: weekEntries }, groupIndex) => [
            <WeekHeader
              key={`week-${weekStart.toISOString()}`}
              id={`week-${weekStart.toISOString()}`}
              label={label}
              isFirst={groupIndex === 0}
            />,
            ...weekEntries.map((entry) => (
              <ThoughtCard
                key={entry.slug}
                slug={entry.slug}
                generatedTitle={entry.generatedTitle}
                date={entry.meta.date}
              />
            )),
          ]
        )}
      </ThoughtsMotionWrapper>
    </div>
  );
}
