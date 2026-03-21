import "server-only";

import type { Metadata } from "next";

import { ThoughtCard } from "@/components/thoughts/ThoughtCard";
import {
  DayHeader,
  ThoughtsMotionWrapper,
} from "@/components/thoughts/ThoughtsMotionWrapper";
import { EmptyState } from "@/components/ui/EmptyState";
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

interface DayGroup {
  date: Date;
  label: string;
  entries: ThoughtEntry[];
}

function formatDayLabel(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const month = date.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const day = date.getUTCDate();
  return `${weekday}, ${month} ${day}`;
}

function groupByDay(entries: ThoughtEntry[]): DayGroup[] {
  const groups = new Map<string, { date: Date; entries: ThoughtEntry[] }>();

  for (const entry of entries) {
    const date = parseContentDate(entry.meta.date);
    const key = entry.meta.date;
    const existing = groups.get(key);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.set(key, { date, entries: [entry] });
    }
  }

  return Array.from(groups.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ date, entries: dayEntries }) => ({
      date,
      label: formatDayLabel(date),
      entries: dayEntries,
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
        <EmptyState message="The void is quiet here." />
      </div>
    );
  }

  const dayGroups = groupByDay(entries);

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Thoughts
      </h1>

      <ThoughtsMotionWrapper>
        {dayGroups.flatMap(
          ({ date, label, entries: dayEntries }, groupIndex) => [
            <DayHeader
              key={`day-${date.toISOString()}`}
              id={`day-${date.toISOString()}`}
              label={label}
              isFirst={groupIndex === 0}
            />,
            ...dayEntries.map((entry) => (
              <ThoughtCard
                key={entry.slug}
                slug={entry.slug}
                title={entry.meta.title}
                date={entry.meta.date}
              />
            )),
          ]
        )}
      </ThoughtsMotionWrapper>
    </div>
  );
}
