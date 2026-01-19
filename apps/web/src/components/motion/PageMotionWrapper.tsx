"use client";

import type { Transition, Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export type PageMotionVariant = "thought" | "dream";

export interface PageMotionWrapperProps {
  children: ReactNode;
  variant: PageMotionVariant;
  className?: string;
}

/**
 * Standard Decelerate: Productivity & Clarity.
 * Fast stabilization for analytical content.
 */
const THOUGHT_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/**
 * Emphasized Decelerate: Immersion & Ethereal.
 * Slow atmospheric reveal for abstract content.
 */
const DREAM_EASE: [number, number, number, number] = [0.05, 0.7, 0.1, 1.0];

const THOUGHT_TRANSITION: Transition = {
  duration: 0.3,
  ease: THOUGHT_EASE,
};

const DREAM_TRANSITION: Transition = {
  duration: 0.8,
  ease: DREAM_EASE,
};

export const VARIANTS_PAGE_THOUGHT: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...THOUGHT_TRANSITION,
      staggerChildren: 0.05,
    },
  },
};

export const VARIANTS_PAGE_DREAM: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: DREAM_TRANSITION,
  },
};

export const VARIANTS_PAGE_THOUGHT_CHILD: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: THOUGHT_TRANSITION,
  },
};

export const VARIANTS_PAGE_DREAM_PROSE: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: DREAM_TRANSITION,
  },
};

export const VARIANTS_PAGE_REDUCED: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const VARIANT_MAP: Record<PageMotionVariant, Variants> = {
  thought: VARIANTS_PAGE_THOUGHT,
  dream: VARIANTS_PAGE_DREAM,
};

export interface PageMotionChildProps {
  children: ReactNode;
  className?: string;
}

export interface PageMotionDreamProseProps {
  children: ReactNode;
  className?: string;
}

export function PageMotionWrapper({
  children,
  variant,
  className,
}: PageMotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_PAGE_REDUCED
    : VARIANT_MAP[variant];

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, transform" }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered child element for thought pages.
 * Must be used inside PageMotionWrapper with variant="thought".
 */
export function PageMotionChild({ children, className }: PageMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_PAGE_REDUCED
    : VARIANTS_PAGE_THOUGHT_CHILD;

  return (
    <motion.div
      variants={variants}
      className={className}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, transform" }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Blur-transitioning prose container for dream pages.
 * Applies deep blur transition independent of parent scale.
 */
export function PageMotionDreamProse({
  children,
  className,
}: PageMotionDreamProseProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_PAGE_REDUCED
    : VARIANTS_PAGE_DREAM_PROSE;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, filter" }
      }
    >
      {children}
    </motion.div>
  );
}
