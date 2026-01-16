# E1-JOURNAL-01: Journal & Dream Viewer Implementation

**Status:** Ready for Implementation
**Priority:** High
**Phase:** 1
**Dependencies:**

- E1-CONTENT-01 (Markdown Processing Pipeline) ✓
- E1-DATA-01 (Core Filesystem DAL) ✓
- E1-DATA-02 (Singleton Content Source) ✓
- E1-SHELL-01 (Application Shell) ✓

---

## Epic Description

This epic delivers the primary content consumption interfaces for the application, implementing the user-facing "Thoughts" (Chronological Journal) and "Dreams" (Abstract/Creative) domains. It leverages Next.js Server Components to render high-performance, zero-client-JS reading experiences by default, utilizing `generateStaticParams` to pre-build known filesystem paths into static HTML at build time.

The implementation introduces a distinct "Reading Mode" typographic system that departs from the UI-heavy application shell, prioritizing long-form readability, semantic structure, and typographic rhythm. Incremental Static Regeneration (ISR) with a 60-second revalidation window ensures new content becomes available without full rebuilds.

---

## Architectural Decisions

### AD-01: Typography System

**Decision:** Implement a dedicated reading typography system using Literata (Google Font) as the primary reading typeface.

- **Typeface:** Literata (variable weight, optimized for screen reading)
- **Typescale:** Major Third ratio (1.25), 18px base
- **Line Length:** `max-w-prose` (~65ch) on tablet/desktop, full-width with padding on mobile
- **Line Height:** `leading-relaxed` (1.625) for body text

**Rationale:** Literata was designed specifically for long-form digital reading. The 1.25 modular scale provides mathematically consistent hierarchy without manual tweaking.

### AD-02: Color Mode

**Decision:** Dark mode only for Phase 1.

**Rationale:** The Contemplative design system is explicitly dark/dim. Light mode doubles the testing matrix and is deferred to a future phase.

### AD-03: Pagination Strategy

**Decision:** URL search parameters (`?page=N`) for server-rendered pagination.

**Rationale:** Query parameter pagination is shareable, SSG/ISR compatible, and requires zero client-side JavaScript.

### AD-04: Grid Layout (Dreams)

**Decision:** Standard CSS Grid with uniform row heights, not true masonry.

**Rationale:** True masonry disrupts reading order or requires JavaScript. CSS Grid ensures predictable, accessible tab-index order without complexity.

### AD-05: Dream Type Rendering

**Decision:** Polymorphic rendering based on `type` metadata field.

| Type     | Rendering Strategy                                          |
| -------- | ----------------------------------------------------------- |
| `prose`  | Standard markdown pipeline                                  |
| `poetry` | Custom parser (single newline → `<br>`), centered alignment |
| `ascii`  | Monospace, `whitespace-pre`, `overflow-x-auto`              |

**Rationale:** Each creative format has distinct presentation requirements that cannot be served by a single renderer.

### AD-06: SVG Type Removal

**Decision:** Remove `svg` from `DreamTypeEnum`. Not supported in Phase 1.

**Rationale:** Inline SVG introduces XSS vectors requiring complex sanitization beyond the text-optimized markdown pipeline.

### AD-07: Immersive Mode

**Decision:** Add `immersive: z.boolean().default(false)` to `DreamSchema`.

**Rationale:** Sidebar hiding must be an explicit editorial choice, not magic behavior based on content type.

---

## Technical Specifications

### Typography Token Additions (`globals.css`)

```css
@theme {
  /* Reading Mode Typography */
  --font-prose: "Literata", Georgia, "Times New Roman", serif;

  /* Typescale: Major Third (1.25 ratio), 18px base */
  --prose-base: 1.125rem; /* 18px */
  --prose-sm: 0.9rem; /* 14.4px */
  --prose-lg: 1.406rem; /* 22.5px - h4 */
  --prose-xl: 1.758rem; /* 28.1px - h3 */
  --prose-2xl: 2.197rem; /* 35.2px - h2 */
  --prose-3xl: 2.746rem; /* 43.9px - h1 */

  /* Vertical Rhythm */
  --prose-leading: 1.625;
  --prose-heading-leading: 1.2;
}
```

### Schema Modifications

**DreamSchema Update:**

```typescript
export const DreamTypeEnum = z.enum(["poetry", "ascii", "prose"]);

export const DreamSchema = z.object({
  date: z.string().date(),
  title: z.string().min(1),
  type: DreamTypeEnum,
  immersive: z.boolean().default(false),
});
```

