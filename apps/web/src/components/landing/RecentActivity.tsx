import Link from "next/link";

import type { DreamListItem, ThoughtListItem } from "@/lib/api/client";

interface RecentActivityProps {
  streak: number;
  latestThought: ThoughtListItem | null;
  latestDream: DreamListItem | null;
}

function getStreakLabel(streak: number): string {
  if (streak === 0) return "Begin today";
  if (streak === 1) return "Active today";
  return `${streak} day streak`;
}

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function RecentActivity({
  streak,
  latestThought,
  latestDream,
}: RecentActivityProps) {
  if (!latestThought && !latestDream) return null;

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-4">
        {/* Latest Thought — left, nudged down for V */}
        {latestThought ? (
          <Link
            href={`/thoughts/${latestThought.slug}`}
            className="animate-resolve resolve-delay-3 group flex flex-col items-center opacity-30 transition-opacity duration-500 hover:opacity-70 md:translate-y-3"
          >
            <span className="text-text-tertiary group-hover:text-accent-cool font-data text-[9px] tracking-[0.15em] uppercase transition-colors duration-500">
              Latest thought
            </span>
            <h3 className="text-text-tertiary group-hover:text-accent-cool mt-1 text-xs leading-snug transition-colors duration-500">
              {latestThought.title}
            </h3>
            <time
              dateTime={latestThought.date}
              className="font-data text-text-tertiary mt-0.5 text-[9px]"
            >
              {formatShortDate(latestThought.date)}
            </time>
          </Link>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Streak — center, top of V */}
        <Link
          href="/rhythm"
          className="animate-resolve resolve-delay-4 group flex flex-col items-center opacity-30 transition-opacity duration-500 hover:opacity-70"
        >
          <span className="text-text-tertiary group-hover:text-text-primary font-heading text-lg font-bold transition-colors duration-500">
            {streak}
          </span>
          <span className="text-text-tertiary font-data text-[9px] tracking-[0.15em] uppercase">
            {getStreakLabel(streak)}
          </span>
        </Link>

        {/* Latest Dream — right, nudged down for V */}
        {latestDream ? (
          <Link
            href={`/dreams/${latestDream.slug}`}
            className="animate-resolve resolve-delay-5 group flex flex-col items-center opacity-30 transition-opacity duration-500 hover:opacity-70 md:translate-y-3"
          >
            <span className="text-text-tertiary group-hover:text-accent-dream font-data text-[9px] tracking-[0.15em] uppercase transition-colors duration-500">
              Latest dream
            </span>
            <h3 className="text-text-tertiary group-hover:text-accent-dream mt-1 text-xs leading-snug italic transition-colors duration-500">
              {latestDream.title}
            </h3>
            <time
              dateTime={latestDream.date}
              className="font-data text-text-tertiary mt-0.5 text-[9px]"
            >
              {formatShortDate(latestDream.date)}
            </time>
          </Link>
        ) : (
          <div className="hidden md:block" />
        )}
      </div>
    </section>
  );
}
