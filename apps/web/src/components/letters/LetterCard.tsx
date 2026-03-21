"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { VARIANTS_ITEM, VARIANTS_ITEM_REDUCED } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatMetaDate } from "@/lib/utils/temporal";

export interface LetterCardProps {
  slug: string;
  title: string;
  date: string;
}

export function LetterCard({ slug, title, date }: LetterCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? VARIANTS_ITEM_REDUCED : VARIANTS_ITEM;

  return (
    <motion.div
      variants={variants}
      className={cn(!prefersReducedMotion && "will-change-[transform,opacity]")}
    >
      <Link
        href={`/letters/${slug}`}
        className="group bg-surface-subtle relative flex h-full flex-col justify-between rounded-[var(--radius)] border border-[oklch(100%_0_0/0.04)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent-letter)]/40 hover:shadow-[var(--shadow-sm)]"
      >
        <h2 className="font-prose text-text-primary text-lg leading-relaxed italic transition-colors group-hover:text-[var(--color-accent-letter)]">
          {title}
        </h2>

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
