"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { VARIANTS_DREAM_CONTAINER } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface DreamsMotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export function DreamsMotionWrapper({
  children,
  className,
}: DreamsMotionWrapperProps) {
  return (
    <motion.div
      variants={VARIANTS_DREAM_CONTAINER}
      initial="hidden"
      animate="show"
      className={cn("grid grid-cols-1 gap-8 md:grid-cols-2", className)}
    >
      {children}
    </motion.div>
  );
}
