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

  it("fires a single fetch after DEBOUNCE_MS when query is set", async () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("hello");
    });

    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("q=hello");
  });

  it("coalesces rapid setQuery calls into a single fetch for the last value", async () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("h");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    act(() => {
      result.current.setQuery("he");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    act(() => {
      result.current.setQuery("hel");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("q=hel");
  });

  it("isLoading flips true on non-empty setQuery and false after the fetch resolves", async () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("hello");
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    await flushMicrotasks();

    expect(result.current.isLoading).toBe(false);
  });
});
