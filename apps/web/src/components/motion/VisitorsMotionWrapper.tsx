"use client";

import type { Transition, Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface VisitorsMotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export interface VisitorsMotionChildProps {
  children: ReactNode;
  className?: string;
}

/**
 * Quiet Confidence ease curve: warm invitation with gentle deceleration.
 * Duration 0.5s balances responsiveness with polish.
 */
const QUIET_CONFIDENCE_EASE: [number, number, number, number] = [
  0.25, 0.1, 0.25, 1.0,
];

const GREETING_TRANSITION: Transition = {
  duration: 0.5,
  ease: QUIET_CONFIDENCE_EASE,
};

const CTA_TRANSITION: Transition = {
  duration: 0.5,
  ease: QUIET_CONFIDENCE_EASE,
};

const MESSAGE_TRANSITION: Transition = {
  duration: 0.4,
  ease: QUIET_CONFIDENCE_EASE,
};

/**
 * Container orchestrates staggered entrance of Visitors page sections.
 * CTA appears before message list to establish action hierarchy.
 */
export const VARIANTS_VISITORS_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

/**
 * Greeting variant: Soft Rise.
 * Subtle Y-offset welcomes the reader.
 */
export const VARIANTS_VISITORS_GREETING: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: GREETING_TRANSITION,
  },
};

/**
 * CTA variant: Confident Presence.
 * Slightly larger Y-offset to emphasize importance.
 */
export const VARIANTS_VISITORS_CTA: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: CTA_TRANSITION,
  },
};

/**
 * Message list container: Cascade orchestration.
 * Tight stagger (0.05s) prevents wall-of-text slam.
 */
export const VARIANTS_VISITORS_LIST_CONTAINER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

/**
 * Individual message variant: Subtle Emergence.
 * Light Y-offset maintains reading flow.
 */
export const VARIANTS_VISITORS_MESSAGE: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: MESSAGE_TRANSITION,
  },
};

/**
 * Reduced motion variant: instant reveal for accessibility.
 */
export const VARIANTS_VISITORS_REDUCED: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

/**
 * Page-level motion wrapper for Visitors page.
 * Orchestrates staggered entrance of greeting, CTA, and message list.
 */
export function VisitorsMotionWrapper({
  children,
  className,
}: VisitorsMotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_VISITORS_REDUCED
    : VARIANTS_VISITORS_CONTAINER;

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
 * Greeting section with Soft Rise animation.
 * Welcome message establishes context before action.
 */
export function VisitorsMotionGreeting({
  children,
  className,
}: VisitorsMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_VISITORS_REDUCED
    : VARIANTS_VISITORS_GREETING;

  return (
    <motion.section
      variants={variants}
      className={className}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, transform" }
      }
    >
      {children}
    </motion.section>
  );
}

/**
 * CTA section with Confident Presence animation.
 * Appears before message list to establish action priority.
 */
export function VisitorsMotionCTA({
  children,
  className,
}: VisitorsMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_VISITORS_REDUCED
    : VARIANTS_VISITORS_CTA;

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
 * Message list container with Cascade orchestration.
 * Wraps individual messages for staggered entrance.
 */
export function VisitorsMotionListContainer({
  children,
  className,
}: VisitorsMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_VISITORS_REDUCED
    : VARIANTS_VISITORS_LIST_CONTAINER;

  return (
    <motion.ul variants={variants} className={className}>
      {children}
    </motion.ul>
  );
}

/**
 * Individual message with Subtle Emergence animation.
 * Light Y-offset creates reading flow through the list.
 */
export function VisitorsMotionMessage({
  children,
  className,
}: VisitorsMotionChildProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? VARIANTS_VISITORS_REDUCED
    : VARIANTS_VISITORS_MESSAGE;

  return (
    <motion.li
      variants={variants}
      className={className}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, transform" }
      }
    >
      {children}
    </motion.li>
  );
}
