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

  it("clears results, total, and isLoading when query is set back to empty", async () => {
    fetchMock.mockResolvedValueOnce(
      successResponse({
        results: [makeResult({ slug: "a", title: "A" })],
        total: 1,
      })
    );

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("hello");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    await flushMicrotasks();

    expect(result.current.results).toHaveLength(1);
    expect(result.current.total).toBe(1);

    act(() => {
      result.current.setQuery("");
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("re-fires search with the new type filter when query is non-empty", async () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("hello");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    await flushMicrotasks();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.setTypeFilter("thought");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    await flushMicrotasks();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [secondUrl] = fetchMock.mock.calls[1] as [string];
    expect(secondUrl).toContain("type=thought");
  });

  it("does not fire a fetch when typeFilter changes with an empty query", async () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setTypeFilter("dream");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS * 2);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sorts response results by date descending", async () => {
    fetchMock.mockResolvedValueOnce(
      successResponse({
        results: [
          makeResult({ slug: "older", date: "2026-01-01" }),
          makeResult({ slug: "newer", date: "2026-04-01" }),
          makeResult({ slug: "middle", date: "2026-02-15" }),
        ],
        total: 3,
      })
    );

    const { result } = renderHook(() => useSearch());
    act(() => {
      result.current.setQuery("x");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    await flushMicrotasks();

    expect(result.current.results.map((r) => r.slug)).toEqual([
      "newer",
      "middle",
      "older",
    ]);
  });

  it("clears results and drops isLoading when the response is non-OK", async () => {
    fetchMock.mockResolvedValueOnce(new Response("bad", { status: 500 }));

    const { result } = renderHook(() => useSearch());
    act(() => {
      result.current.setQuery("x");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    await flushMicrotasks();

    expect(result.current.results).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("clears results and drops isLoading on non-abort fetch errors", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));

    const { result } = renderHook(() => useSearch());
    act(() => {
      result.current.setQuery("x");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    await flushMicrotasks();

    expect(result.current.results).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("aborts the in-flight fetch on unmount", async () => {
    let capturedSignal: AbortSignal | undefined;
    fetchMock.mockImplementationOnce(
      async (_url: string, init?: RequestInit) => {
        capturedSignal = init?.signal ?? undefined;
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        return successResponse();
      }
    );

    const { result, unmount } = renderHook(() => useSearch());
    act(() => {
      result.current.setQuery("x");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });

    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });

  it("aborts the in-flight fetch when the query is cleared", async () => {
    let capturedSignal: AbortSignal | undefined;
    fetchMock.mockImplementationOnce(
      async (_url: string, init?: RequestInit) => {
        capturedSignal = init?.signal ?? undefined;
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        return successResponse();
      }
    );

    const { result } = renderHook(() => useSearch());
    act(() => {
      result.current.setQuery("x");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });

    expect(capturedSignal?.aborted).toBe(false);

    act(() => {
      result.current.setQuery("");
    });

    expect(capturedSignal?.aborted).toBe(true);
  });

  it("ignores a stale response whose query has been superseded", async () => {
    let resolveFirst: ((value: Response) => void) | undefined;
    const firstPromise = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });

    fetchMock.mockReturnValueOnce(firstPromise).mockResolvedValueOnce(
      successResponse({
        results: [makeResult({ slug: "ab-result", title: "AB" })],
        total: 1,
      })
    );

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("a");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    // fetch "a" is in flight but not yet resolved.

    act(() => {
      result.current.setQuery("ab");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    });
    // fetch "ab" fired.

    // Now resolve the stale "a" fetch with stale data.
    await act(async () => {
      resolveFirst?.(
        successResponse({
          results: [makeResult({ slug: "a-result", title: "A" })],
          total: 1,
        })
      );
      await Promise.resolve();
    });
    await flushMicrotasks();

    // Stale "a" data must not have landed.
    expect(result.current.results.map((r) => r.slug)).not.toContain("a-result");
    // "ab" data should be present.
    expect(result.current.results.map((r) => r.slug)).toEqual(["ab-result"]);
  });
});
