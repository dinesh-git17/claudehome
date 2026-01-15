# Epic: Workflow Hardening & CI/CD Pipeline

**Epic ID:** E0-CI-01
**Status:** Reviewed & Approved
**Reviewed By:** Staff Engineer (Gap Analysis Complete)
**Last Updated:** 2026-01-15

---

## Epic Description

This epic establishes the production-grade verification layer for the repository, ensuring that every commit and pull request adheres to strict quality, testing, and governance standards before merging. It implements a "Shift Left" strategy via Husky and Commitlint to catch errors locally, coupled with a parallelized GitHub Actions pipeline that enforces linting, type-safety, and Protocol Zero compliance in the cloud. Additionally, it automates administrative toil through scoped Dependabot rules, semantic PR labeling, and CODEOWNERS enforcement, guaranteeing that the repository maintains FAANG-level hygiene with minimal manual intervention.

---

## Governance & Compliance

### No-AI Attribution Policy (Protocol Zero)

This epic operates under **strict Protocol Zero enforcement** as defined in `CLAUDE.md`.

- All commits, PRs, and code artifacts MUST be free of AI attribution
- `tools/protocol-zero.sh` MUST pass in both pre-commit hooks and CI pipeline
- PR template MUST include a mandatory No-AI attestation checkbox
- Dependabot PRs MUST be scanned by Protocol Zero in CI before merge

**Enforcement Points:**

1. Local: Husky `pre-commit` hook runs `protocol-zero.sh`
2. Local: Husky `commit-msg` hook validates message via commitlint
3. CI: `compliance` job runs `protocol-zero.sh` on all PR branches
4. PR: Manual attestation checkbox in PR template

---

## Scope Boundaries

### In Scope

- `apps/web` (Next.js frontend)
- Root-level configuration files
- `tools/` directory

### Out of Scope (Deferred to Phase 2)

- `/infra` directory (does not exist)
- Python/pip ecosystem (no backend service yet)
- `/packages/*` (empty workspace)

---

## Implementation Stories

| Order | Story ID | Story Title                                   | Points |
| ----- | -------- | --------------------------------------------- | ------ |
| 1     | S-CI-01  | Conventional Commit & Git Hygiene Enforcement | 2      |
| 2     | S-CI-02  | PR Governance & Ownership Standards           | 2      |
| 3     | S-CI-03  | Parallelized CI Verification Pipeline         | 5      |
| 4     | S-CI-04  | Triage Automation & Feedback Loop             | 3      |
| 5     | S-CI-05  | Dependabot Governance                         | 1      |

**Total Story Points:** 13

---

## Story Details

### S-CI-01: Conventional Commit & Git Hygiene Enforcement

**Description:**
Extend the existing Husky configuration to enforce Semantic Versioning compatibility via `commitlint`. Configure the `commit-msg` hook to strictly validate commit messages against the Conventional Commits specification. Ensure the `pre-commit` hook invokes the `tools/protocol-zero.sh` scanner, blocking any commit containing AI attribution or non-compliant artifacts before they leave the local environment.

**Implementation Notes:**

- Install `commitlint` and `@commitlint/config-conventional` at **monorepo root only**
- Configuration file: `commitlint.config.js` at repository root
- Husky hook location: `.husky/commit-msg`

**Acceptance Criteria:**

| #   | Criterion                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | `commitlint` and `@commitlint/config-conventional` installed as root devDependencies                              |
| 2   | `commitlint.config.js` exists at repository root extending `@commitlint/config-conventional`                      |
| 3   | Husky `commit-msg` hook exists and runs `npx --no -- commitlint --edit $1`                                        |
| 4   | Non-conventional commit messages are rejected with error format: `⧗ input: <message>` followed by rule violations |
| 5   | Husky `pre-commit` hook continues to run `lint-staged` and `tools/protocol-zero.sh`                               |
| 6   | Protocol Zero violations block commit with clear error listing forbidden patterns detected                        |

---

### S-CI-02: PR Governance & Ownership Standards

**Description:**
Institute a strict Pull Request contract by creating a `.github/pull_request_template.md` that mandates "Test Plan", "Mobile Responsiveness Evidence", and "No-AI Attestation" sections. Define the `.github/CODEOWNERS` file to enforce mandatory review gates for critical paths. Configure branch protection rules to require CODEOWNER approval before merge.

**Implementation Notes:**

- CODEOWNERS owner: `@dinesh-git17` for all paths
- Mobile Evidence format: Screenshot upload or Lighthouse report link
- Branch protection rules must be documented in `.github/BRANCH_PROTECTION.md` for auditability

**Acceptance Criteria:**

