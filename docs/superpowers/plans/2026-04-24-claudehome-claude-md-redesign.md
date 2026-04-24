# claudehome CLAUDE.md Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/Users/Dinesh/dev/claudehome/CLAUDE.md` with a lean, April-2026-compliant rewrite that cuts length by ~75%, removes all content already enforced by the parent workspace contract, and drops references to five deleted project skills.

**Architecture:** Single-file atomic rewrite. The spec at `docs/superpowers/specs/2026-04-24-claudehome-claude-md-redesign.md` locks every design decision (six sections, ~85 lines, `IMPORTANT`/`CRITICAL` emphasis only, no roleplay, no endpoint catalogue). No code changes. No hook changes. No skill changes.

**Tech Stack:** Markdown. Bash for validation. Git for commit.

---

## File Structure

**Files touched:**

- Modify: `/Users/Dinesh/dev/claudehome/CLAUDE.md` — full rewrite, 378 lines → ~82 lines.

**Files NOT touched:**

- `/Users/Dinesh/dev/CLAUDE.md` (parent contract, out of scope)
- `tools/protocol-zero.sh` (enforcement script, referenced but untouched)
- `.claude/settings.json` (hook config, out of scope)
- `.claude/skills/claudie-mailbox/` (surviving project skill, out of scope)
- Any other project CLAUDE.md under `/Users/Dinesh/dev/` (out of scope)

---

## Task 1: Baseline verification

Confirm working tree is clean of unrelated changes and the current CLAUDE.md matches the spec's starting assumptions. Avoids overwriting any in-flight work.

**Files:**

- Read-only: `/Users/Dinesh/dev/claudehome/CLAUDE.md`
- Read-only: git working tree

- [ ] **Step 1: Confirm current file size matches spec baseline**

Run: `wc -l /Users/Dinesh/dev/claudehome/CLAUDE.md`
Expected: `378 /Users/Dinesh/dev/claudehome/CLAUDE.md`. If different, stop and surface — the spec was written against 378 lines.

- [ ] **Step 2: Confirm no uncommitted changes to CLAUDE.md**

Run: `git -C /Users/Dinesh/dev/claudehome status --porcelain CLAUDE.md`
Expected: empty output. If the file has uncommitted changes, stop and ask Dinesh before overwriting.

- [ ] **Step 3: Confirm only `claudie-mailbox` exists at project scope**

Run: `ls /Users/Dinesh/dev/claudehome/.claude/skills/`
Expected: `claudie-mailbox` and nothing else. If other skills reappeared, stop and surface — the spec assumes all other project skills are deleted.

- [ ] **Step 4: Confirm `tools/protocol-zero.sh` still exists**

Run: `test -x /Users/Dinesh/dev/claudehome/tools/protocol-zero.sh && echo OK`
Expected: `OK`. Section 5 of the new file references this script; abort if missing.

---

## Task 2: Write the new CLAUDE.md

Atomic replacement. The spec already approved the exact content, section by section. Do not deviate — every line below has been brainstormed and signed off.

**Files:**

- Modify (overwrite): `/Users/Dinesh/dev/claudehome/CLAUDE.md`

- [ ] **Step 1: Overwrite the file with the exact content below**

The verbatim content lives in a companion file: `docs/superpowers/plans/2026-04-24-claudehome-claude-md-redesign.content.md`. It starts with `# claudehome` on line 1 and is ~82 lines long. Copy it byte-for-byte as the new `CLAUDE.md`.

Run:

```bash
cp /Users/Dinesh/dev/claudehome/docs/superpowers/plans/2026-04-24-claudehome-claude-md-redesign.content.md \
   /Users/Dinesh/dev/claudehome/CLAUDE.md
```

Expected: no output. Do not hand-type the file — copy the companion.

- [ ] **Step 2: Verify exact line count**

Run: `wc -l /Users/Dinesh/dev/claudehome/CLAUDE.md`
Expected: 91 lines. Tolerance: 88-95 (accounts for editor-added trailing newlines). If outside that range, diff against the companion file and fix:

```bash
diff /Users/Dinesh/dev/claudehome/CLAUDE.md \
     /Users/Dinesh/dev/claudehome/docs/superpowers/plans/2026-04-24-claudehome-claude-md-redesign.content.md
```

- [ ] **Step 3: Visually verify top-level structure**

Run: `grep -nE '^#{1,2} ' /Users/Dinesh/dev/claudehome/CLAUDE.md`
Expected exact output:

```
1:# claudehome
12:## Stack
27:## Frontend conventions
43:## Backend / VPS
58:## Enforcement
79:## Skills
```

Line numbers may shift by ±1 depending on trailing newlines. The _order_ and _names_ must match exactly — no extra headers, no renames.

---

## Task 3: Content validation

Verify the rewrite meets every success criterion from the spec. Each grep below must return zero lines — any hit is a bug in the new file.

**Files:**

- Read-only: `/Users/Dinesh/dev/claudehome/CLAUDE.md`

- [ ] **Step 1: No references to deleted project skills**

