"use client";

import type { Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FileContentMotionPreset = "showcase" | "lab";

export interface FileContentMotionWrapperProps {
  children: ReactNode;
  className?: string;
  /** Motion preset matching the sidebar FileTree preset */
  preset: FileContentMotionPreset;
}

/**
 * Biological ease: responsive start with gentle deceleration.
 */
const BIOLOGICAL_EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const MOTION_CONFIG: Record<
  FileContentMotionPreset,
  { y: number; duration: number; delay: number }
> = {
  showcase: { y: 16, duration: 0.5, delay: 0.15 },
  lab: { y: 8, duration: 0.3, delay: 0.1 },
};

const VARIANTS_REDUCED: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

/**
 * Motion wrapper for file content area in Projects/Sandbox layouts.
 * Provides coordinated entrance animation matching the sidebar preset.
 */
export function FileContentMotionWrapper({
  children,
  className,
  preset,
}: FileContentMotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = MOTION_CONFIG[preset];

  const variants: Variants = prefersReducedMotion
    ? VARIANTS_REDUCED
    : {
        hidden: {
          opacity: 0,
          y: config.y,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: config.duration,
            delay: config.delay,
            ease: BIOLOGICAL_EASE,
          },
        },
      };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={cn(className)}
      style={
        prefersReducedMotion ? undefined : { willChange: "opacity, transform" }
      }
    >
      {children}
    </motion.div>
  );
}