### Reading Time Utility

```typescript
// lib/utils/reading-time.ts
const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
```

### ISR Configuration

All list and detail routes use `revalidate = 60` (60 seconds).

---

## Governance Requirements

### Protocol Zero Compliance

All implementation code must pass `tools/protocol-zero.sh` validation before commit:

```bash
./tools/protocol-zero.sh                      # Scan codebase
./tools/protocol-zero.sh --commit-msg "..."   # Validate commit message
```

No AI attribution markers, scaffolding comments, or conversational artifacts permitted.

### Commit Protocol

Follow Conventional Commits format:

- `feat(journal): implement reading mode typography system`
- `feat(journal): add thoughts list view with pagination`
- `feat(dreams): implement polymorphic dream renderer`

---

## Story Table

| Order | Story ID     | Story Title                              | Points | Description                                              |
| ----- | ------------ | ---------------------------------------- | ------ | -------------------------------------------------------- |
| 1     | S-JOURNAL-01 | Reading Mode Typography System           | 2      | Foundational typography components for long-form reading |
| 2     | S-JOURNAL-02 | Thoughts List View (Server Component)    | 3      | `/thoughts` index with pagination and ISR                |
| 3     | S-JOURNAL-03 | Thoughts Detail View & Static Generation | 5      | `/thoughts/[slug]` with generateStaticParams             |
| 4     | S-JOURNAL-04 | Dreams List View (Grid Layout)           | 3      | `/dreams` index with type-differentiated grid            |
| 5     | S-JOURNAL-05 | Polymorphic Dream Renderer               | 3      | `/dreams/[slug]` with type-aware rendering               |

---

## S-JOURNAL-01: Reading Mode Typography System

### Description

Implement the foundational typography components (`ProseWrapper`, `EntryHeader`, `Blockquote`) tailored for long-form reading. These components enforce the Contemplative design language: strictly limited line length, loosened line-height, and Literata serif font for body text.

### Component Specifications

**ProseWrapper**

```typescript
interface ProseWrapperProps {
  children: React.ReactNode;
}
```

- Enforces 65ch max-width on `md+` breakpoints
- Full width with `px-4` padding on mobile
- Applies `--font-prose` and `--prose-leading`

**EntryHeader**

```typescript
interface EntryHeaderProps {
  title: string;
  date: string;
  readingTime: number;
}
```

- Title uses `--prose-3xl` with `--font-prose`
- Date formatted as "January 16, 2026"
- Reading time displayed as "X min read"

**Blockquote**

```typescript
interface BlockquoteProps {
  children: React.ReactNode;
  citation?: string;
}
```

- Left border accent using `--color-accent-cool`
- Italic body text
- Optional citation in `--color-text-tertiary`

### Acceptance Criteria

1. `ProseWrapper` enforces 65ch max-width on `md+`, full-width with padding on mobile
2. Typescale follows Major Third (1.25) ratio with 18px base
3. Headings use Literata serif font family
4. Body text uses Literata with `leading-relaxed` (1.625)
5. Verified accessible contrast ratios (AA+) in dark mode
6. No `@tailwindcss/typography` plugin; custom implementation only
7. All components are Server Components
8. Passes `tools/protocol-zero.sh` validation

---

## S-JOURNAL-02: Thoughts List View (Server Component)

### Description

Construct the `/thoughts` index page as a Server Component. Fetch metadata via `getAllThoughts()` and render a reverse-chronological list. Implement server-side pagination via URL search params (`?page=N`). Use `loading.tsx` for Suspense skeleton.

### Acceptance Criteria

1. Page renders strictly on the server (0kb client JS for list)
2. Entries display date, title, and computed reading time (200 WPM)
3. Pagination via `?page=N` handles >20 items correctly (10 items per page)
4. Empty state renders minimal text: "The void is empty."
5. `loading.tsx` provides server-rendered skeleton during data fetch
6. `export const revalidate = 60` enables ISR
7. Passes `tools/protocol-zero.sh` validation

---

## S-JOURNAL-03: Thoughts Detail View & Static Generation

### Description

Build the `/thoughts/[slug]/page.tsx` route to display individual journal entries. Integrate the Markdown Pipeline to render content. Implement `generateStaticParams` to statically generate all existing files. Enable `dynamicParams = true` for ISR of new files.

### Acceptance Criteria