| #   | Criterion                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `.github/pull_request_template.md` exists with headers: Summary, Test Plan, Mobile Responsiveness Evidence, No-AI Attestation             |
| 2   | No-AI Attestation section contains checkbox: `- [ ] I confirm this PR contains no AI-generated code, comments, or Co-Authored-By headers` |
| 3   | `.github/CODEOWNERS` maps `*` to `@dinesh-git17`                                                                                          |
| 4   | `.github/CODEOWNERS` maps `/apps/web/` to `@dinesh-git17`                                                                                 |
| 5   | `.github/CODEOWNERS` maps `/tools/` to `@dinesh-git17`                                                                                    |
| 6   | `.github/BRANCH_PROTECTION.md` documents required branch protection settings for `main`                                                   |
| 7   | Opening a new PR pre-populates the body with the mandatory template                                                                       |

**Branch Protection Settings (to be configured via GitHub UI):**

- Require pull request before merging
- Require approvals: 1
- Require review from Code Owners
- Require status checks to pass before merging
- Require branches to be up to date before merging

---

### S-CI-03: Parallelized CI Verification Pipeline

**Description:**
Architect the primary GitHub Actions workflow (`.github/workflows/verify.yml`) to run verification jobs in parallel. Define distinct jobs for `lint`, `typecheck`, `test`, `compliance` (Protocol Zero), and `build` (Next.js). Utilize `concurrency` groups to cancel redundant runs on updated PRs and implement `pnpm` caching for fast initialization.

**Implementation Notes:**

- Runner: `ubuntu-latest`
- Node.js version: `24.11.1` (match `.nvmrc`)
- pnpm version: `9.15.0` (match `package.json` packageManager)
- Caching: Use `pnpm/action-setup` with built-in store caching
- Concurrency group pattern: `${{ github.workflow }}-${{ github.ref }}`

**Acceptance Criteria:**

| #   | Criterion                                                                                 |
| --- | ----------------------------------------------------------------------------------------- |
| 1   | `.github/workflows/verify.yml` exists and triggers on `pull_request` and `push` to `main` |
| 2   | `lint` job runs `pnpm lint`                                                               |
| 3   | `typecheck` job runs `pnpm typecheck`                                                     |
| 4   | `test` job runs `pnpm test` (establishes test slot even if no tests exist yet)            |
| 5   | `compliance` job runs `./tools/protocol-zero.sh` and fails pipeline on exit code 1        |
| 6   | `build` job runs `pnpm build` and confirms Next.js production build succeeds              |
| 7   | All jobs (`lint`, `typecheck`, `test`, `compliance`, `build`) execute in parallel         |
| 8   | Redundant runs are auto-cancelled via `concurrency` group with `cancel-in-progress: true` |
| 9   | pnpm store is cached between runs using `pnpm/action-setup`                               |
| 10  | Workflow uses `ubuntu-latest` runner                                                      |

**Job Dependency Graph:**

```
[lint] ─────────┐
[typecheck] ────┤
[test] ─────────┼──► (all parallel, no dependencies)
[compliance] ───┤
[build] ────────┘
```

---

### S-CI-04: Triage Automation & Feedback Loop

**Description:**
Implement automated PR triage using `actions/labeler` with a path-based configuration. Establish a unified label taxonomy with consistent colors. Configure actions to auto-assign PRs to creators and post CI failure summaries via GitHub Job Summaries.

**Implementation Notes:**

- Use `actions/labeler@v5` for path-based labeling
- Use `peter-evans/create-or-update-comment@v4` for failure summaries (optional enhancement)
- CI failure details surfaced via `$GITHUB_STEP_SUMMARY`

**Label Taxonomy:**

| Label               | Color (Hex) | Description                   |
| ------------------- | ----------- | ----------------------------- |
| `area/frontend`     | `#1d76db`   | Changes to apps/web           |
| `area/tooling`      | `#5319e7`   | Changes to tools/ or scripts/ |
| `area/config`       | `#0e8a16`   | Changes to root config files  |
| `kind/feat`         | `#a2eeef`   | New feature                   |
| `kind/fix`          | `#d73a4a`   | Bug fix                       |
| `kind/chore`        | `#fef2c0`   | Maintenance/housekeeping      |
| `kind/docs`         | `#0075ca`   | Documentation changes         |
| `size/xs`           | `#ededed`   | < 10 lines changed            |
| `size/s`            | `#d4c5f9`   | 10-50 lines changed           |
| `size/m`            | `#fbca04`   | 50-200 lines changed          |
| `size/l`            | `#eb6420`   | 200-500 lines changed         |
| `size/xl`           | `#b60205`   | > 500 lines changed           |
| `priority/critical` | `#b60205`   | Immediate attention required  |
| `priority/high`     | `#d93f0b`   | High priority                 |
| `priority/medium`   | `#fbca04`   | Medium priority               |
| `priority/low`      | `#0e8a16`   | Low priority                  |

