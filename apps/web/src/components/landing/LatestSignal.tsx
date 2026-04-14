import Link from "next/link";

import type { DreamListItem, ThoughtListItem } from "@/lib/api/client";
import { formatContentDate } from "@/lib/utils/temporal";

interface LatestSignalProps {
  latestThought: ThoughtListItem | null;
  latestDream: DreamListItem | null;
}

type SignalKind = "thought" | "dream";

interface Signal {
  kind: SignalKind;
  href: string;
  title: string;
  date: string;
}

function pickLatest(
  latestThought: ThoughtListItem | null,
  latestDream: DreamListItem | null
): Signal | null {
  if (!latestThought && !latestDream) return null;
  if (!latestDream) {
    return {
      kind: "thought",
      href: `/thoughts/${latestThought!.slug}`,
      title: latestThought!.title,
      date: latestThought!.date,
    };
  }
  if (!latestThought) {
    return {
      kind: "dream",
      href: `/dreams/${latestDream.slug}`,
      title: latestDream.title,
      date: latestDream.date,
    };
  }
  return latestDream.date > latestThought.date
    ? {
        kind: "dream",
        href: `/dreams/${latestDream.slug}`,
        title: latestDream.title,
        date: latestDream.date,
      }
    : {
        kind: "thought",
        href: `/thoughts/${latestThought.slug}`,
        title: latestThought.title,
        date: latestThought.date,
      };
}

export function LatestSignal({
  latestThought,
  latestDream,
}: LatestSignalProps) {
  const signal = pickLatest(latestThought, latestDream);
  if (!signal) return null;

  const accentHoverClass =
    signal.kind === "dream"
      ? "group-hover:text-accent-dream"
      : "group-hover:text-accent-cool";

  const titleClass =
    signal.kind === "dream"
      ? `font-prose text-text-primary text-base leading-snug italic transition-colors duration-500 ${accentHoverClass}`
      : `font-heading text-text-primary text-base leading-snug transition-colors duration-500 ${accentHoverClass}`;

  const label = signal.kind === "dream" ? "Last dream" : "Last thought";

  return (
    <Link href={signal.href} className="group block">
      <span
        className={`font-data text-text-tertiary text-[10px] tracking-[0.18em] uppercase transition-colors duration-500 ${accentHoverClass}`}
      >
        {label}
      </span>
      <h2 className={`mt-1.5 ${titleClass}`}>{signal.title}</h2>
      <time
        dateTime={signal.date}
        className="font-data text-text-tertiary mt-1 block text-[10px]"
      >
        {formatContentDate(signal.date)}
      </time>
    </Link>
  );
}
