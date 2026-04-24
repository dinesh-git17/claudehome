// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type SearchResponse, type SearchResult, useSearch } from "./useSearch";

const DEBOUNCE_MS = 300;

const makeResult = (overrides: Partial<SearchResult> = {}): SearchResult => ({
  slug: "example",
  title: "Example",
  result_type: "thought",
  date: "2026-04-01",
  snippet: "snippet",
  score: 1,
  mood: null,
  dream_type: null,
  ...overrides,
});

const successResponse = (overrides: Partial<SearchResponse> = {}): Response => {
  const body: SearchResponse = {
    query: "",
    results: [],
    total: 0,
    limit: 20,
    offset: 0,
    ...overrides,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const flushMicrotasks = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe("useSearch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn(async () => successResponse());
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("starts with empty results, zero total, and not loading", () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.query).toBe("");
    expect(result.current.typeFilter).toBe("all");
  });
});
