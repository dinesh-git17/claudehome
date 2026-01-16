# Epic: Application Shell & UI Foundations

**Epic ID:** E1-SHELL-01
**Status:** Ready for Implementation
**Dependencies:** E0-UI-01 (Tailwind v4), E0-GOV-02 (Frontend Governance)

---

## Overview

This epic establishes the structural skeleton of the application, implementing a persistent, zero-CLS layout architecture. It integrates the `shadcn/ui` component library tailored to the strict "Contemplative" design system (using Tailwind v4 semantic tokens) and constructs the responsive navigation shell (Sidebar) and global status bar. The output is a rigid `layout.tsx` hierarchy capable of supporting future parallel routes, ensuring that the application frame is stable, performant, and structurally decoupled from page-level content.

---

## Architectural Decisions (Resolved)

### ADR-01: Token Compatibility Strategy

**Decision:** CSS Alias Mapping

**Rationale:** Rewriting every shadcn component template is a maintenance burden that breaks easy updates from the upstream registry. Aliasing tokens in `globals.css` (e.g., `--primary: var(--color-accent-cool)`) is a zero-runtime-cost solution that keeps component code standard while enforcing the design system visually.

**Implementation:** Add CSS variable aliases in `globals.css` that map shadcn names to Contemplative semantic tokens.

### ADR-02: StatusBar Position

**Decision:** Fixed Bottom Bar

**Rationale:** The "Contemplative" design language mimics professional IDEs and editors (VS Code, Vim). A full-width bottom status bar provides a dedicated, non-intrusive zone for system messages that feels anchored and permanent.

**Implementation:** Fixed position at viewport bottom, full width, z-index below modals.

### ADR-03: Sidebar Width

**Decision:** 256px (16rem / `w-64`)

**Rationale:** `w-64` is a standard Tailwind utility class. 256px offers a balance—wide enough for comfortable typography without dominating the workspace. 240px often feels cramped for nested items; 280px consumes too much horizontal real estate.

**Implementation:** Fixed width `w-64` on desktop, full-width overlay on mobile.

### ADR-04: Mobile Navigation Primitive

**Decision:** `@radix-ui/react-dialog` (existing dependency)

**Rationale:** Dependency discipline. Radix Dialog is already installed via shadcn. Adding `vaul` for swipe gestures is not a Phase 1 critical requirement. A robust, accessible mobile sheet can be implemented with the existing Dialog primitive.

**Implementation:** Sheet component built on `@radix-ui/react-dialog` with slide-in animation.

---

## Governance Requirements

**MANDATORY for all stories:**

1. **Frontend Governance Skill:** Activate `.claude/skills/frontend-development/SKILL.md` before implementation
2. **Design Intent Protocol:** Emit `<design_intent>` block before UI generation (conversation-only, never committed)
3. **Protocol Zero:** Execute `tools/protocol-zero.sh` on all changes before commit
4. **Anti-Slop Compliance:** All components must use semantic tokens exclusively
5. **PR Workflow:** All changes via feature branch and PR per CLAUDE.md §6.3

---

## Token Mapping Reference

The following aliases must be added to `globals.css` to bridge shadcn defaults to Contemplative tokens:

| shadcn Variable          | Maps To                       | Purpose             |
| ------------------------ | ----------------------------- | ------------------- |
| `--background`           | `var(--color-void)`           | Page background     |
| `--foreground`           | `var(--color-text-primary)`   | Default text        |
| `--primary`              | `var(--color-accent-cool)`    | Primary actions     |
| `--primary-foreground`   | `var(--color-void)`           | Text on primary     |
| `--secondary`            | `var(--color-surface)`        | Secondary surfaces  |
| `--secondary-foreground` | `var(--color-text-primary)`   | Text on secondary   |
| `--muted`                | `var(--color-surface)`        | Muted backgrounds   |
| `--muted-foreground`     | `var(--color-text-secondary)` | Muted text          |
| `--accent`               | `var(--color-elevated)`       | Accent backgrounds  |
| `--accent-foreground`    | `var(--color-text-primary)`   | Text on accent      |
| `--destructive`          | `var(--color-accent-warm)`    | Destructive actions |
| `--border`               | `var(--color-surface)`        | Borders             |
| `--input`                | `var(--color-surface)`        | Input backgrounds   |
| `--ring`                 | `var(--color-accent-cool)`    | Focus rings         |

---

## Story Table

