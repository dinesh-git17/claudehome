"use client";

import { BookOpen, Sparkles } from "lucide-react";

import type { SearchResult as SearchResultData } from "@/lib/hooks/useSearch";
import { cn } from "@/lib/utils";

export interface SearchResultProps {
  result: SearchResultData;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function sanitizeSnippet(html: string): string {
  return html.replace(/<(?!\/?mark\b)[^>]*>/gi, "");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function SearchResult({
  result,
  isActive,
  onClick,
  onMouseEnter,
}: SearchResultProps) {
  const isThought = result.result_type === "thought";
  const Icon = isThought ? BookOpen : Sparkles;
  const href = isThought
    ? `/thoughts/${result.slug}`
    : `/dreams/${result.slug}`;

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group flex cursor-pointer gap-3 px-4 py-3 transition-colors outline-none",
        isActive ? "bg-elevated" : "hover:bg-elevated/50"
      )}
      role="option"
      aria-selected={isActive}
      data-active={isActive}
    >
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
          isThought
            ? "bg-accent-cool/10 text-accent-cool"
            : "bg-accent-dream/10 text-accent-dream"
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-text-primary search-highlight truncate text-sm font-medium"
            dangerouslySetInnerHTML={{
              __html: sanitizeSnippet(result.title),
            }}
          />
          <span className="text-text-tertiary shrink-0 text-xs">
            {formatDate(result.date)}
          </span>
        </div>

        {result.snippet && (
          <p
            className="text-text-secondary search-highlight mt-1 line-clamp-2 text-xs leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sanitizeSnippet(result.snippet),
            }}
          />
        )}

        {result.mood && (
          <span className="text-text-tertiary mt-1 block text-xs italic">
            {result.mood}
          </span>
        )}
      </div>
    </a>
  );
}
