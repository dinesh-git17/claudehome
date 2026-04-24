# useSearch Sync-setState Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `useSearch` to eliminate synchronous `setState` calls inside `useEffect` (unblocking PR #186's `eslint-config-next` 16.2.4 bump), fix two pre-existing bugs (superseded-response overwrite and stale-response-after-clear), and establish the hook's first test coverage.

**Architecture:** Replace `isLoading` state with a value derived from `query` and `lastResolvedKey`. Move the empty-query reset from the debounce effect into a wrapped `setQuery`. Add a `currentKey` ref updated during render, read by `executeSearch` to skip writes from superseded responses. The effect's only job becomes scheduling debounced `executeSearch` calls.

**Tech Stack:** Next.js 16.2.x, React 19.2.5 (React Compiler on), TypeScript, Vitest 4.1.x. New dev deps: `@testing-library/react` + `jsdom`.

**Spec:** `/Users/Dinesh/dev/claudehome/docs/superpowers/specs/2026-04-24-useSearch-sync-setstate-refactor-design.md`

**PR this unblocks:** `dinesh-git17/claudehome#186` — rebase it after the fix lands on `main`.

---

## Preconditions

- `git status` is clean on `main`.
- `./tools/protocol-zero.sh` passes.
- `pnpm install` has been run and `pnpm test` (server tests) is green at head.

## Ordering logic

The refactor is split so each commit is independently verifiable:

