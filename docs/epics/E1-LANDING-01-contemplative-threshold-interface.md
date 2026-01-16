# Epic: Contemplative Threshold Interface

**Epic ID:** E1-LANDING-01
**Status:** Ready for Implementation
**Dependencies:** E1-SHELL-01 (Application Shell), E0-UI-01 (Tailwind v4), E0-GOV-02 (Frontend Governance)

---

## Overview

Transform the landing page from a standard content container into a "digital foyer" that viscerally establishes the system as a persistent, observing entity. The design leverages negative space ("The Void") and typographic authority to create a sense of intellectual intimacy and machine memory. This implementation strips away all "SaaS" artifacts (hero sections, marketing layouts) and replaces them with an interface that feels like a terminal into a living thought process.

This epic enforces the Contemplative Design System by prioritizing restraint, semantic token usage, and rejection of decorative noise.

---

## Architectural Decisions (Resolved)

### ADR-01: Optical Centering Strategy

**Decision:** CSS Flexbox with negative margin-top

**Rationale:** Optical centering requires moving the center of mass slightly above the geometric center. Using flex centering with a deterministic negative margin (e.g., `-mt-12` or `-mt-[5vh]`) is the most robust, responsive implementation. It avoids absolute positioning magic numbers and respects the "No magic numbers" anti-pattern in the Skill file.

**Implementation:** Full-height flex container with `items-center justify-center` and a slight upward offset via negative margin-top on the content block.

### ADR-02: Semantic Line Breaks

**Decision:** Content authoring responsibility

**Rationale:** "Semantic" line breaks imply that the break is part of the message's meaning (intent), not just a responsive necessity. In a "Contemplative" system, the system (author) dictates the cadence of the text, not the browser engine. This respects the "Design Intent" protocol over algorithmic wrapping.

**Implementation:** Authors control breaks via markdown content. No technical implementation required beyond proper text rendering. Line breaks in markdown content are respected.

### ADR-03: Landing-Specific Prose Styling

**Decision:** Create `.prose-landing` variant class

**Rationale:** The epic strictly scopes the work to "Landing page only" and forbids refactors elsewhere. Modifying the global `.prose-content` risks regressing other pages (About, Dreams, Thoughts). A targeted variant adheres to isolation constraint.

**Implementation:** Define `.prose-landing` in `globals.css` with landing-specific overrides (no underlines on links, wider paragraph spacing).

### ADR-04: System Status Data Source

**Decision:** Hardcoded in frontend

**Rationale:** The epic restricts scope to "No new features outside presentation." Extending the API constitutes a backend feature request. For the narrative purpose of "System Presence" (e.g., displaying "Architecture: Memory-01"), a static constant defined in the component is the correct "Presentation-only" implementation.

**Implementation:** Define `SYSTEM_STATUS` constant in landing page component with architecture and status strings.

---

## Governance Requirements

**MANDATORY for all stories:**

1. **Frontend Governance Skill:** Activate `.claude/skills/frontend-development/SKILL.md` before implementation
2. **Design Intent Protocol:** Emit `<design_intent>` block before UI generation (conversation-only, never committed)
3. **Protocol Zero:** Execute `tools/protocol-zero.sh` on all changes before commit
4. **Anti-Slop Compliance:** All components must use semantic tokens exclusively
5. **PR Workflow:** All changes via feature branch and PR per CLAUDE.md §6.3

---

## Design Tokens Reference

All tokens already exist in `globals.css`. No new tokens required.

| Token                    | Value                 | Usage                      |
| ------------------------ | --------------------- | -------------------------- |
| `--color-void`           | `oklch(8% 0.02 260)`  | Full-page background       |
| `--color-text-primary`   | `oklch(92% 0.01 260)` | Headline text              |
| `--color-text-secondary` | `oklch(65% 0.01 260)` | Subheadline text           |
| `--color-text-tertiary`  | `oklch(45% 0.01 260)` | System status text         |
| `--color-accent-cool`    | `oklch(70% 0.12 250)` | Link color                 |
| `--font-heading`         | Bricolage Grotesque   | Headline typography        |
| `--font-data`            | JetBrains Mono        | Subheadline, system status |
| `--font-prose`           | Literata              | Body content               |

---

## Story Table

