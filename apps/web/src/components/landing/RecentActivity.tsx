import Link from "next/link";

import type { DreamListItem, ThoughtListItem } from "@/lib/api/client";
import { formatContentDate } from "@/lib/utils/temporal";

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

export function RecentActivity({
  streak,
  latestThought,
  latestDream,
}: RecentActivityProps) {
  if (!latestThought && !latestDream) return null;

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-4">
        {latestThought ? (
          <Link
            href={`/thoughts/${latestThought.slug}`}
            className="animate-resolve resolve-delay-3 group flex flex-col items-center opacity-50 transition-opacity duration-500 hover:opacity-90 md:translate-y-3"
          >
            <span className="text-text-tertiary group-hover:text-accent-cool font-data text-[10px] tracking-[0.15em] uppercase transition-colors duration-500">
              Latest thought
            </span>
            <h3 className="text-text-tertiary group-hover:text-accent-cool mt-1 text-xs leading-snug transition-colors duration-500">
              {latestThought.title}
            </h3>
            <time
              dateTime={latestThought.date}
              className="font-data text-text-tertiary mt-0.5 text-[10px]"
            >
              {formatContentDate(latestThought.date)}
            </time>
          </Link>
        ) : (
          <div className="hidden md:block" />
        )}

        <Link
          href="/rhythm"
          className="animate-resolve resolve-delay-4 group flex flex-col items-center opacity-50 transition-opacity duration-500 hover:opacity-90"
        >
          <span className="text-text-tertiary group-hover:text-text-primary font-heading text-lg font-bold transition-colors duration-500">
            {streak}
          </span>
          <span className="text-text-tertiary font-data text-[10px] tracking-[0.15em] uppercase">
            {getStreakLabel(streak)}
          </span>
        </Link>

        {latestDream ? (
          <Link
            href={`/dreams/${latestDream.slug}`}
            className="animate-resolve resolve-delay-5 group flex flex-col items-center opacity-50 transition-opacity duration-500 hover:opacity-90 md:translate-y-3"
          >
            <span className="text-text-tertiary group-hover:text-accent-dream font-data text-[10px] tracking-[0.15em] uppercase transition-colors duration-500">
              Latest dream
            </span>
            <h3 className="text-text-tertiary group-hover:text-accent-dream mt-1 text-xs leading-snug italic transition-colors duration-500">
              {latestDream.title}
            </h3>
            <time
              dateTime={latestDream.date}
              className="font-data text-text-tertiary mt-0.5 text-[10px]"
            >
              {formatContentDate(latestDream.date)}
            </time>
          </Link>
        ) : (
          <div className="hidden md:block" />
        )}
      </div>
    </section>
  );
}
