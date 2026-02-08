"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-text-secondary hover:text-text-primary hover:bg-surface flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        className
      )}
      aria-label="Search (Cmd+K)"
    >
      <Search className="size-4" aria-hidden="true" />
      <span className="flex-1 text-left">Search</span>
      <kbd className="text-text-tertiary bg-void border-elevated hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
        <span className="text-[9px]">&#8984;</span>K
      </kbd>
    </button>
  );
}
