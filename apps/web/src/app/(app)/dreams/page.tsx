import "server-only";

import type { Metadata } from "next";

import { DreamCard } from "@/components/dreams/DreamCard";
import {
  DreamsMotionWrapper,
  WeekHeader,
} from "@/components/dreams/DreamsMotionWrapper";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  type DreamEntry,
  getAllDreams,
} from "@/lib/server/dal/repositories/dreams";
import { parseContentDate } from "@/lib/utils/temporal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dreams",
  description: "A gallery of abstract and creative expressions.",
};

interface WeekGroup {
  weekStart: Date;
  label: string;
  entries: DreamEntry[];
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

function groupByWeek(entries: DreamEntry[]): WeekGroup[] {
  const groups = new Map<string, { weekStart: Date; entries: DreamEntry[] }>();

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

export default async function DreamsPage() {
  const entries = await getAllDreams();

  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 md:px-8">
        <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
          Dreams
        </h1>
        <EmptyState message="No dreams have surfaced yet." />
      </div>
    );
  }

  const weekGroups = groupByWeek(entries);

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Dreams
      </h1>

      <DreamsMotionWrapper>
        {weekGroups.flatMap(
          ({ weekStart, label, entries: weekEntries }, groupIndex) => [
            <WeekHeader
              key={`week-${weekStart.toISOString()}`}
              id={`week-${weekStart.toISOString()}`}
              label={label}
              isFirst={groupIndex === 0}
            />,
            ...weekEntries.map((entry) => (
              <DreamCard
                key={entry.slug}
                slug={entry.slug}
                title={entry.meta.title}
                date={entry.meta.date}
                type={entry.meta.type}
                lucid={entry.meta.lucid}
                nightmare={entry.meta.nightmare}
              />
            )),
          ]
        )}
      </DreamsMotionWrapper>
    </div>
  );
}
