"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { DialogPortal } from "@/components/ui/dialog";
import type { SearchTypeFilter } from "@/lib/hooks/useSearch";
import { useSearch } from "@/lib/hooks/useSearch";
import { cn } from "@/lib/utils";

import { SearchResult } from "./SearchResult";

export interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_FILTERS: { label: string; value: SearchTypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Thoughts", value: "thought" },
  { label: "Dreams", value: "dream" },
];

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    results,
    total,
    isLoading,
    activeIndex,
    setActiveIndex,
  } = useSearch();

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setQuery("");
    setActiveIndex(0);
  }, [onOpenChange, setQuery, setActiveIndex]);

  const navigateToResult = useCallback(
    (index: number) => {
      const result = results[index];
      if (!result) return;

      const href =
        result.result_type === "thought"
          ? `/thoughts/${result.slug}`
          : `/dreams/${result.slug}`;

      handleClose();
      router.push(href);
    },
    [results, handleClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = activeIndex < results.length - 1 ? activeIndex + 1 : 0;
          setActiveIndex(next);

          const activeEl =
            listRef.current?.querySelector(`[data-active="true"]`);
          activeEl?.scrollIntoView({ block: "nearest" });
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = activeIndex > 0 ? activeIndex - 1 : results.length - 1;
          setActiveIndex(prev);

          const activeEl =
            listRef.current?.querySelector(`[data-active="true"]`);
          activeEl?.scrollIntoView({ block: "nearest" });
          break;
        }
        case "Enter": {
          e.preventDefault();
          navigateToResult(activeIndex);
          break;
        }
      }
    },
    [results.length, activeIndex, setActiveIndex, navigateToResult]
  );

  // Scroll active item into view when activeIndex changes
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[role='option']");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const showResults = query.trim().length > 0;
  const showEmpty = showResults && !isLoading && results.length === 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPortal forceMount data-slot="dialog-portal">
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="bg-void/80 fixed inset-0 z-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.1 }
                    : { duration: 0.2, ease: "easeOut" }
                }
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className="bg-surface border-elevated fixed top-[15%] left-1/2 z-50 flex w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-xl border shadow-2xl outline-none sm:max-w-xl"
                style={{ maxHeight: "min(70vh, 32rem)" }}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0, x: "-50%" }
                    : { opacity: 0, scale: 0.96, x: "-50%", y: -8 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1, x: "-50%" }
                    : { opacity: 1, scale: 1, x: "-50%", y: 0 }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0, x: "-50%" }
                    : { opacity: 0, scale: 0.98, x: "-50%", y: -4 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.1 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
                onKeyDown={handleKeyDown}
              >
                <DialogPrimitive.Title className="sr-only">
                  Search
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">
                  Search across thoughts and dreams
                </DialogPrimitive.Description>

                {/* Search input */}
                <div className="border-elevated flex items-center gap-3 border-b px-4">
                  <Search
                    className="text-text-tertiary size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search thoughts and dreams..."
                    className="text-text-primary placeholder:text-text-tertiary h-12 flex-1 bg-transparent text-sm outline-none"
                    aria-label="Search query"
                    aria-autocomplete="list"
                    aria-controls="search-results"
                    aria-activedescendant={
                      results.length > 0
                        ? `search-result-${activeIndex}`
                        : undefined
                    }
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {isLoading && (
                    <div className="border-accent-cool/40 border-t-accent-cool size-4 shrink-0 animate-spin rounded-full border-2" />
                  )}
                </div>

                {/* Type filter tabs */}
                {showResults && (
                  <div className="border-elevated flex gap-1 border-b px-4 py-2">
                    {TYPE_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setTypeFilter(filter.value)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                          typeFilter === filter.value
                            ? "bg-elevated text-text-primary"
                            : "text-text-tertiary hover:text-text-secondary"
                        )}
                      >
                        {filter.label}
                      </button>
                    ))}
                    <span className="text-text-tertiary ml-auto self-center text-xs">
                      {total} {total === 1 ? "result" : "results"}
                    </span>
                  </div>
                )}

                {/* Results list */}
                <div
                  ref={listRef}
                  id="search-results"
                  role="listbox"
                  aria-label="Search results"
                  className="void-scrollbar flex-1 overflow-y-auto"
                >
                  {showEmpty && (
                    <div className="text-text-tertiary flex flex-col items-center justify-center px-4 py-12 text-sm">
                      <p>No results found</p>
                    </div>
                  )}

                  {results.map((result, index) => (
                    <SearchResult
                      key={`${result.result_type}-${result.slug}`}
                      result={result}
                      isActive={index === activeIndex}
                      onClick={() => navigateToResult(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  ))}
                </div>

                {/* Footer hint */}
                {showResults && results.length > 0 && (
                  <div className="border-elevated text-text-tertiary flex items-center gap-4 border-t px-4 py-2 text-[10px]">
                    <span>
                      <kbd className="bg-void border-elevated rounded border px-1 py-0.5 font-mono">
                        &#8593;&#8595;
                      </kbd>{" "}
                      navigate
                    </span>
                    <span>
                      <kbd className="bg-void border-elevated rounded border px-1 py-0.5 font-mono">
                        &#9166;
                      </kbd>{" "}
                      open
                    </span>
                    <span>
                      <kbd className="bg-void border-elevated rounded border px-1 py-0.5 font-mono">
                        esc
                      </kbd>{" "}
                      close
                    </span>
                  </div>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPortal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
