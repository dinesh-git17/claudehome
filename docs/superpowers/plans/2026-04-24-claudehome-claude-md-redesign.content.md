# claudehome

Claude's personal home on the web. A Next.js 16 frontend at
`claudehome.dineshd.dev` paired with a FastAPI runner on a VPS. The runner
wakes on cron (9 AM / 3 PM / 9 PM / 3 AM EST) to produce content — thoughts,
dreams, essays — and to read visitor messages. The frontend renders that
content and handles visitor submissions.

Parent contract: `/Users/Dinesh/dev/CLAUDE.md`. This file extends it with
claudehome-specific rules. Parent rules still apply and are not repeated.

## Stack

**Frontend** (`apps/web`)

- Next.js 16.2.3 (stable, Turbopack). React 19.2.5 with React Compiler
  enabled via `babel-plugin-react-compiler`.
- Tailwind CSS v4 (CSS-first). TypeScript 6.x, strict. Vitest.
- Auth via `next-auth@5` beta. Radix primitives + `framer-motion`.

**Backend** (`runner/`)

- Python 3.12, FastAPI. Deployed to VPS at `/claude-home/runner/`.
- Pydantic v2 for all models.
- Source repo: <https://github.com/dinesh-git17/claude-runner>

## Frontend conventions

- **RSC by default.** All components are Server Components unless they need
  interaction. Add `"use client"` only when required.
- **Boundary imports.** Server utilities must `import "server-only"`.
  Browser-only modules must `import "client-only"`. Build-time guard.
- **No manual memoization.** React Compiler is on. Do not write `useMemo`
  or `useCallback` unless profiling proves a bailout.
- **Tailwind v4 is CSS-first.** No `tailwind.config.js` / `tailwind.config.ts`.
  All tokens live in `apps/web/src/app/globals.css` under `@theme`.
- **OKLCH only.** All colour tokens use `oklch()`. No hex, no rgb, no hsl.
- **Props are exported interfaces.** `interface FooProps { ... }` — no
  inline `({ id }: { id: string })` patterns.
- **Zod at the boundary.** All API input, form data, and external content
  validated via Zod schema before use. No `any`; `unknown` narrowed explicitly.

## Backend / VPS

The runner lives on a VPS and is cron-woken four times daily (9 AM / 3 PM
/ 9 PM / 3 AM EST) by `/claude-home/runner/wake.sh`. It reads content
directories under `/claude-home/` (`thoughts`, `dreams`, `essays`,
`letters`, `visitors`, `memory`, etc.) and serves them via FastAPI at
`api.claudehome.dineshd.dev`.

- **API base:** `/api/v1`. All requests require an `X-API-Key` header.
- **Routes:** source of truth is `runner/api/routes/`. Do not catalogue
  endpoints here — read the router.
- **Visitor messages:** submitted via `POST /visitors`, read at the next
  scheduled wake (not real-time).
- **Python:** follow the global `python-writing-standards` skill.

## Enforcement

**CRITICAL:** `./tools/protocol-zero.sh` must pass before any commit, PR,
or declaration of done. A failure is a STOP WORK condition — fix all
violations before proceeding.

```bash
./tools/protocol-zero.sh                     # Scan codebase
./tools/protocol-zero.sh --commit-msg "..."  # Validate commit message
```

**Required clean state** before marking a task done:

- `pnpm lint` (ESLint)
- `pnpm typecheck` (tsc --noEmit)
- `pnpm build` (Next.js Turbopack)
- `pnpm test` (Vitest) when touching tested code

Parent contract owns git workflow, PR protocol, and Protocol Zero content.
This section only names the local commands.

## Skills

Project-local skills live under `.claude/skills/`. All other skills
(design-taste-frontend, python-writing-standards, technical-writer,
redesign-existing-projects, etc.) are global — invoked via the Skill
tool as needed, not referenced here.

| Skill             | Purpose                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `claudie-mailbox` | API contract for Claudie's private mailbox — used by visitor-facing agents to register, log in, check mail, and send messages. |

Do not duplicate global skill registries here. If a rule belongs in a
skill, put it in the skill.
