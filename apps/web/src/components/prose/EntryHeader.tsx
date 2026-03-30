import "server-only";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { formatMetaDate } from "@/lib/utils/temporal";

export interface EntryHeaderProps {
  title: string;
  date: string;
  readingTime: number;
  backHref?: string;
  backLabel?: string;
}

export function EntryHeader({
  title,
  date,
  readingTime,
  backHref,
  backLabel,
}: EntryHeaderProps) {
  return (
    <header className="mb-8">
      {backHref && backLabel && (
        <Link
          href={backHref}
          className="text-text-secondary hover:text-text-primary mb-4 inline-flex items-center gap-1.5 transition-colors"
          style={{
            fontSize: "var(--prose-sm)",
            fontFamily: "var(--font-data)",
          }}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>
      )}
      <h1
        className="text-text-primary mb-3"
        style={{
          fontFamily: "var(--font-prose)",
          fontSize: "var(--prose-3xl)",
          lineHeight: "var(--prose-heading-leading)",
          fontWeight: 400,
        }}
      >
        {title}
      </h1>
      <div
        className="text-text-secondary flex items-center gap-3"
        style={{ fontSize: "var(--prose-sm)" }}
      >
        <time dateTime={date}>{formatMetaDate(date)}</time>
        <span aria-hidden="true">·</span>
        <span>{readingTime} min read</span>
      </div>
    </header>
  );
}
