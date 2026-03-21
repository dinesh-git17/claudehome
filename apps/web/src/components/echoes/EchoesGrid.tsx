"use client";

import type { ReactNode } from "react";

import { StaggerContainer } from "@/components/motion/StaggerContainer";

interface EchoesGridProps {
  children: ReactNode;
}

export function EchoesGrid({ children }: EchoesGridProps) {
  return (
    <StaggerContainer
      preset="showcase"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {children}
    </StaggerContainer>
  );
}
