"use client";

import type { Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Preset configurations for common stagger patterns.
 * "showcase": Elegant portfolio reveal (slower cascade)
 * "lab": Technical precision (faster boot sequence)
 * "default": Standard crystallization pattern
 */
export type StaggerPreset = "showcase" | "lab" | "default";

export interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay before first child begins animating (seconds) */
  delayChildren?: number;
  /** Delay between each child animation (seconds) */
  staggerChildren?: number;
  /** Preset configuration for common patterns */
  preset?: StaggerPreset;
  /** Animate only once when entering viewport */
  viewportOnce?: boolean;
  /** Viewport margin for triggering animation */
  viewportMargin?: string;
}

const PRESET_CONFIG: Record<
  StaggerPreset,
  { delayChildren: number; staggerChildren: number }
> = {
  showcase: { delayChildren: 0.1, staggerChildren: 0.08 },
  lab: { delayChildren: 0.05, staggerChildren: 0.04 },
  default: { delayChildren: 0.1, staggerChildren: 0.05 },
};

const VARIANTS_REDUCED: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

export function StaggerContainer({
  children,
  className,
  delayChildren,
  staggerChildren,
  preset = "default",
  viewportOnce = true,
  viewportMargin = "0px 0px -100px 0px",
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const config = PRESET_CONFIG[preset];
  const finalDelayChildren = delayChildren ?? config.delayChildren;
  const finalStaggerChildren = staggerChildren ?? config.staggerChildren;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: finalStaggerChildren,
        delayChildren: finalDelayChildren,
      },
    },
  };

  const variants = prefersReducedMotion ? VARIANTS_REDUCED : containerVariants;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: viewportOnce, margin: viewportMargin }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Motion profile matching the container preset */
  preset?: StaggerPreset;
}

/**
 * Biological ease: responsive start with gentle deceleration.
 */
const BIOLOGICAL_EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const ITEM_VARIANTS: Record<StaggerPreset, Variants> = {
  showcase: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: BIOLOGICAL_EASE,
      },
    },
  },
  lab: {
    hidden: {
      opacity: 0,
      y: 10,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: BIOLOGICAL_EASE,
      },
    },
  },
  default: {
    hidden: {
      opacity: 0,
      y: 8,
      filter: "blur(4px)",
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: BIOLOGICAL_EASE,
      },
    },
  },
};

const ITEM_VARIANT_REDUCED: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

/**
 * Stagger child item with performance-optimized transforms.
 * Must be used inside StaggerContainer.
 */
export function StaggerItem({
  children,
  className,
  preset = "default",
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? ITEM_VARIANT_REDUCED
    : ITEM_VARIANTS[preset];

  return (
    <motion.div
      variants={variants}
      className={cn(className)}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, transform" }
      }
    >
      {children}
    </motion.div>
  );
}
