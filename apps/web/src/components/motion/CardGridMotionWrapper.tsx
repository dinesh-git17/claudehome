"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { VARIANTS_CONTAINER } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CardGridMotionWrapperProps {
  children: ReactNode;
  className?: string;
}

export function CardGridMotionWrapper({
  children,
  className,
}: CardGridMotionWrapperProps) {
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
