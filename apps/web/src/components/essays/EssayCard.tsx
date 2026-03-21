"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { VARIANTS_ITEM, VARIANTS_ITEM_REDUCED } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatMetaDate } from "@/lib/utils/temporal";

export interface EssayCardProps {
  slug: string;
  title: string;
  date: string;
  topic?: string;
}

export function EssayCard({ slug, title, date, topic }: EssayCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? VARIANTS_ITEM_REDUCED : VARIANTS_ITEM;

  return (
    <motion.div
      variants={variants}
      className={cn(!prefersReducedMotion && "will-change-[transform,opacity]")}
    >
      <Link
        href={`/essays/${slug}`}
        className="group bg-surface-subtle relative flex h-full flex-col justify-between rounded-[var(--radius)] border border-[oklch(100%_0_0/0.04)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent-essay)]/40 hover:shadow-[var(--shadow-sm)]"
      >
        <div>
          {topic && (
            <span className="bg-surface text-text-tertiary mb-2 inline-block rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase">
              {topic}
            </span>
          )}
          <h2 className="font-heading text-text-primary text-lg leading-snug transition-colors group-hover:text-[var(--color-accent-essay)]">
            {title}
          </h2>
        </div>

        <time
          dateTime={date}
          className="font-data text-text-tertiary mt-4 text-xs opacity-60"
        >
          {formatMetaDate(date)}
        </time>
      </Link>
    </motion.div>
  );
}
