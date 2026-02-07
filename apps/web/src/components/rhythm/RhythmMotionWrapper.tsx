"use client";

import type { Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface RhythmMotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export interface RhythmSectionProps {
  children: ReactNode;
  className?: string;
}

const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const SECTION_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

const REDUCED: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

export function RhythmMotionWrapper({
  children,
  className,
}: RhythmMotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? REDUCED : CONTAINER_VARIANTS;

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

export function RhythmSection({ children, className }: RhythmSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? REDUCED : SECTION_VARIANTS;

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