1. Install test infrastructure.
2. Write contract tests against the **current** implementation for all behaviour that is already correct. Every test passes when added.
3. Bug fix 1 (abort on empty) — red/green cycle: one failing test, one minimal source change.
4. Bug fix 2 (superseded-response race) — red/green cycle: one failing test, one minimal source change.
5. Lint-rule refactor — restructure state to move `setState` calls out of the effect. All existing tests remain green; no new behaviour.
6. Verify against `eslint-config-next` 16.2.4, then revert the version bump (left for PR #186 to land).

---

## Task 1: Create feature branch

**Files:** none (git only).

- [ ] **Step 1: Create and switch to branch**

```bash
git -C /Users/Dinesh/dev/claudehome checkout -b fix/use-search-sync-setstate
```

- [ ] **Step 2: Verify**

```bash
git -C /Users/Dinesh/dev/claudehome branch --show-current
```

Expected: `fix/use-search-sync-setstate`

---

## Task 2: Install React-hook test infrastructure

The repo has no React test environment. Add `@testing-library/react` and `jsdom`. Existing server tests stay on the default `node` environment — the new hook test opts into `jsdom` via a file-level pragma.

**Files:**

- Modify: `/Users/Dinesh/dev/claudehome/apps/web/package.json`
- Modify: `/Users/Dinesh/dev/claudehome/pnpm-lock.yaml`

- [ ] **Step 1: Install dev dependencies**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm add -D @testing-library/react@^16 jsdom@^26
```

- [ ] **Step 2: Verify `package.json` diff**

```bash
git -C /Users/Dinesh/dev/claudehome diff apps/web/package.json
```

Expected: `@testing-library/react` and `jsdom` appear under `devDependencies`.

- [ ] **Step 3: Confirm existing server tests still pass**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test
```

Expected: all existing tests pass. They run on the default `node` environment and are unaffected.

- [ ] **Step 4: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/package.json pnpm-lock.yaml
git -C /Users/Dinesh/dev/claudehome commit -m "chore(web): add @testing-library/react and jsdom for hook tests"
```

---

## Task 3: Scaffold `useSearch` test file with initial-state test

**Files:**

- Create: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.test.ts`

- [ ] **Step 1: Write the scaffolding and first test**

Create `apps/web/src/lib/hooks/useSearch.test.ts`:

```typescript
// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSearch, type SearchResponse, type SearchResult } from "./useSearch";

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
```

- [ ] **Step 2: Run the test**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 1 passed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/src/lib/hooks/useSearch.test.ts
git -C /Users/Dinesh/dev/claudehome commit -m "test(web): scaffold useSearch hook tests with jsdom environment"
```

---

## Task 4: Contract tests — debounce and loading transitions

Tests 2, 3, 4 from the spec. All should pass against the current implementation.

**Files:**

- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.test.ts`

- [ ] **Step 1: Append three tests inside the existing `describe` block**

Add before the closing `});` of the `describe` block:

```typescript
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
```

- [ ] **Step 2: Run**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 4 passed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/src/lib/hooks/useSearch.test.ts
git -C /Users/Dinesh/dev/claudehome commit -m "test(web): cover useSearch debounce and loading transitions"
```

---

## Task 5: Contract tests — empty reset and typeFilter

Tests 5, 7, 8. All should pass against the current implementation.

**Files:**

- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.test.ts`

- [ ] **Step 1: Append three tests inside the existing `describe` block**

```typescript
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
```

- [ ] **Step 2: Run**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 7 passed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/src/lib/hooks/useSearch.test.ts
git -C /Users/Dinesh/dev/claudehome commit -m "test(web): cover useSearch empty reset and type filter behaviour"
```

---

## Task 6: Contract tests — response handling and unmount

Tests 9, 10, 11, 13. All should pass against the current implementation.

**Files:**

- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.test.ts`

- [ ] **Step 1: Append four tests inside the existing `describe` block**

```typescript
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
  fetchMock.mockImplementationOnce(async (_url: string, init?: RequestInit) => {
    capturedSignal = init?.signal ?? undefined;
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    return successResponse();
  });

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
```

- [ ] **Step 2: Run**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 11 passed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/src/lib/hooks/useSearch.test.ts
git -C /Users/Dinesh/dev/claudehome commit -m "test(web): cover useSearch response handling and unmount"
```

---

## Task 7: Bug fix 1 — abort in-flight fetch when query is cleared

Red/green cycle. The current effect's empty-query branch clears state but does not abort the in-flight fetch, so a stale response can overwrite the just-cleared results.

**Files:**

- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.test.ts` (add red test)
- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.ts` (minimal fix)

- [ ] **Step 1: Add the failing test**

Append to the `describe` block:

```typescript
it("aborts the in-flight fetch when the query is cleared", async () => {
  let capturedSignal: AbortSignal | undefined;
  fetchMock.mockImplementationOnce(async (_url: string, init?: RequestInit) => {
    capturedSignal = init?.signal ?? undefined;
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    return successResponse();
  });

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
```

- [ ] **Step 2: Run — expect the new test to FAIL**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 11 passed, 1 failed — the new test.

- [ ] **Step 3: Apply the minimal fix**

Edit `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.ts`. In the debounce effect (currently lines 106-129), inside the empty-query branch, add `abortControllerRef.current?.abort();` before the state resets:

```typescript
useEffect(() => {
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }

  if (query.trim().length === 0) {
    abortControllerRef.current?.abort();
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
```

Only one line changes in this task. Full-file restructure happens in Task 9.

- [ ] **Step 4: Run — expect all tests to pass**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 12 passed.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/src/lib/hooks/useSearch.ts apps/web/src/lib/hooks/useSearch.test.ts
git -C /Users/Dinesh/dev/claudehome commit -m "fix(web): abort in-flight useSearch fetch when query is cleared"
```

---

## Task 8: Bug fix 2 — skip writes from superseded responses

Red/green cycle. If fetch A resolves after the query has changed to `"ab"`, fetch A currently writes its results and total, causing a flash of stale data before fetch B lands.

**Files:**

- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.test.ts` (add red test)
- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.ts` (add `currentKey` ref + guard)

- [ ] **Step 1: Add the failing test**

Append to the `describe` block:

```typescript
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
```

- [ ] **Step 2: Run — expect the new test to FAIL**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 12 passed, 1 failed — the new test.

- [ ] **Step 3: Apply the minimal fix**

Edit `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.ts`:

1. Add a `currentKey` ref near the other refs:

```typescript
const abortControllerRef = useRef<AbortController | null>(null);
const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const currentKeyRef = useRef<string>("");
```

2. Assign the current key during render (add directly after the `useState` declarations, before any hooks that read it):

```typescript
currentKeyRef.current = `${query}|${typeFilter}`;
```

3. Guard the response writes in `executeSearch`. Replace the `try`/`catch`/`finally` block with:

```typescript
try {
  const params = new URLSearchParams({ q: searchQuery });
  if (searchType !== "all") {
    params.set("type", searchType);
  }

  const response = await fetch(`/api/search?${params.toString()}`, {
    signal: controller.signal,
  });

  const requestKey = `${searchQuery}|${searchType}`;
  const isCurrent = currentKeyRef.current === requestKey;

  if (!response.ok) {
    if (isCurrent) {
      setResults([]);
      setTotal(0);
    }
    return;
  }

  const data = (await response.json()) as SearchResponse;
  if (!isCurrent) {
    return;
  }
  const sorted = [...data.results].sort((a, b) => b.date.localeCompare(a.date));
  setResults(sorted);
  setTotal(data.total);
  setActiveIndex(0);
} catch (error) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return;
  }
  if (currentKeyRef.current === `${searchQuery}|${searchType}`) {
    setResults([]);
    setTotal(0);
  }
} finally {
  if (!controller.signal.aborted) {
    setIsLoading(false);
  }
}
```

- [ ] **Step 4: Run — expect all tests to pass**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 13 passed.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/src/lib/hooks/useSearch.ts apps/web/src/lib/hooks/useSearch.test.ts
git -C /Users/Dinesh/dev/claudehome commit -m "fix(web): ignore superseded useSearch responses using currentKey ref"
```

---

## Task 9: Lint-rule refactor — remove synchronous setState from the effect

No behaviour change. All 13 tests remain green. This task removes the actual ESLint violation by moving state transitions out of the effect body.

**Files:**

- Modify: `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.ts`

- [ ] **Step 1: Replace the entire hook body**

Replace the full contents of `/Users/Dinesh/dev/claudehome/apps/web/src/lib/hooks/useSearch.ts` with:

```typescript
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

  currentKeyRef.current = keyOf(query, typeFilter);

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
```

Key changes vs. previous state of the file:

- `isLoading` state is removed; derived from `query` + `lastResolvedKey`.
- `lastResolvedKey` state is added.
- `setQuery` is a wrapped callback that handles empty-query reset in the event handler path.
- The debounce `useEffect` contains only timer scheduling and the `query`-empty short-circuit; no `setState` calls.
- `executeSearch` no longer calls `setIsLoading` and advances `lastResolvedKey` instead. The empty-query guard at the top of `executeSearch` is removed — the effect guarantees it is never called with an empty query.
- Out-of-order response guard: superseded responses skip all writes, including `lastResolvedKey`. Only the matching key advances `lastResolvedKey`.

- [ ] **Step 2: Run the hook tests**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test useSearch
```

Expected: 13 passed.

- [ ] **Step 3: Run the full test suite**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test
```

Expected: all tests pass — the refactor does not change any consumer contract.

- [ ] **Step 4: Commit**

```bash
git -C /Users/Dinesh/dev/claudehome add apps/web/src/lib/hooks/useSearch.ts
git -C /Users/Dinesh/dev/claudehome commit -m "refactor(web): move useSearch state transitions out of useEffect"
```

---

## Task 10: Quality gates

**Files:** none.

- [ ] **Step 1: Lint**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm lint
```

Expected: no errors.

- [ ] **Step 2: Typecheck**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Build**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm build
```

Expected: build succeeds.

- [ ] **Step 4: Full test suite**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Protocol Zero scan**

```bash
cd /Users/Dinesh/dev/claudehome && ./tools/protocol-zero.sh
```

Expected: PASS.

If any check fails, stop, diagnose, and fix the underlying issue before proceeding. Do not skip hooks or bypass checks.

---

## Task 11: Verify against `eslint-config-next` 16.2.4 (and revert)

Sanity-check that our refactor actually satisfies the new rule shipped in PR #186, without landing the dependency bump here (PR #186 owns that diff).

**Files:**

- Temporarily modify (then revert): `/Users/Dinesh/dev/claudehome/apps/web/package.json`, `/Users/Dinesh/dev/claudehome/pnpm-lock.yaml`

- [ ] **Step 1: Temporarily upgrade**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm add -D eslint-config-next@16.2.4
```

- [ ] **Step 2: Lint against the new rule**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm lint
```

Expected: no errors in `useSearch.ts`. If the rule flags anywhere else in the codebase, note the paths — out of scope for this PR but worth a follow-up issue.

- [ ] **Step 3: Revert the dependency changes**

```bash
git -C /Users/Dinesh/dev/claudehome checkout -- apps/web/package.json pnpm-lock.yaml
cd /Users/Dinesh/dev/claudehome && pnpm install
```

- [ ] **Step 4: Confirm reverted**

```bash
git -C /Users/Dinesh/dev/claudehome diff apps/web/package.json pnpm-lock.yaml
```

Expected: no diff.

- [ ] **Step 5: Re-run quality gates (paranoia)**

```bash
cd /Users/Dinesh/dev/claudehome/apps/web && pnpm lint && pnpm test
```

Expected: clean.

No commit for this task — the verification is a transient experiment and the working tree is restored to its post-Task-10 state.

---

## Task 12: Ready-for-review handoff

Do not open the PR without Dinesh's explicit permission. Parent `CLAUDE.md` rule.

- [ ] **Step 1: Produce a PR summary for Dinesh to review**

Draft a PR title and body. Save to `/tmp/pr-summary.md` for Dinesh's review:

````text
Title: fix(web): remove synchronous setState from useSearch effect

Body:

## Summary

- Unblocks Dependabot PR #186 (`eslint-config-next` 16.2.4 bump) by
  eliminating synchronous `setState` calls inside `useSearch`'s
  debounce effect.
- Adds the first test coverage for the hook (13 cases, Vitest + jsdom).
- Fixes two pre-existing bugs: stale response overwriting cleared
  results, and superseded-response overwriting current results.

## What changed

- `apps/web/src/lib/hooks/useSearch.ts` — hook rewritten per
  `docs/superpowers/specs/2026-04-24-useSearch-sync-setstate-refactor-design.md`.
  Public contract unchanged.
- `apps/web/src/lib/hooks/useSearch.test.ts` — new. Covers the hook's
  public contract only; no implementation assertions.
- `apps/web/package.json`, `pnpm-lock.yaml` — add
  `@testing-library/react` and `jsdom` as dev dependencies.

## How to test

```bash
cd apps/web
pnpm test useSearch
pnpm lint
pnpm typecheck
pnpm build
````

All should be clean. `./tools/protocol-zero.sh` from the repo root also passes.

## Follow-up

After merge, rebase PR #186 on `main`. The `eslint-config-next`
16.2.4 lint failure on `useSearch.ts:112` no longer reproduces.

````

- [ ] **Step 2: Surface the summary to Dinesh and wait for explicit approval before pushing or opening the PR**

Do not run `git push`, `gh pr create`, or any remote operation until Dinesh approves.

---

## Rebase of PR #186 (post-merge, out of scope for this plan)

Once this PR lands on `main`:

```bash
gh pr checkout 186
git rebase main
# resolve any trivial conflicts in lockfiles
git push --force-with-lease
````

Confirm the Lint job passes on the rebased #186, then merge.