1. `generateStaticParams` correctly lists all files in build logs
2. Valid slugs render full markdown content with syntax highlighting
3. Invalid slugs return 404 with "Thought not found" message
4. New files added post-build viewable after 60-second revalidation
5. Navigation uses standard `<Link>` (browser handles scroll on back)
6. `export const revalidate = 60` enables ISR
7. Passes `tools/protocol-zero.sh` validation

---

## S-JOURNAL-04: Dreams List View (Grid Layout)

### Description

Develop the `/dreams` index page as a visually distinct gallery using CSS Grid (not masonry). Cards differentiate dream types via Lucide icons and accent borders. Same ISR and Server Component patterns as Thoughts list.

### Type Visual Indicators

| Type     | Icon       | Border Accent            |
| -------- | ---------- | ------------------------ |
| `poetry` | `Scroll`   | `--color-accent-dream`   |
| `ascii`  | `Terminal` | `--color-accent-cool`    |
| `prose`  | `FileText` | `--color-text-secondary` |

### Card Content

- Title (primary)
- Formatted date (secondary)
- Type indicator (icon + border)

### Acceptance Criteria

1. CSS Grid layout: 1 column mobile, 2 columns `sm`, 3 columns `md+`
2. Cards display title, date, and type indicator (icon + left border)
3. Hover states are subtle (opacity or border change, no layout shift)
4. Data fetching uses `getAllDreams()` function
5. Empty state renders: "The void is empty."
6. `export const revalidate = 60` enables ISR
7. Passes `tools/protocol-zero.sh` validation

---

## S-JOURNAL-05: Polymorphic Dream Renderer

### Description

Implement `/dreams/[slug]/page.tsx` with polymorphic rendering logic. Based on `type` metadata, switch rendering strategy:

- **prose:** Standard markdown pipeline via `MarkdownRenderer`
- **poetry:** Single newlines become `<br>`, centered alignment, preserved whitespace
- **ascii:** Monospace font, `whitespace-pre`, horizontal scroll on overflow

Support `immersive` metadata field to optionally hide the sidebar.

### Acceptance Criteria

1. `ascii` type renders in monospace with `overflow-x-auto` for horizontal scroll
2. `poetry` type renders with centered alignment; single newlines produce `<br>`
3. `prose` type uses standard `MarkdownRenderer` pipeline
4. `generateStaticParams` covers all dream files
5. `immersive: true` in frontmatter hides sidebar (passes prop to layout)
6. Invalid slugs return 404 with "Dream not found" message
7. `export const revalidate = 60` enables ISR
8. Passes `tools/protocol-zero.sh` validation

### Poetry Line Break Handling

The pipeline must be extended to treat single newlines as `<br>` tags only when `type: 'poetry'`. This preserves the author's intentional line breaks without requiring trailing spaces or blank lines.

---

## Directory Structure

```
apps/web/src/
├── app/
│   └── (app)/
│       ├── thoughts/
│       │   ├── page.tsx           # List view
│       │   ├── loading.tsx        # Suspense skeleton
│       │   └── [slug]/
│       │       └── page.tsx       # Detail view
│       └── dreams/
│           ├── page.tsx           # Grid view
│           ├── loading.tsx        # Suspense skeleton
│           └── [slug]/
│               └── page.tsx       # Polymorphic detail
├── components/
│   └── prose/
│       ├── ProseWrapper.tsx
│       ├── EntryHeader.tsx
│       ├── Blockquote.tsx
│       ├── PoetryRenderer.tsx
│       └── AsciiRenderer.tsx
└── lib/
    └── utils/
        └── reading-time.ts
```

---

## Test Strategy

### Unit Tests

- Typography component rendering
- Reading time calculation
- Pagination logic (page bounds, empty pages)

### Integration Tests

- List → Detail navigation flow
- `generateStaticParams` output verification
- Polymorphic rendering per dream type

### Visual Regression

- Typography at different viewport widths
- Grid layout responsiveness
- Type indicator styling

---

## Migration Notes

### Schema Change: DreamTypeEnum

Remove `svg` from the enum:

```diff
- export const DreamTypeEnum = z.enum(["poetry", "ascii", "svg", "prose"]);
+ export const DreamTypeEnum = z.enum(["poetry", "ascii", "prose"]);
```

Any existing dream files with `type: svg` must be migrated or removed before implementation.

### Schema Addition: immersive field

Add to DreamSchema:

```diff
  export const DreamSchema = z.object({
    date: z.string().date(),
    title: z.string().min(1),
    type: DreamTypeEnum,
+   immersive: z.boolean().default(false),
  });
```

Existing dream files without `immersive` field will default to `false` (sidebar visible).
