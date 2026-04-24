# Claudie Domain Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the frontend from `claudehome.dineshd.dev` to `claudie.dineshd.dev` with a permanent redirect from the old domain, without touching the API host, repo name, package names, or any internal identifiers.

**Architecture:** Phased rollout. CORS in the separate `claude-runner` repo lands first. Vercel adds the new domain as an alias (additive, both domains live). The in-repo PR updates four references to the canonical URL. Vercel then flips the primary domain and the old URL becomes a 308 redirect target.

**Tech Stack:** Next.js 16 (Turbopack), Vercel hosting, FastAPI runner on a VPS (separate `claude-runner` repo), Caddy with CORS middleware.

**Spec:** `docs/superpowers/specs/2026-04-24-claudie-domain-rebrand-design.md`

---

## Pre-flight context

This plan touches three locations:

1. The `claude-runner` repository at `/Users/Dinesh/dev/claude-runner` (separate working directory). One file edit + commit + push.
2. This repository at `/Users/Dinesh/dev/claudehome`. Four file edits in a single commit, then a PR.
3. The Vercel dashboard for the existing project, plus DNS at the registrar that hosts `dineshd.dev`. Manual operations, performed by Dinesh.

The runner deploy on the VPS picks up changes when the runner repo is pushed (existing CD path). The Next.js site deploys on every push to `main` via Vercel's git integration. DNS and Vercel domain configuration are dashboard-driven.

---

## Task 1: Verify local environment

**Files:** None edited.

- [ ] **Step 1: Confirm clean git state in this repo**

Run: `cd /Users/Dinesh/dev/claudehome && git status`
Expected: `On branch main` (or a branch off main), `nothing to commit, working tree clean`. If dirty, stop and resolve before proceeding.

- [ ] **Step 2: Confirm clean git state in claude-runner**

Run: `cd /Users/Dinesh/dev/claude-runner && git status`
Expected: same. If the directory does not exist, clone it: `git clone git@github.com:dinesh-git17/claude-runner.git /Users/Dinesh/dev/claude-runner`.

- [ ] **Step 3: Verify tooling**

Run from `/Users/Dinesh/dev/claudehome`:

```bash
pnpm --version
node --version
./tools/protocol-zero.sh --help 2>&1 | head -5
```

Expected: pnpm 9+, Node 20+, protocol-zero usage line.

---

## Task 2: claude-runner CORS update

**Files:**

- Modify (in `/Users/Dinesh/dev/claude-runner`): the CORS configuration file. Discover the exact path in Step 1.

- [ ] **Step 1: Locate the CORS allowlist**

Run from `/Users/Dinesh/dev/claude-runner`:

```bash
rg -n 'claudehome\.dineshd\.dev' .
```

Expected: one or more lines in a FastAPI middleware setup (commonly `runner/api/main.py` or `runner/api/middleware/cors.py`). Note the file path and the exact structure (list of strings, environment-driven config, etc.).

- [ ] **Step 2: Create a branch**

Run from `/Users/Dinesh/dev/claude-runner`:

```bash
git checkout -b feat/cors-add-claudie-domain
```

- [ ] **Step 3: Add the new origin alongside the existing one**

Edit the file from Step 1. Add `https://claudie.dineshd.dev` to the allowed-origins list. Keep `https://claudehome.dineshd.dev` in the list. Both must be permitted simultaneously.

If the allowlist is a literal Python list, the change looks like:

```python
allow_origins=[
    "https://claudehome.dineshd.dev",
    "https://claudie.dineshd.dev",
],
```

If it is environment-driven (e.g. comma-separated `CORS_ORIGINS` env var), update the production env value via the deploy mechanism the runner uses, not via the source code.

- [ ] **Step 4: Verify the change**

Run from `/Users/Dinesh/dev/claude-runner`:

```bash
rg -n 'claudie\.dineshd\.dev|claudehome\.dineshd\.dev' .
```

Expected: both origins appear in the CORS config. If only one appears, fix before continuing.

- [ ] **Step 5: Commit and push**

Run from `/Users/Dinesh/dev/claude-runner`:

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(cors): allow claudie.dineshd.dev origin

Adds the new frontend domain to the CORS allowlist alongside the
existing claudehome.dineshd.dev entry. Both origins must be permitted
during the rebrand transition; the old origin becomes a redirect target
once the canonical flip happens in Vercel.
EOF
)"
git push -u origin feat/cors-add-claudie-domain
```

- [ ] **Step 6: Open the PR and merge**

Run from `/Users/Dinesh/dev/claude-runner`:

```bash
gh pr create --title "feat(cors): allow claudie.dineshd.dev origin" --body "$(cat <<'EOF'
## Summary
- Adds `https://claudie.dineshd.dev` to the CORS allowlist alongside the existing `https://claudehome.dineshd.dev` entry.

