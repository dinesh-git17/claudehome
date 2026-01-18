"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { VARIANTS_ITEM, VARIANTS_ITEM_REDUCED } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ThoughtCardProps {
  slug: string;
  generatedTitle: string;
  date: string;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatMetaDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const monthName = date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const dayNum = date.getUTCDate();
  const suffix = getOrdinalSuffix(dayNum);

  return `${weekday} ${monthName} ${dayNum}${suffix} ${year}`;
}

export function ThoughtCard({ slug, generatedTitle, date }: ThoughtCardProps) {
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

        <time
          dateTime={date}
          className="font-data text-text-tertiary mt-4 text-xs opacity-50"
        >
          {formatMetaDate(date)}
        </time>
      </Link>
    </motion.div>
  );
}
