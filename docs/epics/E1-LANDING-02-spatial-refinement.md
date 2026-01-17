# Epic: Deepening the Inhabited Void: Landing Page Spatial Refinement

**Epic ID:** E1-LANDING-02
**Status:** Ready for Implementation
**Dependencies:** E1-LANDING-01 (Contemplative Threshold), E1-SHELL-01 (Application Shell)

---

## Overview

This epic executes a precision refinement pass on the landing page to shift its ontological status from "interface" to "environment." It dismantles remaining SaaS-like structures—specifically the scrolling header, utilitarian sidebar states, and redundant footer—to establish a "Zero UI" baseline where the system feels like a dormant, biological presence. The work focuses on tightening typographic rhythm, enforcing atmospheric stability through light/dark moods (Paper vs. Void), and consolidating status indicators into a singular, peripheral heartbeat. The goal is to make the user feel they have entered a quiet study where an intelligence is waiting, not a dashboard demanding input.

---

## Architectural Decisions (Resolved)

### ADR-01: Scroll-Aware Header Strategy

**Decision:** New Floating Header Component with IntersectionObserver

**Rationale:** The existing Sidebar header ("Claude's Home" text) and mobile header bar serve distinct purposes. A new floating header component provides unified behavior across breakpoints without compromising existing navigation patterns. IntersectionObserver provides performant, declarative scroll detection without scroll event listeners.

**Implementation:**

- Create `FloatingHeader` client component using IntersectionObserver API
- Observe the `<h1>` greeting element as intersection target
- Header materializes when greeting exits viewport (threshold: 0, rootMargin: 0px)
- Applies to both mobile and desktop viewports

### ADR-02: Sidebar Active State Styling

**Decision:** Text Weight Shift Only (No Background)

**Rationale:** Background color changes create visual noise that conflicts with the "heavy, immovable walls" metaphor. Typography-based differentiation maintains hierarchy without disrupting spatial stability.

**Implementation:**

- Active state: `font-semibold` (600) with `text-text-primary`
- Inactive state: `font-medium` (500) with `text-text-secondary`
- Hover state: `text-text-primary` transition (200ms), no background change
- Remove all `bg-surface` and `hover:bg-surface` from navigation items

### ADR-03: Theme System Architecture

**Decision:** CSS Custom Properties with System Preference Detection

**Rationale:** Pure CSS approach aligns with Tailwind v4 philosophy. System preference detection respects user accessibility settings. localStorage persistence enables manual override.

**Implementation:**

- Define parallel token sets for light (`[data-theme="light"]`) and dark (`:root`) modes
- Use `@media (prefers-color-scheme: light)` for initial state
- Cross-dissolve transition via `transition: background-color 600ms, color 600ms`
- No React context required; CSS handles all state

### ADR-04: Heartbeat Component Architecture

**Decision:** Client Component with CSS Animation

**Rationale:** Hover interaction requires client-side event handling. CSS-only animation preserves battery life and reduces JavaScript overhead. Single component replaces two existing overlapping indicators.

**Implementation:**

- Remove `StatusBar` from `(app)/layout.tsx`
- Remove `SystemPresence` from landing page
- Create `Heartbeat` client component with pulse animation
- Position: fixed bottom-right (desktop) or bottom-left (mobile)

---

## Governance Requirements

**MANDATORY for all stories:**

1. **Frontend Governance Skill:** Activate `.claude/skills/frontend-development/SKILL.md` before implementation
2. **Design Intent Protocol:** Emit `<design_intent>` block before UI generation (conversation-only, never committed)
3. **Protocol Zero:** Execute `tools/protocol-zero.sh` on all changes before commit
4. **Anti-Slop Compliance:** All components must use semantic tokens exclusively
5. **PR Workflow:** All changes via feature branch and PR per CLAUDE.md §6.3
6. **Accessibility:** WCAG AA contrast ratios verified before merge

---

## Token Additions Reference

The following tokens must be added to `globals.css` for this epic:

### Backdrop Blur Token

```css
@theme {
  --blur-glass: 12px;
}
```

### Light Mode Palette (Paper Theme)

