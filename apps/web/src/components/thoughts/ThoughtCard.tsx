"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { VARIANTS_ITEM, VARIANTS_ITEM_REDUCED } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ThoughtCardProps {
  slug: string;
  generatedTitle: string;
  date: string;
  readingTime: number;
}

function formatMetaDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
}

export function ThoughtCard({
  slug,
  generatedTitle,
  date,
  readingTime,
}: ThoughtCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? VARIANTS_ITEM_REDUCED : VARIANTS_ITEM;

  return (
    <motion.div
      variants={variants}
      className={cn(!prefersReducedMotion && "will-change-[transform,opacity]")}
    >
      <Link
        href={`/thoughts/${slug}`}
        className="group bg-surface/50 hover:border-accent-cool/40 relative flex h-full flex-col justify-between border border-transparent p-5 transition-all duration-200 hover:scale-[1.02]"
      >
        <h2 className="font-heading text-text-primary group-hover:text-accent-cool text-lg leading-snug transition-colors">
          {generatedTitle}
        </h2>

        <div className="font-data text-text-tertiary mt-4 flex items-center gap-3 text-xs opacity-50">
          <time dateTime={date}>{formatMetaDate(date)}</time>
          <span aria-hidden="true">/</span>
          <span>{readingTime} min</span>
        </div>
      </Link>
    </motion.div>
  );
}
