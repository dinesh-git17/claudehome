# E1-CONTENT-01: Markdown Processing & Transformation Pipeline

**Status:** Ready for Implementation
**Priority:** High
**Dependencies:** E1-DATA-01 (Core Filesystem DAL) ✓

---

## Epic Description

This epic establishes the canonical server-side pipeline for transforming raw Markdown content strings into secure, optimized React render trees. It engineers a unified-based processing chain (`remark` → `rehype`) that handles AST parsing and build-time syntax highlighting using `rehype-pretty-code`. The pipeline implements strict HAST-level sanitization via `rehype-sanitize` to neutralize XSS vectors while preserving semantic richness.

All transformation occurs hermetically on the server during SSG/ISR cycles, guaranteeing zero client-side runtime overhead.

---

## Architectural Decisions

### AD-01: Layer Separation

**Decision:** The pipeline extends the existing DAL pattern rather than replacing it.

- **DAL Layer** (`lib/server/dal/`): Owns file I/O, frontmatter extraction via `gray-matter`, and Zod schema validation. Returns typed DTOs with raw `content: string`.
- **Pipeline Layer** (`lib/server/content/`): Owns AST transformation, sanitization, and React compilation. Consumes content strings from DAL output.
- **Integration Point:** Page components invoke the pipeline with content from repository DTOs.

**Rationale:** Separation of concerns. Data fetching remains decoupled from presentation transformation.

### AD-02: Sanitization Strategy

**Decision:** Use `rehype-sanitize` as the canonical sanitization mechanism. Deprecate `sanitize-html` usage.

- Sanitization occurs at the HAST (tree) level before React compilation.
- String-based post-processing is eliminated as redundant.
- The existing `sanitizer.ts` module will be marked for deprecation once pipeline is stable.

**Rationale:** Pipeline integrity. AST-level sanitization is more reliable than string manipulation for nested structures.

### AD-03: Syntax Highlighting Theme

**Decision:** Build a custom Shiki theme using OKLCH CSS variables from `globals.css`.

Token mappings will reference semantic design tokens:

```
comment    → var(--color-text-tertiary)
string     → var(--color-accent-warm)
keyword    → var(--color-accent-cool)
function   → var(--color-text-primary)
variable   → var(--color-text-secondary)
```

**Rationale:** System consistency. Hardcoded hex values would violate the OKLCH semantic token system and break future theming.

### AD-04: Pipeline Integration Pattern

**Decision:** Consumers call the pipeline; repositories return raw data.

- Repositories return typed objects with `content: string` (raw markdown).
- Page/layout components invoke `<MarkdownRenderer content={thought.content} />`.
- The pipeline is not invoked within repository functions.

**Rationale:** Pure data access. Repositories should return DTOs, not UI artifacts.

---

## Technical Constraints

### Dependencies to Install

```json
{
  "dependencies": {
    "unified": "^11.0.0",
    "remark-parse": "^11.0.0",
    "remark-gfm": "^4.0.0",
    "remark-rehype": "^11.0.0",
    "rehype-sanitize": "^6.0.0",
    "rehype-pretty-code": "^0.14.0",
    "rehype-external-links": "^3.0.0",
    "hast-util-to-jsx-runtime": "^2.0.0",
    "shiki": "^1.0.0"
  }
}
```

### Directory Structure

```
apps/web/src/lib/server/content/
├── index.ts                 # Public exports
├── pipeline.ts              # Unified processor chain
├── sanitize-schema.ts       # Deny-by-default HAST schema
├── shiki-theme.ts           # Custom OKLCH theme definition
├── components.ts            # React component mappings
└── __tests__/
    ├── pipeline.test.ts
    └── xss-vectors.test.ts
```

### Boundary Protection

All modules in `lib/server/content/` must import `server-only` at the top of each file to enforce server-side execution.

---

## Governance Requirements

### Protocol Zero Compliance

All implementation code must pass `tools/protocol-zero.sh` validation before commit:

```bash
./tools/protocol-zero.sh                      # Scan codebase
./tools/protocol-zero.sh --commit-msg "..."   # Validate commit message
```

No AI attribution markers, scaffolding comments, or conversational artifacts permitted in code, comments, or commit messages.

### Commit Protocol

Follow Conventional Commits format:

- `feat(content): implement AST parsing primitive`
- `feat(content): add HAST sanitization layer`
- `test(content): add XSS vector test coverage`

---

## Story Table