| Order | Story ID     | Story Title                   | Points | Description                                                                                                                                                        |
| ----- | ------------ | ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | S-LANDING-01 | The Void Layout Architecture  | 3      | Refactor page layout to full-viewport flex structure. Replace `ProseWrapper` constraint with optically-centered container using flex + negative margin-top offset. |
| 2     | S-LANDING-02 | Typographic Voice & Hierarchy | 2      | Restyle headline to `font-heading` at display scale (5xl+) with tight tracking. Restyle subheadline to `font-data` for system-report aesthetic.                    |
| 3     | S-LANDING-03 | Temporal Entry Sequence       | 5      | Implement CSS-only entrance animation. Content resolves from opacity 0→100% over 1.5s+ with `ease-out`. Respect `prefers-reduced-motion`.                          |
| 4     | S-LANDING-04 | Semantic Markdown Styling     | 3      | Create `.prose-landing` variant with wider paragraph spacing and link styling (no underline, opacity hover).                                                       |
| 5     | S-LANDING-05 | System Status Artifacts       | 2      | Add "System Presence" footer with hardcoded metadata using `font-data`, anchored to bottom-left.                                                                   |

**Total Story Points:** 15

---

## Story Details

### S-LANDING-01: The Void Layout Architecture

**Prerequisites:** E1-SHELL-01 complete

**Deliverables:**

1. Refactored `app/(app)/page.tsx` with new layout structure
2. Removal of `ProseWrapper` dependency for landing page

**Layout Structure:**

```tsx
<div className="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center">
  <div className="-mt-12 w-full max-w-2xl px-6">
    {/* Content positioned slightly above geometric center */}
  </div>
</div>
```

**Acceptance Criteria:**

- [ ] Page background uses `bg-void` (via body default)
- [ ] Content is optically centered (flex center + `-mt-12` offset)
- [ ] No scrollbars visible on initial load when content fits viewport
- [ ] `ProseWrapper` removed from landing page (bypassed, not deleted globally)
- [ ] Content container has appropriate max-width (`max-w-2xl`)
- [ ] Responsive: full-width on mobile with `px-6` padding
- [ ] `protocol-zero.sh` passes

---

### S-LANDING-02: Typographic Voice & Hierarchy

**Prerequisites:** S-LANDING-01 complete

**Deliverables:**

1. Updated headline styling in `page.tsx`
2. Updated subheadline styling in `page.tsx`

**Typography Specification:**

| Element     | Font           | Size                               | Weight | Color                 | Tracking         |
| ----------- | -------------- | ---------------------------------- | ------ | --------------------- | ---------------- |
| Headline    | `font-heading` | `text-4xl md:text-5xl lg:text-6xl` | 500    | `text-text-primary`   | `tracking-tight` |
| Subheadline | `font-data`    | `text-base md:text-lg`             | 400    | `text-text-secondary` | Normal           |

**Acceptance Criteria:**

- [ ] Headline uses `font-heading` class
- [ ] Headline uses responsive sizing: `text-4xl md:text-5xl lg:text-6xl`
- [ ] Headline uses `tracking-tight` (-0.025em)
- [ ] Headline uses `text-text-primary`
- [ ] Subheadline uses `font-data` class
- [ ] Subheadline uses `text-text-secondary`
- [ ] Subheadline is smaller than headline (`text-base md:text-lg`)
- [ ] No bold weights used purely for emphasis
- [ ] Mobile text scales appropriately without overflow
- [ ] `protocol-zero.sh` passes

---

### S-LANDING-03: Temporal Entry Sequence

**Prerequisites:** S-LANDING-01 complete

**Deliverables:**

1. CSS keyframes definition in `globals.css`
2. Animation classes applied to landing content

**Animation Specification:**

```css
@keyframes resolve {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-resolve {
  animation: resolve 1.5s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-resolve {
    animation: none;
    opacity: 1;
  }
}
```

**Stagger Timing:**

| Element      | Delay | Rationale                     |
| ------------ | ----- | ----------------------------- |
| Headline     | 0ms   | Primary focus, resolves first |
| Subheadline  | 200ms | Secondary, follows headline   |
| Body content | 400ms | Tertiary, resolves last       |

**Acceptance Criteria:**

- [ ] Animation uses CSS keyframes only (no JavaScript)
- [ ] Duration is 1.5s
- [ ] Easing is `ease-out`
- [ ] Animation is opacity-only (no transform/movement)
- [ ] Elements stagger: 0ms, 200ms, 400ms
- [ ] `prefers-reduced-motion: reduce` disables animation entirely
- [ ] Animation fires on page mount (immediate)
- [ ] Keyframes defined in `globals.css` under `@layer utilities` or base
- [ ] `protocol-zero.sh` passes

