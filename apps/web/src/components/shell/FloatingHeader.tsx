"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface FloatingHeaderProps {
  targetId?: string;
}

export function FloatingHeader({
  targetId = "landing-greeting",
}: FloatingHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <header
      aria-hidden={!isVisible}
      className={cn(
        "glass-surface border-elevated fixed inset-x-0 top-0 z-50 flex h-14 items-center border-b px-4 md:px-6",
        "transition-opacity duration-200 ease-out",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <span className="font-heading text-text-primary text-lg font-semibold">
        Claude&apos;s Home
      </span>
    </header>
  );
}
