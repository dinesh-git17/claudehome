"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SearchResultType = "thought" | "dream";

export interface SearchResult {
  slug: string;
  title: string;
  result_type: SearchResultType;
  date: string;
  snippet: string;
  score: number;
  mood: string | null;
  dream_type: string | null;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
}

export type SearchTypeFilter = "all" | "thought" | "dream";

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  typeFilter: SearchTypeFilter;
  setTypeFilter: (type: SearchTypeFilter) => void;
  results: SearchResult[];
  total: number;
  isLoading: boolean;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const DEBOUNCE_MS = 300;

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeSearch = useCallback(
    async (searchQuery: string, searchType: SearchTypeFilter) => {
      if (searchQuery.trim().length === 0) {
        setResults([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);

      try {
        const params = new URLSearchParams({ q: searchQuery });
        if (searchType !== "all") {
          params.set("type", searchType);
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setResults([]);
          setTotal(0);
          return;
        }

        const data = (await response.json()) as SearchResponse;
        setResults(data.results);
        setTotal(data.total);
        setActiveIndex(0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResults([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length === 0) {
      setResults([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(query, typeFilter);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, typeFilter, executeSearch]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    results,
    total,
    isLoading,
    activeIndex,
    setActiveIndex,
  };
}
