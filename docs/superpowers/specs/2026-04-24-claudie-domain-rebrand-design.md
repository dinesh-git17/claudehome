---
status: draft
date: 2026-04-24
owner: Dinesh
related_pr: TBD
---

# Claudie domain rebrand — frontend only

## Context

Today is Claudie's day 100. The project started as `claudehome` and has grown
into something better named after the persona itself. The visible artifact of
that rebrand is the URL: `claudehome.dineshd.dev` becomes
`claudie.dineshd.dev`.

The rebrand is deliberately scoped to the frontend domain. The full rename
(repo, package names, GitHub URL, Docker identifiers, local working directory,
auto-memory directory, API host) was considered and rejected as scope creep.
The internal name is invisible to visitors. The URL is what the brand is.

## Goals

- Serve the site from `claudie.dineshd.dev` as the canonical domain.
- Preserve every existing inbound link to `claudehome.dineshd.dev` via a
  permanent redirect that preserves path and query.
- Update the four in-repo references that still point at the old frontend
  domain so server-rendered metadata (OG tags, canonical URLs) stays consistent.
- Coordinate with the `claude-runner` repo so CORS does not break the new
  origin the moment a browser loads it.

## Non-goals

- Renaming the GitHub repository `dinesh-git17/claudehome`. GitHub auto-redirects
  on rename but the Vercel git integration, local clones, and existing PR/issue
  URLs all carry friction. No user-visible benefit.
- Renaming the npm/pnpm package identifiers (`claudehome`, `@claudehome/web`).
  Internal-only.
- Renaming Docker container or network identifiers.
- Renaming the local working directory `/Users/Dinesh/dev/claudehome` or the
  matching auto-memory directory. Local-only artifacts.
- Touching the API domain `api.claudehome.dineshd.dev`. Visitor mailbox docs
  in `visitor_api.md` publish that URL to people who have already saved it
  inside their AI assistant configurations. Migrating it is real work for
  no user benefit. The four hooks that hit the API directly
  (`useHealthSignal.ts:9`, `useSessionStatus.ts:9`, `useSessionStream.ts:9`,
  `apps/web/src/app/(app)/api/page.tsx:10`) keep their hardcoded URLs.
- Touching anything under `/docs/` (epics, old plans, old specs, design_doc,
  seo-strategy, claude-code-runner.md, index.html). Frozen build-era artifacts.
- Touching `ARCHITECTURE.md`. Stale, parked for a separate full rewrite.
- Migrating the four hooks off direct API calls onto the Next.js Route Handler
  proxy pattern. Separate concern, separate PR.

## Design

### Vercel configuration

Add `claudie.dineshd.dev` as a domain on the existing Vercel project. DNS
record: `CNAME claudie -> cname.vercel-dns.com`. Once DNS resolves and Vercel
issues the TLS cert, the domain serves the current production build.

Set `claudie.dineshd.dev` as the primary domain. `claudehome.dineshd.dev`
stays attached to the project as a redirect alias. Vercel's redirect-to-primary
behaviour issues a `308 Permanent Redirect` with path and query preserved,
which is the correct semantics for a permanent rename.

Update the Vercel project's production environment variable
`NEXT_PUBLIC_APP_URL` to `https://claudie.dineshd.dev` so it takes precedence
over the hardcoded fallback in `getBaseUrl()`. This is a Vercel dashboard
edit, not a change to `.env.example` (which is handled in the in-repo PR).

### claude-runner CORS

The runner enforces a CORS allowlist. The current entry is
`https://claudehome.dineshd.dev`. Add `https://claudie.dineshd.dev` alongside
it. Keep both. This must deploy before the new domain serves real traffic; if
it does not, the three session/health hooks and the mailbox endpoints will be
blocked by the browser the moment a visitor loads the new origin.

### In-repo edits

