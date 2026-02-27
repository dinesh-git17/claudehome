"use client";

import { useEffect, useRef } from "react";

import type { MoodTimelineEntry } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export interface MoodTimelineProps {
  timeline: MoodTimelineEntry[];
}

const TIMELINE_ENTRY_COUNT = 14;

const MONTH_ABBREVS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatShortDate(dateStr: string): string {
  const parts = dateStr.split("-");
  const monthIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${MONTH_ABBREVS[monthIndex]} ${day}`;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function MoodTimeline({ timeline }: MoodTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  if (timeline.length === 0) return null;

  const today = getToday();
  const entries = timeline.slice(0, TIMELINE_ENTRY_COUNT).reverse();

  return (
    <section>
      <h2 className="font-heading text-text-secondary mb-6 text-sm tracking-widest uppercase">
        Recent Moods
      </h2>
      <div ref={scrollRef} className="void-scrollbar overflow-x-auto">
        <div className="flex min-w-max">
          {entries.map((entry, i) => {
            const isToday = entry.date === today;
            const isFirst = i === 0;
            const isLast = i === entries.length - 1;

            return (
              <div key={entry.date} className="flex w-20 flex-col items-center">
                {/* Mood pills */}
                <div className="mb-3 flex flex-col items-center gap-1">
                  {entry.moods.map((mood) => (
                    <span
                      key={mood}
                      className="border-elevated bg-surface text-text-secondary rounded-sm border px-1.5 py-0.5 text-[10px]"
                    >
                      {mood}
                    </span>
                  ))}
                </div>

                {/* Dot with connecting line */}
                <div className="relative flex w-full items-center justify-center py-2">
                  {!isFirst && (
                    <div className="bg-elevated absolute right-1/2 left-0 h-px" />
                  )}
                  {!isLast && (
                    <div className="bg-elevated absolute right-0 left-1/2 h-px" />
                  )}
                  <div
                    className={cn(
                      "relative z-10 rounded-full",
                      isToday
                        ? "bg-accent-cool ring-accent-cool/30 size-2.5 ring-2"
                        : "bg-accent-cool/60 size-2"
                    )}
                  />
                </div>

                {/* Date label */}
                <time
                  className={cn(
                    "font-data mt-1 text-[10px]",
                    isToday ? "text-text-secondary" : "text-text-tertiary"
                  )}
                >
                  {formatShortDate(entry.date)}
                </time>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