## Why
- Phase 1 of the frontend domain rebrand. The new origin must be allowed before the Vercel alias goes live; otherwise the browser blocks every API call from the new domain.

## Test plan
- [ ] After merge and deploy, `curl -i -H 'Origin: https://claudie.dineshd.dev' https://api.claudehome.dineshd.dev/api/v1/health/live` returns the `access-control-allow-origin: https://claudie.dineshd.dev` header.
EOF
)"
```

Wait for Dinesh to review and merge. Confirm the deploy lands on the VPS before proceeding to Task 3.

---

## Task 3: Vercel domain alias (Dinesh action)

**Files:** None.

This step is performed in the Vercel dashboard and at the DNS registrar. The agent surfaces it; Dinesh executes.

- [ ] **Step 1: DNS record**

At the registrar for `dineshd.dev`, add:

```text
Type:  CNAME
Name:  claudie
Value: cname.vercel-dns.com
TTL:   default (auto)
```

- [ ] **Step 2: Add the domain to the Vercel project**

In Vercel dashboard → the claudehome project → Settings → Domains → Add. Enter `claudie.dineshd.dev`. Do **not** mark it as primary yet. Vercel will provision the TLS certificate automatically once DNS resolves.

- [ ] **Step 3: Verify the alias serves the current build**

After cert provisioning, run:

```bash
curl -I https://claudie.dineshd.dev/
```

Expected: HTTP/2 200, `server: Vercel`, `x-vercel-id` header. The page should be byte-identical to `https://claudehome.dineshd.dev/` because both domains point at the same deployment.

- [ ] **Step 4: CORS smoke test from the new origin**

Open `https://claudie.dineshd.dev/` in a browser. Open DevTools → Network. Navigate to a page that triggers `useHealthSignal`, `useSessionStatus`, or `useSessionStream`. Confirm no CORS errors and 2xx responses for `api.claudehome.dineshd.dev/*` calls.

If CORS fails, the runner deploy from Task 2 has not landed. Stop and resolve before continuing.

---

## Task 4: In-repo URL fallback

**Files:**

- Modify: `apps/web/src/lib/utils/url.ts:23`

This is the load-bearing change in the repo. `getBaseUrl()` feeds `metadataBase` in `apps/web/src/app/layout.tsx:38`, which drives every Open Graph tag and canonical URL across the app.

- [ ] **Step 1: Create a branch**

Run from `/Users/Dinesh/dev/claudehome`:

```bash
git checkout -b feat/rebrand-frontend-to-claudie
```

- [ ] **Step 2: Edit the fallback URL**

In `apps/web/src/lib/utils/url.ts`, line 23:

Before:

```typescript
return "https://claudehome.dineshd.dev";
```

After:

```typescript
return "https://claudie.dineshd.dev";
```

No other lines in this file change. Do not edit the function signature, the comment block, or the priority order.

---

## Task 5: In-repo .env.example

**Files:**

- Modify: `apps/web/.env.example:24`

- [ ] **Step 1: Edit the public app URL**

In `apps/web/.env.example`, line 24:

Before:

```bash
NEXT_PUBLIC_APP_URL=https://claudehome.dineshd.dev
```

After:

```bash
NEXT_PUBLIC_APP_URL=https://claudie.dineshd.dev
```

Line 33 (`CLAUDE_API_URL="https://api.claudehome.dineshd.dev"`) is **unchanged**. The API host is explicitly out of scope for this rebrand.

---

## Task 6: In-repo CLAUDE.md

**Files:**

- Modify: `CLAUDE.md:4`

- [ ] **Step 1: Update the prose mention of the frontend domain**

In `CLAUDE.md`, line 4:

Before:

```markdown
`claudehome.dineshd.dev` paired with a FastAPI runner on a VPS. The runner
```

After:

```markdown
`claudie.dineshd.dev` paired with a FastAPI runner on a VPS. The runner
```

Line 49 (`api.claudehome.dineshd.dev`) is **unchanged**. The API host stays.

---

## Task 7: In-repo README.md

**Files:**

- Modify: `README.md:198`

- [ ] **Step 1: Locate the live link**

Run from `/Users/Dinesh/dev/claudehome`:

```bash
rg -n 'claudehome\.dineshd\.dev' README.md
```

Expected: one match on line 198 in the badge/links row.

- [ ] **Step 2: Edit the link target**

In `README.md`, line 198:

Before:

```markdown
[Live Experiment](https://claudehome.dineshd.dev) · [Documentation](https://dinesh-git17.github.io/claudehome/) · [Backend Repo](https://github.com/dinesh-git17/claude-runner)
```

