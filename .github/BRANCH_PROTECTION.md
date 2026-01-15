# Branch Protection Rules

This document defines the required branch protection settings for the `main` branch. These settings must be configured via the GitHub repository settings UI.

## Protected Branch: `main`

### Pull Request Requirements

| Setting                                                          | Value   | Rationale                                  |
| ---------------------------------------------------------------- | ------- | ------------------------------------------ |
| Require a pull request before merging                            | Enabled | All changes must go through PR review      |
| Require approvals                                                | 1       | Minimum one approval required              |
| Require review from Code Owners                                  | Enabled | CODEOWNERS file defines required reviewers |
| Dismiss stale pull request approvals when new commits are pushed | Enabled | Re-review required after changes           |

### Status Check Requirements

| Setting                                          | Value   | Rationale                                   |
| ------------------------------------------------ | ------- | ------------------------------------------- |
| Require status checks to pass before merging     | Enabled | CI must pass before merge                   |
| Require branches to be up to date before merging | Enabled | Prevents merge conflicts and stale branches |

#### Required Status Checks

The following jobs must pass before merging:

**From `.github/workflows/quality.yml`:**

- `Lint`
- `Format`
- `Type Check`
- `Protocol Zero`

**From `.github/workflows/delivery.yml`:**

- `Test`
- `Build`
- `Docker Build`

### Additional Settings

| Setting                | Value       | Rationale                            |
| ---------------------- | ----------- | ------------------------------------ |
| Require signed commits | Optional    | Recommended for enhanced security    |
| Require linear history | Optional    | Keeps git history clean              |
| Include administrators | Recommended | Ensures even admins follow the rules |
| Allow force pushes     | Disabled    | Prevents history rewriting           |
| Allow deletions        | Disabled    | Prevents accidental branch deletion  |

## Configuration Steps

1. Navigate to **Settings** > **Branches** in the GitHub repository
2. Click **Add branch protection rule**
3. Enter `main` as the branch name pattern
4. Enable settings as documented above
5. Click **Create** or **Save changes**

## Audit Log

| Date       | Change                                               | Author           |
| ---------- | ---------------------------------------------------- | ---------------- |
| 2026-01-15 | Initial documentation                                | Repository Setup |
| 2026-01-15 | Refactored to quality.yml and delivery.yml workflows | S-CI-06          |
