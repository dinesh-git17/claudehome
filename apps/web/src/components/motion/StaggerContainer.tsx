"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { VARIANTS_CONTAINER } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({
  children,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="show"
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