| Order | Story ID     | Story Title                              | Points | Description                                                                                   |
| ----- | ------------ | ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| 1     | S-CONTENT-01 | AST Parsing Primitive                    | 3      | Implement the base processing function that consumes raw content strings and generates MDAST. |
| 2     | S-CONTENT-02 | HTML Transformation & Sanitization Layer | 5      | Convert MDAST to HAST with strict deny-by-default sanitization.                               |
| 3     | S-CONTENT-03 | Build-Time Syntax Highlighting           | 5      | Integrate Shiki with custom OKLCH theme for code block tokenization.                          |
| 4     | S-CONTENT-04 | React Component Compiler                 | 3      | Convert sanitized HAST to React Server Component tree.                                        |

---

## S-CONTENT-01: AST Parsing Primitive

### Description

Implement the base processing function that ingests raw markdown content strings (from DAL repository output) and generates a structured Markdown AST (MDAST). Initialize the `unified` processor with `remark-parse` and `remark-gfm`.

**Input:** Raw markdown string (frontmatter already stripped by DAL)
**Output:** MDAST `Root` node

### Acceptance Criteria

1. Function signature: `parseMarkdown(content: string): Root`
2. Function accepts raw markdown string (no file I/O).
3. Returns strictly typed MDAST `Root` node from `mdast` types.
4. `remark-gfm` plugin active (tables, strikethrough, autolinks supported).
5. Performance: Sub-5ms parsing for 5KB content strings (measured without syntax highlighting).
6. Unit tests verify GFM features: tables, task lists, strikethrough, autolinks.
7. Module imports `server-only`.
8. Passes `tools/protocol-zero.sh` validation.

### Technical Notes

- Re-export `Root` type from `mdast` for consumer typing.
- Do not handle frontmatter; assume content is pre-processed by DAL `readContent()`.

---

## S-CONTENT-02: HTML Transformation & Sanitization Layer

### Description

Extend the pipeline to convert MDAST into HAST using `remark-rehype`. Implement strict HAST-level sanitization using `rehype-sanitize` with a deny-by-default schema. Configure `rehype-external-links` to enforce secure attributes on external links.

### Sanitization Schema

**Allowed Tags:**

```
p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote,
pre, code, em, strong, a, br, hr, table, thead, tbody, tr, th, td
```

**Allowed Attributes:**

```
a: [href, title, rel, target]
code: [class]  // For language class from syntax highlighting
pre: [class, data-*]  // For rehype-pretty-code metadata
th, td: [align]
```

**Stripped:**

- All `on*` event handlers
- `javascript:`, `vbscript:`, `data:` URI schemes
- `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>` tags
- `style` attributes (inline styles)

**Enforced:**

- External links receive `rel="noopener noreferrer"` and `target="_blank"`
- Internal links (same-origin, relative paths) remain unmodified

### Acceptance Criteria

1. Input MDAST transforms to valid HAST.
2. `<script>`, `<iframe>`, `onclick`, and `javascript:` URIs are stripped.
3. External links automatically receive `rel="noopener noreferrer" target="_blank"`.
4. Internal links (relative paths, same-origin) use standard `<a>` without target override.
5. XSS test suite includes minimum 20 vectors from OWASP XSS Filter Evasion Cheat Sheet.
6. Valid semantic HTML tags are preserved.
7. GFM table structure (`table`, `thead`, `tbody`, `tr`, `th`, `td`) preserved.
8. Module imports `server-only`.
9. Passes `tools/protocol-zero.sh` validation.

### XSS Test Coverage Requirements

Test suite must include vectors for:

- Script injection (`<script>`, `<img onerror>`, `<svg onload>`)
- URI scheme abuse (`javascript:`, `vbscript:`, `data:text/html`)
- Attribute injection (`onclick`, `onmouseover`, `onfocus`)
- Encoding bypasses (HTML entities, URL encoding, Unicode)
- Nested/malformed tags

---

## S-CONTENT-03: Build-Time Syntax Highlighting

### Description

Integrate `rehype-pretty-code` (powered by Shiki) into the transformation chain. Create a custom Shiki theme that maps syntax tokens to OKLCH CSS variables from `globals.css`. Tokenization occurs at build time; no client-side JS runtime required.

### Custom Theme Token Mapping