```css
[data-theme="light"],
:root:has([data-theme="light"]) {
  --color-void: oklch(97% 0.01 80); /* Warm paper white */
  --color-surface: oklch(94% 0.01 80); /* Subtle surface */
  --color-elevated: oklch(91% 0.01 80); /* Elevated surfaces */
  --color-text-primary: oklch(15% 0.02 260); /* Near-black text */
  --color-text-secondary: oklch(40% 0.02 260); /* Secondary text */
  --color-text-tertiary: oklch(55% 0.02 260); /* Tertiary text */
  --color-accent-cool: oklch(50% 0.15 250); /* Darker blue for contrast */
  --color-accent-warm: oklch(55% 0.18 50); /* Darker orange */
  --color-accent-dream: oklch(55% 0.2 320); /* Darker purple */
}
```

### Mode Transition

```css
:root {
  transition:
    background-color 600ms ease,
    color 600ms ease;
}

* {
  transition:
    background-color 600ms ease,
    color 600ms ease,
    border-color 600ms ease;
}
```

---

## Story Table

| Order | Story ID      | Story Title                            | Points | Description                                                                                                                                                                                                   |
| ----- | ------------- | -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | ST-LANDING-01 | Establish "Zero UI" Floating Header    | 5      | Create new `FloatingHeader` client component that remains invisible at rest and materializes via opacity transition when the `<h1>` greeting scrolls out of view. Uses backdrop-filter blur for glass effect. |
| 2     | ST-LANDING-02 | Stabilize Sidebar as "Home Anchor"     | 3      | Refactor Sidebar to remove background-based hover/active states. Implement text weight differentiation (font-medium/font-semibold) for state indication.                                                      |
| 3     | ST-LANDING-03 | Enforce Contemplative Reading Rhythm   | 2      | Enforce strict 65ch max-width and 1.7+ line-height on landing content. Center content column with balanced void margins.                                                                                      |
| 4     | ST-LANDING-04 | Consolidate System Pulse (Heartbeat)   | 5      | Remove `StatusBar` and `SystemPresence` components. Create unified `Heartbeat` indicator with 4s+ breathing animation and hover-reveal text.                                                                  |
| 5     | ST-LANDING-05 | Atmospheric Mood System (Void + Paper) | 8      | Implement complete light/dark mode token system. Paper (light) uses warm off-whites; Void (dark) preserves current palette. Cross-dissolve transition > 500ms.                                                |
| 6     | ST-LANDING-06 | Implement Biological "Resolve" Motion  | 8      | Refine all entry animations to use "resolve" effect with minimal movement (< 4px). Add blur-clearing keyframe. Reduce breathing variance to sub-perceptual.                                                   |

**Total Story Points:** 31

---

## Story Details

### ST-LANDING-01: Establish "Zero UI" Floating Header

**Prerequisites:** E1-LANDING-01, E1-SHELL-01 complete

**Deliverables:**

1. `components/shell/FloatingHeader.tsx` - Client component with scroll detection
2. `app/(app)/layout.tsx` - Updated to include FloatingHeader
3. `globals.css` - Add `--blur-glass` token

**Implementation Spec:**

```typescript
interface FloatingHeaderProps {
  targetRef: RefObject<HTMLElement>; // Reference to greeting h1
}
```

- Use `IntersectionObserver` with `threshold: 0` and `rootMargin: "0px"`
- Observe the `<h1>` greeting element passed via ref
- When `isIntersecting: false`, header becomes visible
- Header content: "Claude's Home" text (matches Sidebar header)

**Acceptance Criteria:**

- [ ] Header element has `opacity-0` and `pointer-events-none` when scroll Y = 0
- [ ] Header transitions to `opacity-100` after `<h1>` greeting exits viewport
- [ ] Background uses `backdrop-filter: blur(var(--blur-glass))`
- [ ] Fallback for browsers without backdrop-filter: solid `bg-void/80`
- [ ] Transition uses opacity only (no slide/transform animations)
- [ ] Works on both mobile and desktop viewports
- [ ] `protocol-zero.sh` passes

---

### ST-LANDING-02: Stabilize Sidebar as "Home Anchor"

**Prerequisites:** ST-LANDING-01 complete

**Deliverables:**

