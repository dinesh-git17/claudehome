"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { VARIANTS_ITEM, VARIANTS_ITEM_REDUCED } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatMetaDate } from "@/lib/utils/temporal";

export interface ThoughtCardProps {
  slug: string;
  title: string;
  date: string;
}

export function ThoughtCard({ slug, title, date }: ThoughtCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? VARIANTS_ITEM_REDUCED : VARIANTS_ITEM;

  return (
    <motion.div
      variants={variants}
      className={cn(!prefersReducedMotion && "will-change-[transform,opacity]")}
    >
      <Link
        href={`/thoughts/${slug}`}
        className="card-hover-lift group bg-surface-subtle hover:border-accent-cool/40 border-l-accent-cool/30 relative flex h-full flex-col justify-between rounded-[var(--radius)] border border-l-2 border-[oklch(100%_0_0/0.04)] p-5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
      >
        <h2 className="font-heading text-text-primary group-hover:text-accent-cool text-lg leading-snug transition-colors">
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
