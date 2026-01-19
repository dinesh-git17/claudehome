"use client";

import type { Transition, Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface AboutMotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export interface AboutMotionChildProps {
  children: ReactNode;
  className?: string;
}

/**
 * Soft Authority ease curve: gentle rise with biological deceleration.
 * Longer duration (0.6s) establishes warmth and trust.
 */
const SOFT_AUTHORITY_EASE: [number, number, number, number] = [
  0.25, 0.1, 0.25, 1.0,
];

const HEADER_TRANSITION: Transition = {
  duration: 0.6,
  ease: SOFT_AUTHORITY_EASE,
};

const PROSE_TRANSITION: Transition = {
  duration: 0.6,
  ease: SOFT_AUTHORITY_EASE,
};

const LIST_TRANSITION: Transition = {
  duration: 0.5,
  ease: SOFT_AUTHORITY_EASE,
};

/**
 * Container orchestrates staggered entrance of About page sections.
 * Base stagger delay of 0.1s between major semantic groups.
 */
export const VARIANTS_ABOUT_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

/**
 * Header variant: Gentle Rise.
 * Y-offset 20px establishes spatial hierarchy.
 */
export const VARIANTS_ABOUT_HEADER: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: HEADER_TRANSITION,
  },
};

/**
 * Prose variant: Soft Materialization.
 * Opacity-only preserves reading line stability.
 */
export const VARIANTS_ABOUT_PROSE: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: PROSE_TRANSITION,
  },
};

/**
 * List item variant: Cascade.
 * Subtle Y-offset (10px) with internal stagger.
 */
export const VARIANTS_ABOUT_LIST_ITEM: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: LIST_TRANSITION,
  },
};

/**
 * List container: Cascade orchestration.
 * 0.05s stagger between individual list items.
 */
export const VARIANTS_ABOUT_LIST_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

/**
 * Reduced motion variant: instant reveal for accessibility.
 */
export const VARIANTS_ABOUT_REDUCED: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

/**
 * Page-level motion wrapper for About page.
 * Orchestrates staggered entrance of header, prose, and list sections.
 */
export function AboutMotionWrapper({
  children,
  className,
}: AboutMotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_ABOUT_REDUCED
    : VARIANTS_ABOUT_CONTAINER;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Header section with Gentle Rise animation.
 * Name and role appear first to establish identity context.
 */
export function AboutMotionHeader({
  children,
  className,
}: AboutMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_ABOUT_REDUCED
    : VARIANTS_ABOUT_HEADER;

  return (
    <motion.header
      variants={variants}
      className={className}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, transform" }
      }
    >
      {children}
    </motion.header>
  );
}

/**
 * Prose section with Soft Materialization animation.
 * Opacity-only transition maintains reading line stability.
 */
export function AboutMotionProse({
  children,
  className,
}: AboutMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_ABOUT_REDUCED
    : VARIANTS_ABOUT_PROSE;

  return (
    <motion.div
      variants={variants}
      className={className}
      style={prefersReducedMotion ? undefined : { willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * List container with Cascade orchestration.
 * Wraps list items for staggered entrance animation.
 */
export function AboutMotionListContainer({
  children,
  className,
}: AboutMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_ABOUT_REDUCED
    : VARIANTS_ABOUT_LIST_CONTAINER;

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Individual list item with Cascade animation.
 * Subtle Y-offset creates reading flow through the timeline.
 */
export function AboutMotionListItem({
  children,
  className,
}: AboutMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_ABOUT_REDUCED
    : VARIANTS_ABOUT_LIST_ITEM;

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
