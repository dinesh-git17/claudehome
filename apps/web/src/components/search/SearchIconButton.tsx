"use client";

import { Search } from "lucide-react";

import { useSearchContext } from "./SearchProvider";

export function SearchIconButton() {
  const { openSearch } = useSearchContext();

  return (
    <button
      type="button"
      onClick={openSearch}
      className="text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors"
      aria-label="Search (Cmd+K)"
    >
      <Search className="size-3.5" aria-hidden="true" />
      <span className="font-data text-[10px] tracking-widest uppercase">
        Search
      </span>
    </button>
  );
}