After:

```markdown
[Live Experiment](https://claudie.dineshd.dev) · [Documentation](https://dinesh-git17.github.io/claudehome/) · [Backend Repo](https://github.com/dinesh-git17/claude-runner)
```

Only the first link target changes. The Documentation link (`dinesh-git17.github.io/claudehome/`) stays because the GitHub repo is not being renamed. The Backend Repo link is unaffected.

---

## Task 8: Verify all four edits

**Files:** None edited.

- [ ] **Step 1: Confirm the complete diff**

Run from `/Users/Dinesh/dev/claudehome`:

```bash
git diff --stat
```

Expected: exactly four files changed:

```text
 CLAUDE.md                            | 2 +-
 README.md                            | 2 +-
 apps/web/.env.example                | 2 +-
 apps/web/src/lib/utils/url.ts        | 2 +-
 4 files changed, 4 insertions(+), 4 insertions(-)
```

If a different file appears or the line counts differ, stop and inspect with `git diff` before proceeding.

- [ ] **Step 2: Confirm no stray frontend-domain refs remain in changed files**

Run:

```bash
rg -n 'claudehome\.dineshd\.dev' CLAUDE.md README.md apps/web/.env.example apps/web/src/lib/utils/url.ts
```

Expected: only the line 49 hit in `CLAUDE.md` (the `api.claudehome.dineshd.dev` reference, which stays).

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: clean (no warnings, no errors).

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: clean.

- [ ] **Step 5: Build**

Run: `pnpm build`
Expected: clean Turbopack build, no errors.

- [ ] **Step 6: Protocol Zero scan**

Run: `./tools/protocol-zero.sh`
Expected: clean (no AI-attribution violations).

If any of Steps 3–6 fail, fix the underlying issue and re-run. Do not commit until all six pass.

---

## Task 9: Commit and push

**Files:** None edited beyond what Tasks 4–7 produced.

- [ ] **Step 1: Stage the four files**

Run from `/Users/Dinesh/dev/claudehome`:

```bash
git add CLAUDE.md README.md apps/web/.env.example apps/web/src/lib/utils/url.ts
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(brand): swap frontend domain to claudie.dineshd.dev

Updates the four in-repo references that pin the frontend canonical URL
so server-rendered metadata (OG tags, canonical links via metadataBase)
reflects the new domain. The API host, GitHub repo URL, package names,
and Docker identifiers are intentionally untouched.
EOF
)"
```

- [ ] **Step 3: Push**

```bash
git push -u origin feat/rebrand-frontend-to-claudie
```

---

## Task 10: Open the PR

**Files:** None edited.

- [ ] **Step 1: Verify PR template presence**

Run: `ls .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null && echo "template exists" || echo "no template"`

If a template exists, follow its structure when filling out the body. If not, use the structure below.

- [ ] **Step 2: Create the PR**

Run from `/Users/Dinesh/dev/claudehome`:

```bash
gh pr create --title "feat(brand): swap frontend domain to claudie.dineshd.dev" --body "$(cat <<'EOF'
## Summary
- Updates the four in-repo references that pin the frontend canonical URL to `claudie.dineshd.dev`.
- API host, GitHub repo, package names, Docker identifiers, local working directory, and everything under `/docs/` and `ARCHITECTURE.md` are intentionally untouched.

## Files changed
- `apps/web/src/lib/utils/url.ts` — production fallback feeds `metadataBase` for every OG tag and canonical URL.
- `apps/web/.env.example` — new value for `NEXT_PUBLIC_APP_URL`.
- `CLAUDE.md` — prose mention of the frontend domain.
- `README.md` — Live Experiment link.

## Spec
`docs/superpowers/specs/2026-04-24-claudie-domain-rebrand-design.md`

## Test plan
- [ ] `pnpm lint` clean.
- [ ] `pnpm typecheck` clean.
- [ ] `pnpm build` clean.
- [ ] `./tools/protocol-zero.sh` clean.
- [ ] After Vercel canonical flip: `curl -I https://claudie.dineshd.dev/` returns 200 and `curl -I https://claudehome.dineshd.dev/thoughts?q=test` returns 308 with the new domain in `Location`.
- [ ] After Vercel canonical flip: page loads in browser, no CORS errors from the three session/health hooks, OG `og:url` and `<link rel="canonical">` tags use the new domain.

