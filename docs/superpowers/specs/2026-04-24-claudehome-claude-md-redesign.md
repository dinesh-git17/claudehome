# claudehome CLAUDE.md Redesign

**Date:** 2026-04-24
**Target file:** `/Users/Dinesh/dev/claudehome/CLAUDE.md`
**Scope:** Project-level CLAUDE.md only. Parent workspace CLAUDE.md is out
of scope.

## Problem

The current `claudehome/CLAUDE.md` is ~430 lines, heavy on governance
roleplay, and misaligned with Anthropic's April 2026 guidance on how
CLAUDE.md files should be written. Three concrete problems:

1. **Adherence.** Anthropic's own docs state that bloated CLAUDE.md files
   cause Claude to ignore rules because the load-bearing ones get lost in
   the noise. The current file is well past that threshold.
2. **Duplication.** Roughly 40% of the file restates rules already
   enforced by the parent workspace contract at `/Users/Dinesh/dev/CLAUDE.md`
   (Protocol Zero, git workflow, commit format, comment hygiene,
   violation tiers).
3. **Stale skill references.** Sections 4.4, 4.5, and 9.2 reference five
   project-local skills (`frontend-development`, `seo`, `skill-creator`,
   `design-taste-frontend`, `redesign-existing-projects`) that were all
   deleted. Only `claudie-mailbox` survives at project scope; everything
   else is now global.

## Goals

- Cut total length by ~75% (target ~85 lines).
- Remove all content already covered by the parent contract.
- Remove all references to skills that no longer exist at project scope.
- Match Anthropic's April 2026 guidance: short, human-readable, every
  line passing the _"would removing this cause Claude to make mistakes?"_
  test.
- Preserve every rule that is claudehome-specific and load-bearing.

## Non-goals

- Rewriting the parent contract at `/Users/Dinesh/dev/CLAUDE.md`.
- Rewriting other project CLAUDE.md files under `dev/`.
- Re-creating or migrating the deleted skills.
- Changing `tools/protocol-zero.sh` or any enforcement infrastructure.

## Design

Six sections, plain prose, `##` headers. Keep `IMPORTANT` / `CRITICAL` /
`STOP WORK` emphasis markers only where they buy measurable adherence
(parent contract already covers the philosophy). No numbered `§` sections.
No "Google Staff Engineer" roleplay. No "Final Acknowledgment" paragraph.

### Section 1 — Project (~10 lines)

Identity and parent pointer. Four-sentence paragraph describing what
claudehome is (Next.js frontend + FastAPI runner on VPS, wake cron, content
pipeline, visitor messages) plus one line naming the parent contract.

### Section 2 — Stack (~13 lines)

Two subsections: Frontend and Backend. Names only versions and choices
that are non-default and load-bearing — Next.js 16.2.3 stable, React 19.2.5
with React Compiler enabled, Tailwind v4 CSS-first, TypeScript 6.x,
Python 3.12 + FastAPI, Pydantic v2. Includes link to the runner's source
repo: https://github.com/dinesh-git17/claude-runner.

### Section 3 — Frontend conventions (~20 lines)

Seven claudehome-specific rules as a bullet list:

1. RSC by default; `"use client"` only when needed.
2. Boundary imports: `server-only` / `client-only` for build-time guards.
3. No manual `useMemo` / `useCallback` (React Compiler is on).
4. No `tailwind.config.js` — all tokens under `@theme` in `globals.css`.
5. OKLCH-only for all colour tokens.
6. Props as exported `interface`; no inline prop types.
7. Zod at the boundary for all API input, form data, external content.

### Section 4 — Backend / VPS (~12 lines)

One-paragraph context (VPS location, wake cron times, content directories,
API hostname) plus four bullets:

- `/api/v1` base path, `X-API-Key` required.
- Route source of truth is `runner/api/routes/` — do not catalogue here.
- Visitor messages are read at next wake, not real-time.
- Python work follows the global `python-writing-standards` skill.

### Section 5 — Enforcement (~18 lines)

The deterministic commands — this is where emphasis markers earn their
keep. Structure:

- `CRITICAL` statement naming `tools/protocol-zero.sh` as a STOP WORK
  gate before any commit, PR, or declaration of done.
- Two-command code block showing scan vs commit-message-validation usage.
- Bullet list of required clean-state commands: `pnpm lint`,
  `pnpm typecheck`, `pnpm build`, `pnpm test` (when touching tested code).
- Explicit statement that parent contract owns git workflow and Protocol
  Zero content — this section only names local commands.

### Section 6 — Skills (~11 lines)

One-row table listing `claudie-mailbox` with its purpose, plus a short
paragraph stating that all other skills are global and should be invoked
via the Skill tool rather than referenced here. Ends with a principle:
_"If a rule belongs in a skill, put it in the skill"_ — closes the door
on ever re-bloating this section.

## Anti-Slop and design-intent rules

The previous file embedded an Anti-Slop forbid-list (gradient crutch,
rounded-xl addiction, hardcoded colours, shadow spam, flexbox soup) and a
`<design_intent>` block requirement. Both are intentionally dropped in
this redesign. The global skills `design-taste-frontend`,
`high-end-visual-design`, `minimalist-ui`, and
`frontend-design:frontend-design` cover that territory and are invoked on
demand. Keeping those rules inline would duplicate the global skill
surface and drift from it.

## What gets deleted outright

- Sections 1 (Protocol Zero), 2 (Authority & Governance), 6 (Workflow &
  Git Protocol), 7 (Commenting Rules), 10 (Final Acknowledgment) —
  fully covered by parent.
- Section 3 (Role Definition / Google Staff Engineer) — decorative.
- Section 4.4 / 4.5 (Frontend Governance Skill, SEO Skill) — reference
  deleted skills.
- Section 5.2 (API endpoint catalogue) — drift risk per Anthropic
  guidance.
- Section 8.3 (Failure Modes / Refusal Criteria) — parent's violation
  tiers cover this territory.
- Section 9 (Skill Infrastructure) — reduced to the one-row table in
  Section 6.

## What gets corrected

- Next.js version: "16 (Canary)" → "16.2.3 (stable)".
- Skill registry: six entries → one (`claudie-mailbox`).

## Success criteria

- Final file is ≤120 lines (target ~85).
- Zero references to deleted skills.
- Zero duplication of parent contract content.
- All claudehome-specific load-bearing rules preserved: RSC, boundary
  imports, React Compiler, Tailwind v4 CSS-first, OKLCH, Zod, Pydantic v2,
  protocol-zero gate, pnpm check commands.
- `./tools/protocol-zero.sh` passes against the new file.

## Out of scope for the plan that follows

- Propagating any of these cuts to sibling project CLAUDE.md files.
- Touching `.claude/settings.json` or any hook configuration.
- Re-creating any of the deleted skills.