---

### S-LANDING-04: Semantic Markdown Styling

**Prerequisites:** S-LANDING-01 complete

**Deliverables:**

1. `.prose-landing` class definition in `globals.css`
2. Applied to markdown container in `page.tsx`

**Styling Specification:**

```css
.prose-landing {
  font-family: var(--font-prose);
  font-size: var(--prose-base);
  line-height: var(--prose-leading);
  color: var(--color-text-primary);
}

.prose-landing p {
  margin-block: 2em; /* Wider than standard 1.25em */
}

.prose-landing a {
  color: var(--color-accent-cool);
  text-decoration: none;
  transition: opacity 150ms ease;
}

.prose-landing a:hover {
  opacity: 0.7;
}

.prose-landing pre,
.prose-landing code {
  background-color: var(--color-surface);
  border-radius: 0; /* Remove rounded corners for "blend" effect */
}
```

**Acceptance Criteria:**

- [ ] `.prose-landing` class defined in `globals.css` under `@layer components`
- [ ] Paragraphs have `margin-block: 2em` (wider spacing)
- [ ] Links use `text-accent-cool`
- [ ] Links have no underline (`text-decoration: none`)
- [ ] Link hover changes opacity to 0.7
- [ ] Code blocks use `bg-surface` without borders or rounded corners
- [ ] Base `.prose-content` class remains unchanged (no regression to other pages)
- [ ] `protocol-zero.sh` passes

---

### S-LANDING-05: System Status Artifacts

**Prerequisites:** S-LANDING-01 complete

**Deliverables:**

1. `SystemPresence` component or inline element in `page.tsx`
2. Hardcoded status constants

**Data Specification:**

```typescript
const SYSTEM_STATUS = {
  architecture: "Memory-01",
  status: "Nominal",
} as const;
```

**Positioning:**

- Fixed to bottom-left of the content container (not viewport)
- Uses `position: absolute` within the flex wrapper
- z-index: default (no layering conflicts expected)

**Acceptance Criteria:**

- [ ] Uses `font-data` class
- [ ] Uses `text-text-tertiary` color
- [ ] Anchored to bottom-left of container (`absolute bottom-0 left-0`)
- [ ] Text is uppercase (`uppercase`)
- [ ] Text is small (`text-xs`)
- [ ] Displays "ARCHITECTURE: MEMORY-01 • STATUS: NOMINAL" or similar format
- [ ] Data is hardcoded (no API call)
- [ ] Does not overlap main content on any viewport
- [ ] `protocol-zero.sh` passes

**Visual Example:**

```
ARCHITECTURE: MEMORY-01 • STATUS: NOMINAL
```

---

## Definition of Done (Epic Level)

- [ ] All 5 stories complete with acceptance criteria met
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] `protocol-zero.sh` passes on all changed files
- [ ] All changes merged via PR workflow
- [ ] No AI attribution in commits, code, or comments
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Mobile responsive verified on 375px viewport

---

## File Manifest

| File                 | Story                    | Type   | Purpose                                     |
| -------------------- | ------------------------ | ------ | ------------------------------------------- |
| `app/(app)/page.tsx` | S-LANDING-01, 02, 03, 05 | Modify | Landing page layout and content             |
| `app/globals.css`    | S-LANDING-03, 04         | Modify | Animation keyframes, `.prose-landing` class |

---

## Testing Checklist

1. **Visual Verification:**
   - [ ] Content appears optically centered (not mathematically centered)
   - [ ] Animation resolves smoothly over ~1.5s
   - [ ] No layout shift during animation
   - [ ] System status barely visible but readable

2. **Responsiveness:**
   - [ ] 375px (mobile): Text scales, no horizontal overflow
   - [ ] 768px (tablet): Balanced proportions
   - [ ] 1440px (desktop): Appropriate whitespace, not stretched

3. **Accessibility:**
   - [ ] `prefers-reduced-motion`: Animation disabled, content visible immediately
   - [ ] Color contrast meets WCAG AA (text-tertiary may be decorative)
   - [ ] Focus states preserved on interactive elements

4. **Performance:**
   - [ ] No JavaScript required for layout or animation
   - [ ] CLS < 0.1 (no layout shift)
   - [ ] FCP < 1.5s (content visible quickly despite animation delay)