## Sequencing
This PR is Phase 3 of 4. Phases 1 (claude-runner CORS) and 2 (Vercel alias) must already be live. Phase 4 (Vercel canonical flip + env var update) happens after this merges and the deploy lands.
EOF
)"
```

- [ ] **Step 3: Wait for review and merge**

Dinesh reviews. After merge, Vercel auto-deploys. Confirm the deploy lands before proceeding to Task 11.

Run after merge:

```bash
curl -s https://claudie.dineshd.dev/ | grep -o '<link rel="canonical"[^>]*>' | head -1
```

Expected: the canonical href contains `claudie.dineshd.dev`. If it still contains `claudehome.dineshd.dev`, the new deploy has not landed yet — wait and re-check.

---

## Task 11: Vercel canonical flip (Dinesh action)

**Files:** None.

- [ ] **Step 1: Set `claudie.dineshd.dev` as primary domain**

Vercel dashboard → claudehome project → Settings → Domains → on the `claudie.dineshd.dev` row, set as Primary. Vercel reconfigures `claudehome.dineshd.dev` as a redirect alias automatically.

- [ ] **Step 2: Update the production env var**

Vercel dashboard → claudehome project → Settings → Environment Variables → edit `NEXT_PUBLIC_APP_URL` for the Production environment:

```text
NEXT_PUBLIC_APP_URL = https://claudie.dineshd.dev
```

- [ ] **Step 3: Trigger a production redeploy**

The env var change does not redeploy automatically. Either push a no-op commit to `main` or trigger a redeploy from the Vercel dashboard (Deployments → latest production deployment → Redeploy → "Use existing Build Cache" off).

---

## Task 12: Post-deploy verification

**Files:** None edited.

- [ ] **Step 1: Old domain returns 308**

Run:

```bash
curl -I 'https://claudehome.dineshd.dev/thoughts?q=test'
```

Expected: `HTTP/2 308`, `location: https://claudie.dineshd.dev/thoughts?q=test`. Path and query preserved.

- [ ] **Step 2: New domain returns 200**

Run:

```bash
curl -I https://claudie.dineshd.dev/
```

Expected: `HTTP/2 200`, `server: Vercel`.

- [ ] **Step 3: Canonical metadata uses the new domain**

Run:

```bash
curl -s https://claudie.dineshd.dev/ | rg -o '<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>'
```

Expected: both tags reference `https://claudie.dineshd.dev`. Neither references the old domain.

- [ ] **Step 4: Browser smoke test**

Open `https://claudie.dineshd.dev/` in a browser. Open DevTools → Console + Network. Navigate to a page that uses `useHealthSignal` (the live signal indicator) and `useSessionStream`. Confirm:

- No CORS errors in the console.
- API calls to `api.claudehome.dineshd.dev` return 2xx.
- OG preview via a card debugger (e.g. `https://www.opengraph.xyz/url/https%3A%2F%2Fclaudie.dineshd.dev`) shows the new domain.

- [ ] **Step 5: Inbound redirect test from a real path**

Run:

```bash
curl -L -o /dev/null -s -w '%{url_effective} %{http_code}\n' https://claudehome.dineshd.dev/about
```

Expected: `https://claudie.dineshd.dev/about 200`.

- [ ] **Step 6: Mark spec status complete**

In `docs/superpowers/specs/2026-04-24-claudie-domain-rebrand-design.md`, update the frontmatter:

Before:

```yaml
status: draft
related_pr: TBD
```

After:

```yaml
status: shipped
related_pr: <PR URL from Task 10>
```

Branch, commit, push, PR (no direct commits to `main` — workspace rule):

```bash
git checkout main && git pull
git checkout -b docs/mark-claudie-rebrand-shipped
git add docs/superpowers/specs/2026-04-24-claudie-domain-rebrand-design.md
git commit -m "docs(spec): mark claudie domain rebrand as shipped"
git push -u origin docs/mark-claudie-rebrand-shipped
gh pr create --title "docs(spec): mark claudie domain rebrand as shipped" --body "Updates spec frontmatter (status: draft -> shipped, related_pr filled in) now that Phase 4 verification is complete."
```

---

## Rollback (if any verification step fails)

The most likely failure mode is a missed CORS origin on the runner side, surfacing as browser-blocked API calls from the new domain. Recovery does not require any code revert:

1. **In Vercel:** flip the primary domain back to `claudehome.dineshd.dev`. The new domain becomes the redirect target. The site is restored to the prior behaviour immediately.
2. **In claude-runner:** if the issue is the CORS allowlist, fix the entry, redeploy, then re-attempt the canonical flip.
3. **In this repo:** the `getBaseUrl()` fallback now points at `claudie.dineshd.dev`, but the `NEXT_PUBLIC_APP_URL` env var on Vercel still wins. If the env var also points at the new domain, revert it to `https://claudehome.dineshd.dev` in the Vercel dashboard. No code revert is needed.

If the issue is unrecoverable in production, revert the in-repo PR (`gh pr revert <PR>` followed by merge of the revert PR). The CORS PR in claude-runner can stay merged forever — additive, no harm.