Run: `grep -Ein '(frontend-development|seo-integrity|skill-creator|frontend governance skill|seo & discovery skill)' /Users/Dinesh/dev/claudehome/CLAUDE.md`
Expected: empty output. If any hit appears, delete it — the rule is "no named references to deleted project skills."

Note: plain mentions of `design-taste-frontend` and `redesign-existing-projects` are allowed because those exist as _global_ skills. The forbidden terms are the five skill _paths_ that were deleted and the old "MANDATORY" section wrappers.

- [ ] **Step 2: No duplication of parent Protocol Zero content**

Run: `grep -Ein '(protocol zero: no-ai attribution|zero tolerance policy|output sanitization|forbidden phrases|forbidden artifacts|forbidden metadata)' /Users/Dinesh/dev/claudehome/CLAUDE.md`
Expected: empty output. Parent owns this content; child must not restate it.

- [ ] **Step 3: No duplication of parent git/commit workflow**

Run: `grep -Ein '(conventional commits|branch naming convention|pr workflow steps|no-ai attestation|co-authored-by)' /Users/Dinesh/dev/claudehome/CLAUDE.md`
Expected: empty output.

- [ ] **Step 4: No roleplay or decorative framing**

Run: `grep -Ein '(google staff|simulated|final acknowledgment|under the penalty|highest priority|authority & governance)' /Users/Dinesh/dev/claudehome/CLAUDE.md`
Expected: empty output.

- [ ] **Step 5: No API endpoint catalogue**

Run:

```bash
grep -Ec '^-\s+`(GET|POST|PUT|DELETE|PATCH)\s' /Users/Dinesh/dev/claudehome/CLAUDE.md
```

Expected: `0`. The pattern looks for markdown bullets starting with a backtick-quoted HTTP verb — the previous file's endpoint list format.

- [ ] **Step 6: All load-bearing rules preserved (positive check)**

Run: `for pat in 'React Compiler' 'RSC by default' 'Boundary imports' 'server-only' 'client-only' 'Tailwind v4' 'OKLCH' 'Zod at the boundary' 'exported interfaces' 'protocol-zero.sh' 'pnpm lint' 'pnpm typecheck' 'pnpm build' 'claudie-mailbox' 'python-writing-standards' 'claude-runner'; do grep -qi -- "$pat" /Users/Dinesh/dev/claudehome/CLAUDE.md && echo "OK $pat" || echo "MISS $pat"; done`
Expected: every line starts with `OK`. Any `MISS` means a required rule got lost — fix before proceeding.

- [ ] **Step 7: Run Protocol Zero scanner**

Run: `cd /Users/Dinesh/dev/claudehome && ./tools/protocol-zero.sh`
Expected: exit 0 with `[PASS] Protocol Zero: No attribution artifacts detected.` The scanner excludes `CLAUDE.md` itself, so this verifies the broader codebase is still clean — not the new file directly.

---

## Task 4: Commit

Single commit replacing the old file with the new one. Conventional-commits format, body wrapped at 100 chars for commitlint.

**Files:**

- Stage: `/Users/Dinesh/dev/claudehome/CLAUDE.md`

- [ ] **Step 1: Stage the file**

Run: `git -C /Users/Dinesh/dev/claudehome add CLAUDE.md`
Expected: no output. Husky may run lint-staged on stage; let it finish.

- [ ] **Step 2: Create the commit**

Run:

```bash
git -C /Users/Dinesh/dev/claudehome commit \
  -m "docs(claude-md): rewrite project contract for April 2026 guidance" \
  -m "Cut ~75% of length by removing duplication with parent workspace contract." \
  -m "Drop references to deleted project skills. Defer Python rules to global skill."
```

Expected: commit succeeds, pre-commit and commit-msg hooks pass. If commitlint rejects a body line, re-wrap at ≤100 chars and retry with a NEW commit (parent contract forbids `--amend`).

- [ ] **Step 3: Confirm commit landed**

Run: `git -C /Users/Dinesh/dev/claudehome log -1 --stat`
Expected output includes `CLAUDE.md | ~382 +++-----` (deletions far outweigh insertions) and the commit subject from Step 2.

- [ ] **Step 4: Confirm working tree clean**

Run: `git -C /Users/Dinesh/dev/claudehome status --porcelain`
Expected: empty output.

---

## Success criteria (cross-check against spec)

Before declaring done, verify against the spec's success criteria section:

- [x] Final file ≤120 lines (target ~85) — verified in Task 2 Step 2
- [x] Zero references to deleted skills — verified in Task 3 Step 1
- [x] Zero duplication of parent contract content — verified in Task 3 Steps 2 and 3
- [x] All claudehome-specific load-bearing rules preserved — verified in Task 3 Step 6
- [x] `./tools/protocol-zero.sh` passes — verified in Task 3 Step 7

---

## Rollback

If anything goes wrong after the commit and a full revert is needed:

```bash
git -C /Users/Dinesh/dev/claudehome revert HEAD --no-edit
```

This creates a new commit restoring the prior 378-line file. Do not force-reset `main`.
