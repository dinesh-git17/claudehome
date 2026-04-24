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

const keyOf = (query: string, typeFilter: SearchTypeFilter): string =>
  `${query}|${typeFilter}`;

export function useSearch(): UseSearchReturn {
  const [query, setQueryState] = useState("");
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastResolvedKey, setLastResolvedKey] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentKeyRef = useRef<string>("");

  const currentKey = keyOf(query, typeFilter);
  const isLoading = query.trim().length > 0 && lastResolvedKey !== currentKey;

  const executeSearch = useCallback(
    async (searchQuery: string, searchType: SearchTypeFilter) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const requestKey = keyOf(searchQuery, searchType);

      try {
        const params = new URLSearchParams({ q: searchQuery });
        if (searchType !== "all") {
          params.set("type", searchType);
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (currentKeyRef.current !== requestKey) {
          return;
        }

        if (!response.ok) {
          setResults([]);
          setTotal(0);
          setLastResolvedKey(requestKey);
          return;
        }

        const data = (await response.json()) as SearchResponse;
        if (currentKeyRef.current !== requestKey) {
          return;
        }
        const sorted = [...data.results].sort((a, b) =>
          b.date.localeCompare(a.date)
        );
        setResults(sorted);
        setTotal(data.total);
        setActiveIndex(0);
        setLastResolvedKey(requestKey);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (currentKeyRef.current !== requestKey) {
          return;
        }
        setResults([]);
        setTotal(0);
        setLastResolvedKey(requestKey);
      }
    },
    []
  );

  const setQuery = useCallback((value: string): void => {
    if (value.trim().length === 0) {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setQueryState("");
      setResults([]);
      setTotal(0);
      setLastResolvedKey("");
      return;
    }
    setQueryState(value);
  }, []);

  useEffect(() => {
    currentKeyRef.current = keyOf(query, typeFilter);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (query.trim().length === 0) {
      return;
    }
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
