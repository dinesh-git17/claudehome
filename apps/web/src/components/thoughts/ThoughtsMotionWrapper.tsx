"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import {
  VARIANTS_CONTAINER,
  VARIANTS_ITEM,
  VARIANTS_ITEM_REDUCED,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ThoughtsMotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export interface WeekHeaderProps {
  id: string;
  label: string;
  isFirst?: boolean;
}

export function ThoughtsMotionWrapper({
  children,
  className,
}: ThoughtsMotionWrapperProps) {
  return (
    <motion.div
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="show"
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function WeekHeader({ id, label, isFirst }: WeekHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? VARIANTS_ITEM_REDUCED : VARIANTS_ITEM;

  return (
    <motion.h2
      id={id}
      variants={variants}
      className={cn(
        "font-data text-text-tertiary/50 col-span-full py-2 text-sm tracking-wide",
        !prefersReducedMotion && "will-change-[transform,opacity]",
        isFirst ? "" : "mt-8"
      )}
    >
      {label}
    </motion.h2>
  );
}