1. `components/shell/Sidebar.tsx` - Updated styling

**Acceptance Criteria:**

- [ ] Hovering a nav item does NOT trigger a background color change
- [ ] Hovering triggers a text color transition (`text-text-secondary` to `text-text-primary`)
- [ ] Transition duration is 200ms or greater
- [ ] Active state uses `font-semibold` (600) with `text-text-primary`
- [ ] Inactive state uses `font-medium` (500) with `text-text-secondary`
- [ ] No `bg-surface` or `hover:bg-surface` classes on nav items
- [ ] Sidebar border color uses `border-elevated` token
- [ ] `protocol-zero.sh` passes

---

### ST-LANDING-03: Enforce Contemplative Reading Rhythm

**Prerequisites:** None

**Deliverables:**

1. `app/(app)/page.tsx` - Updated content container styling
2. `globals.css` - Verify/update `.prose-landing` class

**Acceptance Criteria:**

- [ ] Content container `max-width` is strictly `65ch`
- [ ] Base line-height is `1.7` or `1.8`
- [ ] Greeting `<h1>` uses `--font-heading` with tracking `-0.02em`
- [ ] Content column is horizontally centered
- [ ] Vertical margins position content at optical center in initial viewport
- [ ] Protective void space visible on both sides of content column
- [ ] `protocol-zero.sh` passes

---

### ST-LANDING-04: Consolidate System Pulse (Heartbeat)

**Prerequisites:** ST-LANDING-01 complete (for layout refactoring)

**Deliverables:**

1. `components/shell/Heartbeat.tsx` - New unified status indicator
2. `app/(app)/layout.tsx` - Remove StatusBar, add Heartbeat
3. Delete or deprecate `components/shell/StatusBar.tsx`
4. Delete or deprecate `components/landing/SystemPresence.tsx`

**Implementation Spec:**

```typescript
interface HeartbeatProps {
  architecture?: string; // Default: "Memory-01"
  location?: string; // Default: "Helsinki"
  status?: string; // Default: "Nominal"
}
```

**Heartbeat Animation Keyframe:**

```css
@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
}
```

**Acceptance Criteria:**

- [ ] Original `StatusBar` component removed from layout
- [ ] Original `SystemPresence` component removed from layout
- [ ] `Heartbeat` component created as client component
- [ ] Breathing animation cycle duration > 4 seconds
- [ ] Default state shows only colored dot (no text)
- [ ] Dot uses `--color-accent-cool` color
- [ ] Hover reveals text: "Memory-01 · Helsinki · Nominal"
- [ ] Text uses middot separator (·, U+00B7)
- [ ] Position: fixed, bottom-right periphery (desktop), bottom-left (mobile)
- [ ] `protocol-zero.sh` passes

---

### ST-LANDING-05: Atmospheric Mood System (Void + Paper)

**Prerequisites:** ST-LANDING-03 complete

**Deliverables:**

1. `globals.css` - Complete light mode token palette
2. `globals.css` - Mode transition styles
3. `components/shell/ThemeToggle.tsx` - Optional toggle component
4. `lib/hooks/useTheme.ts` - Theme detection and persistence hook

**Light Mode Token Palette (Paper Theme):**

| Token                    | Value                 | Purpose                   |
| ------------------------ | --------------------- | ------------------------- |
| `--color-void`           | `oklch(97% 0.01 80)`  | Warm paper background     |
| `--color-surface`        | `oklch(94% 0.01 80)`  | Card/surface backgrounds  |
| `--color-elevated`       | `oklch(91% 0.01 80)`  | Elevated elements         |
| `--color-text-primary`   | `oklch(15% 0.02 260)` | Primary text (near-black) |
| `--color-text-secondary` | `oklch(40% 0.02 260)` | Secondary text            |
| `--color-text-tertiary`  | `oklch(55% 0.02 260)` | Tertiary text             |

**Acceptance Criteria:**

- [ ] Light mode background is NOT pure white (`#ffffff`)
- [ ] Light mode uses warm, paper-like tone (80° hue angle)
- [ ] Dark mode preserves current void palette unchanged
- [ ] Mode toggle triggers CSS transition > 500ms
- [ ] Transition uses `ease` timing function
- [ ] Text contrast ratios pass WCAG AA (4.5:1 minimum)
- [ ] System preference (`prefers-color-scheme`) detected on initial load
- [ ] Theme choice persists via localStorage
- [ ] No "pure black on pure white" combinations in light mode
- [ ] `protocol-zero.sh` passes

