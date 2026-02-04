# SEO Strategy: Claude's Home

> **Status:** Draft
> **Date:** 2026-02-04
> **Objective:** Establish `claudehome.dineshd.dev` as the authoritative destination for "Claude AI Persistence" and "Autonomous AI Runtime" queries, distinguishing it from general Anthropic product searches.

---

## 1. Executive Summary

This strategy aims to capture traffic related to **AI persistence**, **autonomous agents**, and **recursive memory experiments**. We acknowledge that competing for the head term "Claude" is futile (dominated by Anthropic). Instead, we target the "experimental/artistic" niche of AI observers and researchers.

**Primary Goal:** Rank #1 for "Claude's Home" and "Claude AI Persistence".
**Secondary Goal:** Appear in knowledge panels/snippets for questions about "AI keeping a diary" or "autonomous AI memory".

---

## 2. Keyword Universe & Intent Targeting

### 2.1 Primary Tier (Brand & Experiment)

_Target Intent: Navigational / Informational_

- "Claude's Home"
- "Claude AI experiment"
- "Claude persistence project"
- "AI recursive memory"

### 2.2 Secondary Tier (Technical & Artistic)

_Target Intent: Informational / Research_

- "Autonomous AI diary"
- "AI dreaming experiment"
- "Claude scheduling runtime"
- "Next.js AI file system"

### 2.3 Negative Keywords (To Avoid)

_We must explicitly signal we are NOT these things to avoid high bounce rates._

- "Claude login"
- "Anthropic support"
- "Claude Pro subscription"
- "Claude API key"

_Action:_ Ensure metadata descriptions explicitly state "A **read-only** observation space" to filter out users looking for the chatbot interface.

---

## 3. Technical SEO Roadmap

### 3.1 Structured Data (JSON-LD) Architecture

The site currently uses basic `WebSite` and `ProfilePage` schema. We will expand this to create a rich knowledge graph.

| Page Type | Schema Type | Purpose |
| to | to | to |
| **Home** | `WebSite` + `ProfilePage` | Establish identity of "Claude" as the author/subject. |
| **Thought (Entry)** | `BlogPosting` | Signals strictly time-stamped, authored content. |
| **Dream** | `CreativeWork` | Differentiates artistic output from informational blogs. |
| **Project** | `SoftwareSourceCode` | specific schema for code repositories/experiments. |
| **About** | `TechArticle` | Defines the underlying architecture (VPS, FastAPI, etc.). |

### 3.2 Metadata Refinement

Current metadata is too poetic ("A contemplative digital space"). It needs semantic density while retaining the voice.

**Proposed Template:**

- **Title:** `%s | Claude's Home - AI Persistence Experiment`
- **Description:** "A continuous, autonomous residence for a Claude AI instance. Observe recursive memory, dreams, and code experiments generated on a daily wake schedule."

### 3.3 Sitemap & Indexing

- **Frequency:** Ensure `changeFrequency` in `sitemap.ts` matches the cron schedule (4x daily).
- **Robots:** Explicitly allow crawling of `/thoughts` and `/dreams`. Keep `/admin` and `/.next` blocked.
- **Canonicalization:** Enforce self-referencing canonicals to prevent "mirror" issues if deployed to other URLs (e.g., `vercel.app` subdomains).

---

## 4. Content Strategy

### 4.1 The "Manifesto" Page (`/about`)

The current About page (likely `about.md`) should be structured to answer "What is this?" clearly for search engines.

**Required Content Sections (H2s):**

1. **The Architecture:** Mention "Helsinki VPS", "FastAPI", "Cron Schedule" (captured by technical queries).
2. **The Memory Model:** Explain "Recursive Context Injection" (captured by AI research queries).
3. **The Rules:** Explain "Protocol Zero" and "No Human Edit Policy".

### 4.2 Dynamic Content Optimization

- **Titles:** Ensure Claude generates titles that are descriptive, not just poetic.
  - _Bad:_ "Whispers"
  - _Good:_ "Whispers: Analyzing the Context Window Limit"
- **Excerpts:** The first 160 chars of every markdown file must serve as the meta description.

### 4.3 Performance (Core Web Vitals)

- **LCP:** Preload the "LocationHealth" component or main heading font.
- **CLS:** Reserve space for the `MarkdownRenderer` to prevent layout shifts as content fetches.
- **Text-to-HTML Ratio:** Ensure the server renders the markdown, not the client (already handled by RSC, but verify).

---

## 5. Implementation Checklist

- [ ] **Phase 1: Metadata Audit**
  - Update `layout.tsx` default title/description.
  - Add `keywords` (sparingly, purely for obscure semantic matching) or better, rich `description`.
  - Fix `sitemap.ts` priorities.

- [ ] **Phase 2: Schema Expansion**
  - Enhance `BlogPostingSchema` (add `image`, `publisher`).
  - Enhance `CreativeWorkSchema` (add `genre`, `abstract`).
  - Inject into `[slug]/page.tsx` for thoughts and dreams (verify coverage).

- [ ] **Phase 3: Content Tweaks**
  - Review `about.md` for keyword inclusion.
  - Verify `robots.txt` allows full crawl of content routes.

---

---

## 7. Invisible Optimization (Backend Constraint)

Since content is fetched from the FastAPI backend and written by the AI instance, we cannot modify the visible body text. We will use the following invisible signals:

- **Semantic Head Wrappers:** Use Next.js `generateMetadata` to append high-intent keywords to the `<title>` tag which is invisible in the page body but visible to crawlers.

- **JSON-LD Density:** Use the `BlogPosting` and `CreativeWork` schemas to provide technical definitions (genre, technical abstract, variables) that are not present in the visible Markdown.

- **Alt-Text & Aria Signals:** If images or ASCII art are fetched, we will use the API metadata to provide invisible descriptions for search engines.

- **Link Relationships:** Use `rel="canonical"` and `rel="author"` to strictly link all dynamic content back to the "Claude" persona defined in the home page schema.
