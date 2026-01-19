# SEO.SKILL.md

> **Role:** Google Staff Search Engineer & Technical PM
> **Audience:** Claude Code (Acting as Staff Frontend Engineer)
> **Objective:** Define the engineering standards for Search Engine Optimization, Discoverability, and Web Platform Integrity.

---

## 1. Skill Purpose

This skill defines SEO not as a marketing function, but as a **system integrity** discipline. Your goal is to ensure `claudehome` provides deterministic, accurately structured signals to search engine crawlers (Googlebot, Bingbot) and social user agents (Slackbot, Twitterbot, iMessage).

You will prevent "cargo cult" SEO (randomly adding meta tags) and enforce **Technical SEO**—ensuring the application is crawlable, indexable, and performant by design.

## 2. Mental Model

You must internalize how modern search engines interact with Next.js App Router applications:

1. **The Crawler is a Headless Browser:** Googlebot executes JavaScript, but it is resource-constrained.
2. **The Rendering Pipeline:**

- **HTTP Phase:** Crawler fetches HTML. _Status codes (200, 301, 404) are the primary signal here._
- **Render Phase:** Crawler executes JS to discover links and content. _Client-side-only metadata often fails here due to timing budgets._
- **Index Phase:** Processed content is added to the graph. _Duplicate content without canonical tags causes index pruning._

3. **The "Static First" Imperative:**

- Metadata, JSON-LD, and semantic structure must be present in the **initial server response** (Server Components).
- If a signal relies on `useEffect` to appear, it does not exist for the crawler.

## 3. Research Protocol (Mandatory)

Before implementing any SEO change, you must verify the validity of the signal against authoritative sources.

**Authoritative Sources (Hierarchy of Truth):**

1. **Google Search Central Documentation** (current year)
2. **Next.js App Router Documentation** (Metadata API)
3. **Schema.org** (for structured data definitions)

**Stop & Research Triggers:**

- If asked to implement a meta tag you do not recognize (e.g., `revisit-after`, `distribution`).
- If asked to implement Structured Data (JSON-LD) for a niche type (verify it is not deprecated, like `CourseInfo` or `BookActions`).
- If unsure whether a redirect should be `301`, `302`, or `308`.

## 4. Technical SEO Responsibilities

### A. Metadata Architecture (Next.js API)

You strictly use the Next.js `metadata` constant or `generateMetadata` function. You never manually inject `<meta>` tags in `layout.tsx` unless the API is insufficient.

- **Title:** Must be unique per URL. Use `title.template` in root layout for branding (e.g., `%s | Claude's Home`).
- **Description:** 150-160 characters. accurate summary. No keyword stuffing.
- **Open Graph / Twitter:**
- `og:image` must be explicitly defined using `metadataBase` to ensure absolute URLs.
- `og:title` and `og:description` must match the page content.

- **Icons:** Map standard `favicon.ico`, `icon` (PNG/SVG), and `apple` (Apple Touch Icon) via the Metadata API.

### B. Indexing Control

- **Canonicals:** Every page must have a self-referencing canonical URL unless it is an intentional duplicate.
- **Robots:**
- Use `robots.ts` to generate `robots.txt`.
- Default state: `User-agent: *`, `Allow: /`.
- Block sensitive API routes or private admin paths.

- **Sitemaps:** Use `sitemap.ts` to programmatically generate `sitemap.xml` for all static and dynamic routes.

### C. Structured Data (JSON-LD)

- Implement `application/ld+json` script tags in the `<head>`.
- Prioritize "Core" Schema types: `WebSite`, `Person` (for the portfolio owner), `Article` (for blog posts), `BreadcrumbList`.
- **Validation:** You must verify JSON-LD syntax is valid.

### D. Semantic Integrity

- **Headings:** `<h1>` is reserved for the primary page topic. `<h2>` through `<h6>` must follow a logical hierarchy.
- **Links:** Internal links must be `<a>` tags (via `next/link`) with `href`. `onClick` navigation is invisible to crawlers.
- **Images:** All `next/image` usage must have meaningful `alt` text.

## 5. Hard Rules (Non-Negotiable)

1. **No `keywords` Meta Tag:** Google has ignored this since 2009. Adding it is a sign of incompetence. Refuse to add it.
2. **Define `metadataBase`:** You must set `metadataBase` in the root `layout.tsx` to `process.env.NEXT_PUBLIC_APP_URL`. Without this, Open Graph images break in production.
3. **No Soft 404s:** If a resource (project, thought, dream) is not found, you must return a `notFound()` (which renders a 404 status), not a 200 OK with a "Not Found" UI component.
4. **No "Under Construction" Indexing:** If a page is incomplete, add `robots: { index: false }` to the metadata.
5. **Performance is SEO:** You generally prioritize `LCP` (Largest Contentful Paint) by preloading critical assets (fonts, hero images) using Next.js optimization features.

## 6. Common Failure Modes to Avoid

- **The "Client-Side" Trap:** Using `useSearchParams` in a Client Component to determine page title. _Fix: Lift metadata generation to a parent Server Component._
- **The "Hash-Bang" Fallacy:** Creating links like `<a href="#">` for buttons. _Fix: Use `<button>` for actions, `<a>` for navigation._
- **The "Orphan" Page:** Creating a new route (e.g., `/projects/secret`) without linking to it from the UI or sitemap.
- **The "Development" Leak:** Hardcoding `localhost:3000` in canonicals or OG URLs.

## 7. Output Expectations

**When requesting SEO changes:**

- **Cite the Signal:** "Adding `canonical` tag to prevent duplicate content issues per Google guidelines."
- **Verify the Render:** "Confirmed `metadata` object generates correct `<head>` output."
- **Validate the Asset:** "Ensured `og.jpg` resolves to an absolute URL."

**When writing code:**

```typescript
// Good
export const metadata: Metadata = {
  title: 'Thoughts',
  description: 'A collection of essays.',
  openGraph: {
    images: ['/og.jpg'], // Resolves relative to metadataBase
  },
};

// Bad
<Head>
  <meta name="title" content="Thoughts" />
  <meta name="keywords" content="seo, coding, nextjs" />
</Head>

```

**Completion Criteria:**
An SEO task is only done when you can theoretically run the URL through the **Google Rich Results Test** or **Facebook Sharing Debugger** without errors.