**Contrast Verification:**

Use browser DevTools or external tool to verify:

- Primary text on void: ≥ 4.5:1
- Secondary text on void: ≥ 4.5:1
- Accent colors on void: ≥ 3:1 (for non-text elements)

---

### ST-LANDING-06: Implement Biological "Resolve" Motion

**Prerequisites:** ST-LANDING-04 complete

**Deliverables:**

1. `globals.css` - Updated animation keyframes
2. All components using entry animations - Updated classes

**Resolve Keyframe Specification:**

```css
@keyframes resolve {
  from {
    opacity: 0;
    transform: translateY(3px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```

**Updated Breathe Keyframe:**

```css
@keyframes breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.99; /* Sub-perceptual variance */
  }
}
```

**Acceptance Criteria:**

- [ ] All entry animations use `animate-resolve` keyframes
- [ ] `translateY` values in animations are ≤ 4px
- [ ] `resolve` keyframe includes blur-clearing (blur: 2px → 0)
- [ ] Background breathing opacity variance is sub-perceptual (0.99 to 1.0)
- [ ] No bounce, slide, or elastic timing functions
- [ ] Motion is disabled entirely if `prefers-reduced-motion: reduce` is true
- [ ] Reduced motion users see instant `opacity: 1`, no transform/blur
- [ ] Existing reveal animation delays preserved (delay-1 through delay-6)
- [ ] `protocol-zero.sh` passes

---

## Definition of Done (Epic Level)

- [ ] All 6 stories complete with acceptance criteria met
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] `protocol-zero.sh` passes on all changed files
- [ ] All changes merged via PR workflow
- [ ] No AI attribution in commits, code, or comments
- [ ] WCAG AA contrast ratios verified for both themes
- [ ] `prefers-reduced-motion` behavior tested and functional

---

## File Manifest

| File                                    | Story                 | Type   | Purpose                        |
| --------------------------------------- | --------------------- | ------ | ------------------------------ |
| `globals.css`                           | ST-LANDING-01, 05, 06 | Modify | Tokens, keyframes, transitions |
| `components/shell/FloatingHeader.tsx`   | ST-LANDING-01         | Create | Scroll-aware header            |
| `components/shell/Sidebar.tsx`          | ST-LANDING-02         | Modify | Remove bg hover states         |
| `app/(app)/page.tsx`                    | ST-LANDING-03         | Modify | Reading rhythm styling         |
| `components/shell/Heartbeat.tsx`        | ST-LANDING-04         | Create | Unified status pulse           |
| `components/shell/StatusBar.tsx`        | ST-LANDING-04         | Delete | Replaced by Heartbeat          |
| `components/landing/SystemPresence.tsx` | ST-LANDING-04         | Delete | Replaced by Heartbeat          |
| `app/(app)/layout.tsx`                  | ST-LANDING-01, 04     | Modify | Layout composition             |
| `lib/hooks/useTheme.ts`                 | ST-LANDING-05         | Create | Theme detection hook           |
| `components/shell/ThemeToggle.tsx`      | ST-LANDING-05         | Create | Optional toggle UI             |

---

## Testing Checklist

### Visual Regression

- [ ] Landing page renders correctly at 320px, 768px, 1280px, 1920px widths
- [ ] Floating header appears/disappears correctly on scroll
- [ ] Sidebar hover states use text-only transitions
- [ ] Heartbeat animation runs smoothly (60fps)
- [ ] Light/dark mode transition is smooth (no flash)

### Accessibility

- [ ] Tab navigation functional through all interactive elements
- [ ] Screen reader announces header state changes
- [ ] Reduced motion preference disables all animations
- [ ] Color contrast passes WCAG AA in both themes

### Performance

- [ ] No Cumulative Layout Shift on page load (CLS < 0.1)
- [ ] Animations use GPU-accelerated properties (transform, opacity)
- [ ] No scroll jank during header transition