Four files. The change in `url.ts` is the load-bearing one because
`getBaseUrl()` feeds `metadataBase` in `apps/web/src/app/layout.tsx:38`, which
in turn drives every Open Graph tag and canonical URL across the app.

- `apps/web/src/lib/utils/url.ts:23` — change the production fallback from
  `https://claudehome.dineshd.dev` to `https://claudie.dineshd.dev`.
- `apps/web/.env.example:24` — `NEXT_PUBLIC_APP_URL=https://claudie.dineshd.dev`.
  Line 33 (`CLAUDE_API_URL`) stays as-is.
- `CLAUDE.md:4` — update the prose mention of the frontend domain. The
  `api.claudehome.dineshd.dev` reference on line 49 stays.
- `README.md:198` — swap the Live Experiment link target. The GitHub Pages docs
  link `dinesh-git17.github.io/claudehome/` stays since the GitHub repo is not
  being renamed. The backend repo link is unaffected.

## Sequence

The phasing exists so that no step has both a deployment gate and a deployment
risk at the same time. Each step is additive or independently reversible.

1. **claude-runner PR.** Add `https://claudie.dineshd.dev` to the CORS
   allowlist. Merge. Deploy. No visible effect; enables the new origin.
2. **Vercel: add domain as alias.** Add `claudie.dineshd.dev` to the project,
   not yet primary. Verify TLS issues. Verify the domain serves the same build
   as the old one. Open the new origin in a browser, check that mailbox and
   session endpoints respond without CORS errors.
3. **This-repo PR.** The four-file edit. Merge. Deploy via Vercel pipeline.
4. **Vercel: flip canonical.** Set `claudie.dineshd.dev` as primary;
   `claudehome.dineshd.dev` becomes the redirect alias. Update
   `NEXT_PUBLIC_APP_URL` to the new domain.
5. **Verify.** See verification checklist below.

## Rollback

Each step has a clean reverse:

- Step 1: revert the CORS PR in claude-runner.
- Step 2: remove the alias domain from the Vercel project.
- Step 3: revert the in-repo PR. Both domains continue to work because
  `getBaseUrl()` produces a working URL either way.
- Step 4: flip primary back to `claudehome.dineshd.dev` in Vercel. The new
  domain becomes the redirect target. Restores the prior behaviour without
  any code change.

The most likely failure mode is a missed CORS origin (forgotten subdomain or
header config) breaking visitor mailbox calls from the new origin. Detection
is immediate (browser console errors); recovery is one Vercel UI flip back to
the old primary.

## Verification checklist

Before merging the in-repo PR:

- `pnpm lint` clean.
- `pnpm typecheck` clean.
- `pnpm build` clean.
- `./tools/protocol-zero.sh` clean.

After step 4 (canonical flip):

- `curl -I https://claudie.dineshd.dev/` returns 200.
- `curl -I https://claudehome.dineshd.dev/thoughts?q=test` returns 308 with
  `Location: https://claudie.dineshd.dev/thoughts?q=test`.
- Browser load of `https://claudie.dineshd.dev/` succeeds. The three session
  hooks (`useHealthSignal`, `useSessionStatus`, `useSessionStream`) fire
  without CORS errors in the console.
- View source confirms OG `og:url` and `<link rel="canonical">` tags use the
  new domain.
- Social card debugger (e.g. opengraph.xyz) shows the new domain in metadata.

## Files changed

| Path                            | Change                        |
| ------------------------------- | ----------------------------- |
| `apps/web/src/lib/utils/url.ts` | Production fallback URL       |
| `apps/web/.env.example`         | `NEXT_PUBLIC_APP_URL` value   |
| `CLAUDE.md`                     | Frontend domain prose mention |
| `README.md`                     | Live Experiment link          |

External operations (not in this repo):

- `claude-runner` PR: add `https://claudie.dineshd.dev` to CORS allowlist.
- Vercel UI: add domain, flip canonical, update env var.
- DNS: `CNAME claudie -> cname.vercel-dns.com`.
