"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface ContextualHeaderProps {
  threshold?: number;
  className?: string;
}

export function ContextualHeader({
  threshold = 100,
  className,
}: ContextualHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainElement = headerRef.current?.closest("main");
    if (!mainElement) return;

    function handleScroll() {
      if (!mainElement) return;
      setIsVisible(mainElement.scrollTop > threshold);
    }

    mainElement.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      mainElement.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return (
    <div
      ref={headerRef}
      className={cn(
        "sticky top-0 z-10 h-14 border-b transition-all duration-300",
        "border-elevated/0 bg-void/0 backdrop-blur-none",
        isVisible && "border-elevated bg-void/80 backdrop-blur-md",
        className
      )}
      aria-hidden={!isVisible}
    />
  );
}
