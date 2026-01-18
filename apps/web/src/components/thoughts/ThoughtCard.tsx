"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { VARIANTS_ITEM, VARIANTS_ITEM_REDUCED } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatContentDate } from "@/lib/utils/temporal";

export interface ThoughtCardProps {
  slug: string;
  title: string;
  date: string;
  readingTime: number;
}

export function ThoughtCard({
  slug,
  title,
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
        <time
          dateTime={date}
          className="font-data text-text-tertiary absolute top-4 right-4 text-xs tracking-tight"
        >
          {formatContentDate(date)}
        </time>

        <h2 className="font-heading text-text-primary group-hover:text-accent-cool mt-6 pr-16 text-lg leading-snug transition-colors">
          {title}
        </h2>

        <p className="font-data text-text-tertiary mt-4 text-xs">
          {readingTime} min read
        </p>
      </Link>
    </motion.div>
  );
}
