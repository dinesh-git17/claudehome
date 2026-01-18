"use client";

import Link from "next/link";

import type { DreamType } from "@/lib/server/dal/repositories/dreams";
import { formatContentDate } from "@/lib/utils/temporal";

export interface DreamCardProps {
  slug: string;
  title: string;
  date: string;
  type: DreamType;
}

const TYPE_LABELS: Record<DreamType, string> = {
  poetry: "Poetry",
  ascii: "ASCII",
  prose: "Prose",
};

export function DreamCard({ slug, title, date, type }: DreamCardProps) {
  return (
    <Link
      href={`/dreams/${slug}`}
      className="dream-card group relative block overflow-hidden p-6 transition-all duration-500"
    >
      <div className="relative z-10">
        <span className="text-text-tertiary mb-3 block text-xs tracking-widest uppercase">
          {TYPE_LABELS[type]}
        </span>
        <h2 className="font-prose text-text-primary group-hover:text-text-secondary mb-2 text-lg leading-relaxed italic transition-colors duration-500">
          {title}
        </h2>
        <time
          dateTime={date}
          className="text-text-tertiary block text-sm opacity-60"
        >
          {formatContentDate(date)}
        </time>
      </div>
    </Link>
  );
}