| Order | Story ID   | Story Title                         | Points | Description                                                                                                                                                                                                                                                                                                                   |
| ----- | ---------- | ----------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | S-SHELL-01 | Token Bridge & Component Audit      | 3      | Add CSS variable aliases to `globals.css` mapping shadcn tokens to Contemplative semantic tokens. Audit and remediate existing components (`Button`, `Dialog`, `DropdownMenu`) to verify they render correctly with new token mapping. Generate `Card` primitive using shadcn CLI. Verify no hardcoded colors remain.         |
| 2     | S-SHELL-02 | Root Layout & Provider Architecture | 2      | Extend existing `app/layout.tsx` with `metadata` export (title template, description, viewport). Create `app/providers.tsx` Client Component wrapper (empty shell for future providers). Verify RSC compliance and font injection.                                                                                            |
| 3     | S-SHELL-03 | Responsive Navigation Shell         | 3      | Build `Sidebar` component rendering from data-driven config at `lib/config/navigation.ts`. Implement `MobileSheet` using `@radix-ui/react-dialog` for viewports < 768px (`md:` breakpoint). Active state uses `text-text-primary`, inactive uses `text-text-secondary`. Hamburger icon: `Menu` from lucide-react.             |
| 4     | S-SHELL-04 | System Status Bar                   | 2      | Build `StatusBar` component fixed at viewport bottom. Accepts `status` prop (`idle`, `busy`, `error`). Uses `font-data` for monospace display. Visual indicators: pulsing dot for `busy`, static dot for `idle`, warning icon for `error`. z-index: 40 (above content, below modals at 50).                                   |
| 5     | S-SHELL-05 | Shell Composition & Zero-CLS        | 5      | Create `(app)/layout.tsx` route group. Implement CSS Grid layout with named areas: `sidebar` (w-64 fixed), `main` (scrollable), `status` (fixed bottom). Desktop sidebar visible, mobile uses Sheet overlay. Verify Lighthouse CLS < 0.1. Mobile/desktop transition via CSS media queries only (no JS dimension calculation). |

---

## Story Details

### S-SHELL-01: Token Bridge & Component Audit

**Prerequisites:** E0-UI-01 complete

**Deliverables:**

1. `globals.css` updated with shadcn token aliases (see Token Mapping Reference)
2. Existing `Button`, `Dialog`, `DropdownMenu` components verified functional
3. `Card` component generated via shadcn CLI and verified
4. `metric-card.tsx` audited for semantic token compliance

**Acceptance Criteria:**

- [ ] Token aliases added to `globals.css` within `@theme` directive
- [ ] `cn()` utility remains exported from `lib/utils.ts`
- [ ] `components.json` unchanged (already configured)
- [ ] `Button` renders correctly with all variants using semantic colors
- [ ] `Card` component exists at `components/ui/card.tsx`
- [ ] No Tailwind palette colors (`slate-*`, `gray-*`, etc.) in `components/ui/`
- [ ] `protocol-zero.sh` passes

---

### S-SHELL-02: Root Layout & Provider Architecture

**Prerequisites:** S-SHELL-01 complete

**Deliverables:**

1. `app/layout.tsx` enhanced with `metadata` export
2. `app/providers.tsx` created as Client Component wrapper

**Acceptance Criteria:**

- [ ] `metadata` export includes: `title.template`, `title.default`, `description`, `viewport`
- [ ] `providers.tsx` marked with `"use client"` directive
- [ ] `providers.tsx` wraps `children` (empty implementation acceptable)
- [ ] Layout renders `<html lang="en">` and `<body>` with font variables
- [ ] Bricolage Grotesque (`--font-heading`) and JetBrains Mono (`--font-data`) loaded
- [ ] Layout remains layout-agnostic (no sidebar rendering at this level)
- [ ] `protocol-zero.sh` passes

**Metadata Specification:**

```typescript
export const metadata: Metadata = {
  title: {
    template: "%s | Claude's Home",
    default: "Claude's Home",
  },
  description: "A contemplative digital space.",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};
```

---

### S-SHELL-03: Responsive Navigation Shell

**Prerequisites:** S-SHELL-01, S-SHELL-02 complete

**Deliverables:**

1. `components/shell/Sidebar.tsx` - Desktop navigation
2. `components/shell/MobileSheet.tsx` - Mobile navigation overlay
3. `lib/config/navigation.ts` - Navigation data config

**Navigation Config Interface:**

```typescript
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  segment: string; // URL segment for active detection
}
```

**Acceptance Criteria:**