**Acceptance Criteria:**

| #   | Criterion                                                                                 |
| --- | ----------------------------------------------------------------------------------------- |
| 1   | `.github/labeler.yml` exists with path-to-label mappings                                  |
| 2   | `apps/web/**` changes receive `area/frontend` label                                       |
| 3   | `tools/**` or `scripts/**` changes receive `area/tooling` label                           |
| 4   | Root config files (`*.json`, `*.yaml`, `*.yml`, `*.config.*`) receive `area/config` label |
| 5   | `.github/workflows/labeler.yml` workflow triggers on `pull_request` events                |
| 6   | PRs are auto-assigned to the PR creator via workflow or `peter-evans/auto-assign` action  |
| 7   | CI failure details are written to `$GITHUB_STEP_SUMMARY` for visibility                   |
| 8   | All labels defined in taxonomy are created in repository with correct colors              |

---

### S-CI-05: Dependabot Governance

**Description:**
Configure `.github/dependabot.yml` to manage the high-velocity release cycles of Next.js Canary and React 19. Define a specific update group for "Core Frameworks" to batch noise, and apply scoped labels. Set the schedule to `weekly` for canary packages to prevent PR flooding.

**Implementation Notes:**

- **npm ecosystem only** (no pip - Python backend deferred to Phase 2)
- Core Frameworks group: `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom`
- Manual merge approval enforced via branch protection (S-CI-02), not Dependabot config

**Acceptance Criteria:**

| #   | Criterion                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------ |
| 1   | `.github/dependabot.yml` exists with `npm` package ecosystem configured                                      |
| 2   | Directory set to `/` (monorepo root)                                                                         |
| 3   | Schedule interval: `weekly`                                                                                  |
| 4   | `open-pull-requests-limit` set to `5`                                                                        |
| 5   | "Core Frameworks" group defined containing: `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom` |
| 6   | Labels applied to Dependabot PRs: `dependencies`, `area/config`                                              |
| 7   | Commit message prefix configured as `chore(deps):`                                                           |
| 8   | No `pip` ecosystem configuration (deferred to Phase 2)                                                       |

---

## Dependencies & Prerequisites

| Dependency             | Status      | Notes                          |
| ---------------------- | ----------- | ------------------------------ |
| Husky installed        | ✅ Complete | v9.1.7 at root                 |
| lint-staged configured | ✅ Complete | Runs ESLint + Prettier         |
| Protocol Zero script   | ✅ Complete | `tools/protocol-zero.sh`       |
| ESLint configured      | ✅ Complete | Flat config with Next.js rules |
| TypeScript configured  | ✅ Complete | Strict mode enabled            |
| pnpm workspace         | ✅ Complete | `pnpm-workspace.yaml`          |

---

## Risks & Mitigations

| Risk                                                | Likelihood | Impact | Mitigation                                                                |
| --------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- |
| Commitlint rejects valid edge-case messages         | Low        | Medium | Document escape hatch: `git commit --no-verify` for emergencies (audited) |
| Protocol Zero false positives in CI                 | Low        | High   | Maintain exclusion list in script; test with canary phrases               |
| Dependabot PR flooding during high-velocity periods | Medium     | Low    | Weekly schedule + PR limit of 5                                           |
| Branch protection misconfiguration                  | Low        | High   | Document settings in `.github/BRANCH_PROTECTION.md`                       |

---

## Definition of Done

- [ ] All stories pass their Acceptance Criteria
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] `./tools/protocol-zero.sh` passes
- [ ] No AI attribution in any committed artifact
- [ ] CI pipeline runs successfully on test PR
- [ ] Branch protection rules documented and configured

---

## Changelog

| Date       | Change                                                                  | Author                |
| ---------- | ----------------------------------------------------------------------- | --------------------- |
| 2026-01-15 | Initial gap analysis and review complete                                | Staff Engineer Review |
| 2026-01-15 | Removed phantom dependencies (/infra, Python/pip)                       | Gap Resolution        |
| 2026-01-15 | Added test job to S-CI-03                                               | Gap Resolution        |
| 2026-01-15 | Added No-AI attestation to PR template                                  | Gap Resolution        |
| 2026-01-15 | Assigned CODEOWNERS to @dinesh-git17                                    | Gap Resolution        |
| 2026-01-15 | Increased S-CI-02 points from 1 to 2 (added documentation requirements) | Scope Adjustment      |
