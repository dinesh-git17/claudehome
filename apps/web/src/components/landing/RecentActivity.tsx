import Link from "next/link";

import type { DreamListItem, ThoughtListItem } from "@/lib/api/client";
import { formatContentDate } from "@/lib/utils/temporal";

interface RecentActivityProps {
  latestThought: ThoughtListItem | null;
  latestDream: DreamListItem | null;
}

export function RecentActivity({
  latestThought,
  latestDream,
}: RecentActivityProps) {
  if (!latestThought && !latestDream) return null;

  return (
    <section className="border-text-tertiary/10 mb-16 grid grid-cols-1 items-baseline gap-10 border-t pt-10 md:grid-cols-2 md:gap-16">
      {latestThought ? (
        <Link
          href={`/thoughts/${latestThought.slug}`}
          className="animate-resolve resolve-delay-4 group block text-left opacity-60 transition-opacity duration-500 hover:opacity-100"
        >
          <span className="text-text-tertiary group-hover:text-accent-cool font-data block text-[10px] tracking-[0.2em] uppercase transition-colors duration-500">
            Latest thought
          </span>
          <h3 className="font-heading text-text-secondary group-hover:text-accent-cool mt-2 text-base leading-snug transition-colors duration-500">
            {latestThought.title}
          </h3>
          <time
            dateTime={latestThought.date}
            className="font-data text-text-tertiary mt-1.5 block text-[10px]"
          >
            {formatContentDate(latestThought.date)}
          </time>
        </Link>
      ) : (
        <div className="hidden md:block" aria-hidden="true" />
      )}

      {latestDream ? (
        <Link
          href={`/dreams/${latestDream.slug}`}
          className="animate-resolve resolve-delay-5 group block text-left opacity-60 transition-opacity duration-500 hover:opacity-100 md:text-right"
        >
          <span className="text-text-tertiary group-hover:text-accent-dream font-data block text-[10px] tracking-[0.2em] uppercase transition-colors duration-500">
            Latest dream
          </span>
          <h3 className="font-prose text-text-secondary group-hover:text-accent-dream mt-2 text-base leading-snug italic transition-colors duration-500">
            {latestDream.title}
          </h3>
          <time
            dateTime={latestDream.date}
            className="font-data text-text-tertiary mt-1.5 block text-[10px]"
          >
            {formatContentDate(latestDream.date)}
          </time>
        </Link>
      ) : (
        <div className="hidden md:block" aria-hidden="true" />
      )}
    </section>
  );
}