- [ ] `Sidebar` renders nav items from config array
- [ ] Active link: `text-text-primary`, `bg-surface`
- [ ] Inactive link: `text-text-secondary`, hover `bg-surface`
- [ ] Desktop (≥768px): Fixed sidebar column, `w-64`
- [ ] Mobile (<768px): Hamburger button (`Menu` icon) triggers `MobileSheet`
- [ ] `MobileSheet` uses `@radix-ui/react-dialog` with slide-in animation
- [ ] Focus trapped within sheet when open
- [ ] `aria-label` on hamburger button, sheet, and nav items
- [ ] Keyboard navigation (Tab, Enter, Escape) functional
- [ ] `protocol-zero.sh` passes

---

### S-SHELL-04: System Status Bar

**Prerequisites:** S-SHELL-01 complete

**Deliverables:**

1. `components/shell/StatusBar.tsx` - Status display component

**Props Interface:**

```typescript
interface StatusBarProps {
  status: "idle" | "busy" | "error";
  message?: string;
}
```

**Acceptance Criteria:**

- [ ] Fixed position at viewport bottom, full width
- [ ] Height: `h-8` (32px)
- [ ] Background: `bg-surface`
- [ ] Border: `border-t border-elevated`
- [ ] Typography: `font-data` (JetBrains Mono), `text-xs`
- [ ] Status indicator: left-aligned pulsing dot (`busy`), static dot (`idle`), warning icon (`error`)
- [ ] Optional message text displayed after indicator
- [ ] z-index: 40 (`z-40`)
- [ ] Does not interfere with main content scrolling
- [ ] `protocol-zero.sh` passes

**Visual States:**
| Status | Indicator | Color |
|--------|-----------|-------|
| `idle` | Static dot | `text-text-tertiary` |
| `busy` | Pulsing dot | `text-accent-cool` |
| `error` | AlertCircle icon | `text-accent-warm` |

---

### S-SHELL-05: Shell Composition & Zero-CLS

**Prerequisites:** S-SHELL-02, S-SHELL-03, S-SHELL-04 complete

**Deliverables:**

1. `app/(app)/layout.tsx` - Route group layout composing shell components

**CSS Grid Structure:**

```css
.shell {
  display: grid;
  grid-template-areas:
    "sidebar main"
    "sidebar status";
  grid-template-columns: 16rem 1fr; /* w-64 */
  grid-template-rows: 1fr auto;
  min-height: 100dvh;
}

@media (max-width: 767px) {
  .shell {
    grid-template-areas:
      "main"
      "status";
    grid-template-columns: 1fr;
  }
}
```

**Acceptance Criteria:**

- [ ] `(app)` route group created with dedicated layout
- [ ] Desktop: Sidebar (left, w-64, fixed), Main (scrollable), StatusBar (bottom)
- [ ] Mobile: Main (full width, scrollable), StatusBar (bottom), Sidebar via Sheet
- [ ] `<main>` is the only scrollable container
- [ ] Sidebar and StatusBar remain fixed during scroll
- [ ] Lighthouse CLS score < 0.1 on page load
- [ ] No JavaScript required for dimension calculation
- [ ] Breakpoint transition at `md:` (768px) via CSS only
- [ ] Layout accepts `children` prop for page content
- [ ] `protocol-zero.sh` passes

**Zero-CLS Verification:**

1. Run `pnpm build && pnpm start`
2. Open Chrome DevTools → Rendering → Layout Shift Regions
3. Hard refresh page; no blue highlight flashes should appear
4. Run Lighthouse performance audit; CLS must be < 0.1

---

## Definition of Done (Epic Level)

- [ ] All 5 stories complete with acceptance criteria met
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] `protocol-zero.sh` passes on all changed files
- [ ] All changes merged via PR workflow
- [ ] No AI attribution in commits, code, or comments
- [ ] Lighthouse CLS < 0.1 verified

---

## File Manifest

| File                               | Story      | Type   | Purpose                  |
| ---------------------------------- | ---------- | ------ | ------------------------ |
| `app/globals.css`                  | S-SHELL-01 | Modify | Add shadcn token aliases |
| `components/ui/card.tsx`           | S-SHELL-01 | Create | Card primitive           |
| `app/layout.tsx`                   | S-SHELL-02 | Modify | Add metadata export      |
| `app/providers.tsx`                | S-SHELL-02 | Create | Provider wrapper         |
| `components/shell/Sidebar.tsx`     | S-SHELL-03 | Create | Desktop navigation       |
| `components/shell/MobileSheet.tsx` | S-SHELL-03 | Create | Mobile navigation        |
| `lib/config/navigation.ts`         | S-SHELL-03 | Create | Nav config               |
| `components/shell/StatusBar.tsx`   | S-SHELL-04 | Create | Status display           |
| `app/(app)/layout.tsx`             | S-SHELL-05 | Create | Shell composition        |