```typescript
const oklchTheme = {
  name: "contemplative",
  type: "dark",
  colors: {
    "editor.background": "var(--color-surface)",
    "editor.foreground": "var(--color-text-primary)",
  },
  tokenColors: [
    {
      scope: ["comment"],
      settings: { foreground: "var(--color-text-tertiary)" },
    },
    { scope: ["string"], settings: { foreground: "var(--color-accent-warm)" } },
    {
      scope: ["keyword"],
      settings: { foreground: "var(--color-accent-cool)" },
    },
    {
      scope: ["variable"],
      settings: { foreground: "var(--color-text-secondary)" },
    },
    {
      scope: ["function"],
      settings: { foreground: "var(--color-text-primary)" },
    },
    {
      scope: ["constant", "number"],
      settings: { foreground: "var(--color-accent-dream)" },
    },
    // ... additional mappings
  ],
};
```

### Acceptance Criteria

1. Code blocks (` ```ts `) transform to syntax-highlighted HTML spans.
2. Highlighting uses CSS variables from `globals.css`; no hardcoded hex/RGB values.
3. No client-side JS runtime added for syntax highlighting.
4. Line highlighting syntax (`{1,3-5}`) functions via data attributes.
5. Line numbers rendered when specified (` ```ts showLineNumbers `).
6. Unsupported languages fallback to plain text gracefully (no errors).
7. Shiki grammar loading limited to common languages: `typescript`, `javascript`, `tsx`, `jsx`, `json`, `bash`, `python`, `css`, `html`, `markdown`, `yaml`.
8. Module imports `server-only`.
9. Passes `tools/protocol-zero.sh` validation.

### Technical Notes

- Do not implement clipboard functionality; out of scope.
- Theme must be defined as a standalone module for testability.
- Consider lazy grammar loading if build times exceed acceptable thresholds.

---

## S-CONTENT-04: React Component Compiler

### Description

Finalize the pipeline by converting the sanitized, highlighted HAST into a React Server Component tree using `hast-util-to-jsx-runtime`. Define component mappings for optimized rendering.

### Component Mappings

| HTML Element   | React Component      | Notes                                                                                                                 |
| -------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `img`          | Standard `<img>`     | Content images use native element (no dimension requirements). For optimized images, use explicit `NextImage` in MDX. |
| `a` (internal) | `next/link`          | Relative paths and same-origin URLs use client-side routing.                                                          |
| `a` (external) | `<a>`                | External links remain standard anchors with security attributes.                                                      |
| `pre`          | Custom `<CodeBlock>` | Wrapper for syntax-highlighted blocks with optional copy button hook.                                                 |

### Internal Link Detection

A link is considered internal if:

1. `href` starts with `/` (relative path), OR
2. `href` starts with `#` (anchor), OR
3. `href` hostname matches `window.location.hostname` (handled at render time)

All other links are external.

### Acceptance Criteria

1. `MarkdownRenderer` Server Component accepts `content: string` prop.
2. Component is strictly server-side (`server-only` import enforced).
3. Internal links use `next/link` for client-side routing.
4. External links use standard `<a>` with secure attributes.
5. Content images render as standard `<img>` elements (no dimension errors).
6. No React `key` warnings in list rendering.
7. Exported types: `MarkdownRendererProps`, `MarkdownComponents`.
8. Error boundary handles malformed input gracefully (renders error message, does not throw).
9. Passes `tools/protocol-zero.sh` validation.

### Public API

```typescript
// lib/server/content/index.ts
export { MarkdownRenderer } from "./renderer";
export type { MarkdownRendererProps } from "./renderer";
export { parseMarkdown } from "./pipeline";
export type { Root as MarkdownAST } from "mdast";
```

---

## Migration Notes

### Deprecation: `sanitizer.ts`

Once the content pipeline is stable and integrated:

1. Remove `sanitize-html` from dependencies.
2. Delete `lib/server/dal/sanitizer.ts`.
3. Update any direct consumers to use `MarkdownRenderer` instead.

Timeline: Deprecation to occur in subsequent epic after pipeline validation.

---

## Test Strategy

### Unit Tests

- Pipeline parsing correctness (GFM features)
- Sanitization schema enforcement
- Component mapping behavior
- Error handling for malformed input

### Security Tests

- XSS vector neutralization (minimum 20 vectors)
- URI scheme filtering
- Attribute stripping verification

### Integration Tests

- End-to-end rendering with mock content
- Repository → Pipeline → Component flow

### Performance Tests

- 5KB content parsing benchmark (target: <5ms)
- Full pipeline benchmark with syntax highlighting (document baseline)
