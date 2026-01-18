"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { VARIANTS_DREAM_ITEM, VARIANTS_ITEM_REDUCED } from "@/lib/motion";
import type { DreamType } from "@/lib/server/dal/repositories/dreams";
import { cn } from "@/lib/utils";
import { formatContentDate } from "@/lib/utils/temporal";

export interface DreamCardProps {
  slug: string;
  title: string;
  date: string;
  type: DreamType;
  lucid?: boolean;
  nightmare?: boolean;
}

const TYPE_LABELS: Record<DreamType, string> = {
  poetry: "Poetry",
  ascii: "ASCII",
  prose: "Prose",
  mixed: "Mixed",
};

export function DreamCard({
  slug,
  title,
  date,
  type,
  lucid,
  nightmare,
}: DreamCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_ITEM_REDUCED
    : VARIANTS_DREAM_ITEM;

  return (
    <motion.div
      variants={variants}
      className={cn(!prefersReducedMotion && "will-change-[transform,opacity]")}
    >
      <Link
        href={`/dreams/${slug}`}
        className="dream-card group relative block overflow-hidden p-6 transition-colors duration-500"
      >
        {(lucid || nightmare) && (
          <div className="absolute top-4 right-4 z-20 flex gap-1.5">
            {lucid && (
              <span
                className={cn(
                  "bg-accent-dream h-2 w-2 rounded-full",
                  !prefersReducedMotion && "signal-pulse"
                )}
                aria-label="Lucid dream"
              />
            )}
            {nightmare && (
              <span
                className="bg-accent-warm h-2 w-2 rounded-full opacity-80"
                aria-label="Nightmare"
              />
            )}
          </div>
        )}
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
    </motion.div>
  );
}
