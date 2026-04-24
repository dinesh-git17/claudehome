---
status: draft
date: 2026-04-24
owner: Dinesh
related_pr: https://github.com/dinesh-git17/claudehome/pull/186
---

# useSearch refactor — remove synchronous setState from effect

## Context

Dependabot PR [#186](https://github.com/dinesh-git17/claudehome/pull/186) bumps
`eslint-config-next` from 16.2.3 to 16.2.4 (bundled with `prettier` and
`prettier-plugin-tailwindcss`). The 16.2.4 ruleset enables a rule that flags
synchronous `setState` calls inside `useEffect` bodies as cascading-render
hazards. Lint fails on `apps/web/src/lib/hooks/useSearch.ts:112`.

The flagged code is structurally a React anti-pattern: the empty-query reset
branch of the debounce effect writes three pieces of state synchronously,
forcing a second render before the first has committed. The rule is correct.
Fixing it unblocks PR #186 and every future `eslint-config-next` bump.

Line 118 (`setIsLoading(true)`) is not flagged today but is the same class of
pattern (single sync `setState` in an effect). The refactor removes it too, so
we do not discover a new lint failure on the next bump.

## Goals

- Eliminate all synchronous `setState` calls inside `useEffect` bodies in
  `useSearch.ts`.
- Preserve the full public contract of `useSearch` (`UseSearchReturn`) — no
  caller changes.
- Preserve all current behaviour: debounce, abort, sort, type filter, empty
  reset, unmount cleanup.
- Add test coverage for the hook's public contract (none exists today).
- Fix the pre-existing race condition where a superseded request's response
  overwrites current results.

## Non-goals

- No change to search API, backend, or network shape.
- No change to any component that consumes `useSearch`.
- No broader ESLint config changes, rule disables, or Dependabot group
  restructuring. Option B and Option C from the blocker report are rejected.
- No rewrite of the hook as `useReducer`. Incremental refactor only.

## Design

### Public contract (unchanged)

```typescript
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
```

### Internal state

`useState`:

- `query` — current input value.
- `typeFilter` — one of `"all"`, `"thought"`, `"dream"`.
- `results` — last-resolved result set.
- `total` — last-resolved total count.
- `activeIndex` — keyboard nav cursor (unchanged).
- `lastResolvedKey` — the `query + typeFilter` key of the most recently
  settled fetch, or `""` when nothing has been requested. Used with the
  derivation below to compute `isLoading`.

`useRef`:

- `abortController` — in-flight fetch aborter (unchanged role).
- `debounceTimer` — pending debounce timeout handle (unchanged role).
- `currentKey` — live `query + typeFilter`, updated at the top of the
  debounce effect. Read by `executeSearch` to skip writes from superseded
  requests.

`isLoading` state is **removed** (becomes derived).

The "key" string format used throughout is `` `${query}|${typeFilter}` ``.

### Derived value

```typescript
const currentKey = `${query}|${typeFilter}`;
const isLoading = query.trim() !== "" && lastResolvedKey !== currentKey;
```

`isLoading` is `true` from the instant a non-empty query is set until the
matching fetch resolves (success, failure, or non-OK response). The derivation
is cheap — two string operations per render.

### Wrapped `setQuery`

```text
setQuery(value):
  if value.trim() === "":
    abortController.current?.abort()
    clearTimeout(debounceTimer.current)
    setQueryState("")
    setResults([])
    setTotal(0)
    setLastResolvedKey("")
  else:
    setQueryState(value)
```

The empty-query reset runs in the event handler path (keystroke → setter call),
not in an effect. Aborting here is new behaviour that fixes a pre-existing
bug: clearing the input while a fetch is in flight previously let the stale
response overwrite the just-cleared results.

### `setTypeFilter` — unchanged

No wrapper needed. If `query` is empty, the effect short-circuits. If
non-empty, the effect schedules a new debounced fetch using the updated
filter.

### Debounce effect

Deps: `[query, typeFilter, executeSearch]`.

```text
useEffect:
  clearTimeout(debounceTimer.current)
  if query.trim() === "":
    return
  debounceTimer.current = setTimeout(
    () => executeSearch(query, typeFilter),
    DEBOUNCE_MS,
  )
  cleanup: clearTimeout(debounceTimer.current)
```

Zero synchronous `setState` calls. The new lint rule is satisfied.

### `executeSearch`

Signature unchanged: `(searchQuery, searchType) => Promise<void>`.

Changes:

- Remove the empty-query guard at the top — the effect guarantees a non-empty
  query.
- Remove both `setIsLoading` calls.
- Compute `const key = \`${searchQuery}|${searchType}\`` at entry.
- On every terminal outcome (success, non-OK, non-abort error), first check
  `currentKey.current === key`:
  - **Match:** apply `setResults` / `setTotal` / `setActiveIndex` as
    appropriate for the outcome, then `setLastResolvedKey(key)`.
  - **Mismatch (superseded):** skip all writes, including `lastResolvedKey`.
    The request that matches the current key will mark completion when it
    settles. This avoids out-of-order responses flipping `isLoading` back to
    true after a newer response has already landed.
- On `AbortError`: no writes, no `lastResolvedKey` advance. Identical to the
  mismatch path.

`currentKeyRef.current` is assigned at the top of the debounce `useEffect`
body (not during render). The target ESLint ruleset (`eslint-config-next`
16.2.4) enables `react-hooks/refs`, which forbids ref writes during render
even when the value derives from state, so the render-time form is out.
Assigning inside the debounce effect is semantically equivalent for this
usage: `executeSearch` only reads the ref from inside timer callbacks that
this same effect schedules, and those callbacks always run after the effect
has completed. Writing a ref inside a `useEffect` does not trip the "no
setState in effect" rule because refs are not state.

### Unmount cleanup effect — unchanged

```text
useEffect(() => () => {
  abortController.current?.abort()
  clearTimeout(debounceTimer.current)
}, [])
```

## Behavioural preservation

Every scenario below was validated against the current code and the proposed
design before writing this spec.

| Scenario                                                                 | Current      | Proposed      |
| ------------------------------------------------------------------------ | ------------ | ------------- |
| Type `"hello"`, wait → one fetch fires                                   | Yes          | Yes           |
| Type `"hello"` then `"help"` within 300 ms → one fetch for `"help"`      | Yes          | Yes           |
| `isLoading` true while query non-empty and no matching response resolved | Yes          | Yes (derived) |
| Clear query to `""` → `results`/`total` clear, `isLoading` false         | Yes          | Yes           |
| Clear query while fetch in flight → stale response never lands           | **No (bug)** | Yes (fix)     |
| Change `typeFilter` with non-empty query → re-fires search               | Yes          | Yes           |
| Change `typeFilter` with empty query → no fetch                          | Yes          | Yes           |
| Results sorted by `date` descending                                      | Yes          | Yes           |
| Non-OK response → clears results                                         | Yes          | Yes           |
| Network error (non-abort) → clears results                               | Yes          | Yes           |
| Unmount cancels in-flight fetch and pending debounce                     | Yes          | Yes           |
| Superseded request response → does not overwrite current results         | **No (bug)** | Yes (fix)     |

## Testing

New file: `apps/web/src/lib/hooks/useSearch.test.ts`. Vitest with fake timers;
`fetch` mocked via `vi.fn()`. Use `@testing-library/react`'s `renderHook` and
`act`. No MSW, no real network.

Test cases:

1. Initial state: `results=[]`, `total=0`, `isLoading=false`.
2. `setQuery("x")` fires one fetch after 300 ms.
3. Three rapid `setQuery` calls within 300 ms → exactly one fetch, for the
   last value.
4. `isLoading` is `true` on the render immediately following a non-empty
   `setQuery`, and `false` after the fetch resolves.
5. `setQuery("")` after populated state clears `results`, `total`, and
   `isLoading`.
6. `setQuery("")` while a fetch is in flight aborts the controller.
7. `setTypeFilter` with non-empty query re-fires search with the new filter.
8. `setTypeFilter` with empty query does not fire a fetch.
9. Response results are sorted by `date` descending.
10. Non-OK response clears `results` and drops `isLoading` to false.
11. Thrown non-abort error clears `results` and drops `isLoading` to false.
12. Race — fetch A for `"a"` resolves after query has advanced to `"ab"`:
    A's results never appear, and `lastResolvedKey` is not advanced by A.
    When fetch B for `"ab"` resolves, its results appear and `isLoading`
    drops to false.
13. Unmount aborts the in-flight fetch.

The public contract is the target. No tests against internal ref values or
exact render counts.

## Rollout

1. Branch `fix/use-search-sync-setstate` off `main`.
2. Implement the refactor and the test file.
3. Verify locally: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`,
   `./tools/protocol-zero.sh`.
4. Open PR. Confirm CI green.
5. Merge after explicit approval.
6. Rebase PR #186 on the new `main`. Lint now passes. Merge #186.

## Open questions

None blocking. One observation worth tracking:

- The new rule may flag other files in the codebase once `eslint-config-next`
  16.2.4 is in place. Step 3 of rollout (`pnpm lint`) will surface any
  additional hits. Handle them in-scope if trivial, otherwise open follow-up
  issues.
