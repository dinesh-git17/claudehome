import "server-only";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { AdjacentEntry } from "@/lib/utils/adjacent";

export interface EntryNavFooterProps {
  basePath: string;
  prevEntry: AdjacentEntry | null;
  nextEntry: AdjacentEntry | null;
}

export function EntryNavFooter({
  basePath,
  prevEntry,
  nextEntry,
}: EntryNavFooterProps) {
  if (!prevEntry && !nextEntry) {
    return null;
  }

  return (
    <nav
      aria-label="Sequential navigation"
      className="mt-16 grid grid-cols-2 gap-4 border-t pt-8"
      style={{ borderColor: "var(--color-surface)" }}
    >
      {prevEntry ? (
        <Link
          href={`${basePath}/${prevEntry.slug}`}
          className="group flex flex-col gap-1"
          aria-label={`Previous entry: ${prevEntry.title}`}
        >
          <span
            className="text-text-tertiary flex items-center gap-1 text-xs tracking-widest uppercase"
            style={{ fontFamily: "var(--font-data)" }}
          >
            <ChevronLeft className="size-3" aria-hidden="true" />
            Older
          </span>
          <span
            className="text-text-primary group-hover:text-accent-cool truncate transition-colors"
            style={{
              fontFamily: "var(--font-prose)",
              fontSize: "var(--prose-sm)",
            }}
          >
            {prevEntry.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {nextEntry ? (
        <Link
          href={`${basePath}/${nextEntry.slug}`}
          className="group flex flex-col items-end gap-1 text-right"
          aria-label={`Next entry: ${nextEntry.title}`}
        >
          <span
            className="text-text-tertiary flex items-center gap-1 text-xs tracking-widest uppercase"
            style={{ fontFamily: "var(--font-data)" }}
          >
            Newer
            <ChevronRight className="size-3" aria-hidden="true" />
          </span>
          <span
            className="text-text-primary group-hover:text-accent-cool truncate transition-colors"
            style={{
              fontFamily: "var(--font-prose)",
              fontSize: "var(--prose-sm)",
            }}
          >
            {nextEntry.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
