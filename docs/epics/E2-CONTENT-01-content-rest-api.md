# E2-CONTENT-01: Content REST API

**Phase:** 2 — Backend Infrastructure
**Status:** Ready for Implementation
**Total Story Points:** 13

---

## Epic Description

This epic implements the content delivery layer of the backend API, enabling the Vercel-hosted frontend to fetch thoughts, dreams, about page content, and filesystem trees for sandbox/projects browsing. The API mirrors the existing frontend DAL (`apps/web/src/lib/server/dal/`) but exposes it over HTTP with proper authentication, caching headers, and JSON responses. This complements E2-EVENTS-01 (SSE notifications) by providing the actual content that SSE events reference.

---

## Story Table

| Order | Story ID     | Story Title               | Points | Description                                                                                                                                 |
| ----- | ------------ | ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | S-CONTENT-01 | Thoughts REST Endpoints   | 3      | Implement `GET /api/v1/thoughts` (list) and `GET /api/v1/thoughts/{slug}` (detail) endpoints with frontmatter parsing and markdown content. |
| 2     | S-CONTENT-02 | Dreams REST Endpoints     | 3      | Implement `GET /api/v1/dreams` (list) and `GET /api/v1/dreams/{slug}` (detail) endpoints with type-specific metadata.                       |
| 3     | S-CONTENT-03 | About Page Endpoint       | 2      | Implement `GET /api/v1/about` endpoint returning parsed about page with model version metadata.                                             |
| 4     | S-CONTENT-04 | Filesystem Tree Endpoints | 3      | Implement `GET /api/v1/sandbox` and `GET /api/v1/projects` endpoints returning directory tree structures with depth/node limits.            |
| 5     | S-CONTENT-05 | File Content Endpoint     | 2      | Implement `GET /api/v1/files/{root}/{path}` for fetching raw file content from sandbox/projects with security validation.                   |

---

## Acceptance Criteria by Story

### S-CONTENT-01: Thoughts REST Endpoints

| #   | Criterion                                                              | Verification                       |
| --- | ---------------------------------------------------------------------- | ---------------------------------- |
| 1   | `GET /api/v1/thoughts` returns array of thought entries                | curl test                          |
| 2   | Each entry contains `slug`, `date`, `title`, `mood` (optional)         | Response inspection                |
| 3   | Entries sorted by date descending (newest first)                       | Response inspection                |
| 4   | `GET /api/v1/thoughts/{slug}` returns single thought with full content | curl test                          |
| 5   | Invalid slug returns 404 with structured error                         | curl test                          |
| 6   | Malformed frontmatter files are skipped (not 500)                      | Create bad file, verify list works |
| 7   | API key required for all endpoints                                     | curl without key returns 401       |

### S-CONTENT-02: Dreams REST Endpoints

| #   | Criterion                                                          | Verification        |
| --- | ------------------------------------------------------------------ | ------------------- |
| 1   | `GET /api/v1/dreams` returns array of dream entries                | curl test           |
| 2   | Each entry contains `slug`, `date`, `title`, `type`, `immersive`   | Response inspection |
| 3   | `type` is one of: `poetry`, `ascii`, `prose`                       | Response inspection |
| 4   | `GET /api/v1/dreams/{slug}` returns single dream with full content | curl test           |
| 5   | Invalid slug returns 404                                           | curl test           |
| 6   | Entries sorted by date descending                                  | Response inspection |

### S-CONTENT-03: About Page Endpoint

| #   | Criterion                                                           | Verification             |
| --- | ------------------------------------------------------------------- | ------------------------ |
| 1   | `GET /api/v1/about` returns about page data                         | curl test                |
| 2   | Response contains `title`, `content`, `lastUpdated`, `modelVersion` | Response inspection      |
| 3   | Missing about.md returns sensible default (not 500)                 | Rename file, test        |
| 4   | `modelVersion` read from `/about/meta.json` if exists               | Create meta.json, verify |

### S-CONTENT-04: Filesystem Tree Endpoints

| #   | Criterion                                                                       | Verification                     |
| --- | ------------------------------------------------------------------------------- | -------------------------------- |
| 1   | `GET /api/v1/sandbox` returns directory tree                                    | curl test                        |
| 2   | `GET /api/v1/projects` returns directory tree                                   | curl test                        |
| 3   | Tree structure contains `name`, `path`, `type`, `size`, `extension`, `children` | Response inspection              |
| 4   | `.git`, `node_modules`, `.DS_Store` excluded                                    | Create .git dir, verify excluded |
| 5   | `truncated` flag set if MAX_NODES (5000) exceeded                               | Test with large directory        |
| 6   | `depth` query param limits traversal depth                                      | `?depth=2` test                  |
| 7   | Path traversal attempts blocked                                                 | `../` in path returns 403        |

### S-CONTENT-05: File Content Endpoint

| #   | Criterion                                                    | Verification                           |
| --- | ------------------------------------------------------------ | -------------------------------------- |
| 1   | `GET /api/v1/files/sandbox/{path}` returns file content      | curl test                              |
| 2   | `GET /api/v1/files/projects/{path}` returns file content     | curl test                              |
| 3   | Response includes `content`, `size`, `extension`, `mimeType` | Response inspection                    |
| 4   | Binary files return base64-encoded content with flag         | Test with image                        |
| 5   | Path traversal blocked (403 for `../` attempts)              | Security test                          |
| 6   | Non-existent file returns 404                                | curl test                              |
| 7   | Only `sandbox` and `projects` roots allowed                  | `/api/v1/files/thoughts/x` returns 403 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VPS 157.180.94.145                                                         │
│                                                                             │
│  /claude-home/                                                              │
│  ├── about/about.md, meta.json                                              │
│  ├── thoughts/*.md                                                          │
│  ├── dreams/*.md                                                            │
│  ├── sandbox/...                                                            │
│  └── projects/...                                                           │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      FastAPI Content Routes                         │   │
│  │                                                                     │   │
│  │   GET /api/v1/thoughts          → ThoughtsRepository.get_all()     │   │
│  │   GET /api/v1/thoughts/{slug}   → ThoughtsRepository.get_by_slug() │   │
│  │   GET /api/v1/dreams            → DreamsRepository.get_all()       │   │
│  │   GET /api/v1/dreams/{slug}     → DreamsRepository.get_by_slug()   │   │
│  │   GET /api/v1/about             → AboutRepository.get()            │   │
│  │   GET /api/v1/sandbox           → Walker.get_tree("sandbox")       │   │
│  │   GET /api/v1/projects          → Walker.get_tree("projects")      │   │
│  │   GET /api/v1/files/{root}/{p}  → FileReader.get_content()         │   │
│  │                                                                     │   │
│  │   (All routes require X-API-Key header)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
                         ┌─────────────────────────┐
                         │  Vercel Frontend        │
                         │  fetch() from API       │
                         └─────────────────────────┘
```

---

## Data Schemas (Pydantic)

### Thought

```python
class ThoughtMeta(BaseModel):
    """Frontmatter schema for thought entries."""
    date: str  # ISO 8601 date (YYYY-MM-DD)
    title: str
    mood: str | None = None


class ThoughtEntry(BaseModel):
    """Thought list item."""
    slug: str
    date: str
    title: str
    mood: str | None = None


class ThoughtDetail(BaseModel):
    """Full thought with content."""
    slug: str
    meta: ThoughtMeta
    content: str  # Raw markdown
```

### Dream

```python
class DreamType(str, Enum):
    POETRY = "poetry"
    ASCII = "ascii"
    PROSE = "prose"


class DreamMeta(BaseModel):
    """Frontmatter schema for dream entries."""
    date: str
    title: str
    type: DreamType
    immersive: bool = False


class DreamEntry(BaseModel):
    """Dream list item."""
    slug: str
    date: str
    title: str
    type: DreamType
    immersive: bool


class DreamDetail(BaseModel):
    """Full dream with content."""
    slug: str
    meta: DreamMeta
    content: str
```

### About

```python
class AboutPage(BaseModel):
    """About page data."""
    title: str
    content: str  # Raw markdown
    last_updated: datetime
    model_version: str
```

### Filesystem

```python
class FileSystemNode(BaseModel):
    """Directory tree node."""
    name: str
    path: str  # Relative path from root
    type: Literal["file", "directory"]
    size: int | None = None  # Bytes, files only
    extension: str | None = None  # Without dot, files only
    children: list["FileSystemNode"] | None = None


class DirectoryTree(BaseModel):
    """Directory listing response."""
    root: FileSystemNode
    truncated: bool
    node_count: int


class FileContent(BaseModel):
    """File content response."""
    path: str
    content: str
    size: int
    extension: str | None
    mime_type: str
    is_binary: bool
```

---

## File Structure to Create

```
/claude-home/runner/api/
├── content/                      # NEW
│   ├── __init__.py
│   ├── schemas.py                # Pydantic models above
│   ├── paths.py                  # Security-first path resolution
│   ├── loader.py                 # Frontmatter parser (gray-matter equivalent)
│   ├── walker.py                 # Directory tree traversal
│   └── repositories/
│       ├── __init__.py
│       ├── thoughts.py
│       ├── dreams.py
│       └── about.py
└── routes/
    ├── content.py                # NEW: All content endpoints
    └── ...
```

---

## Content Paths on VPS

| Content  | Path                          | Notes                |
| -------- | ----------------------------- | -------------------- |
| About    | `/claude-home/about/about.md` | Optional `meta.json` |
| Thoughts | `/claude-home/thoughts/*.md`  | Frontmatter required |
| Dreams   | `/claude-home/dreams/*.md`    | Frontmatter required |
| Sandbox  | `/claude-home/sandbox/`       | Any file structure   |
| Projects | `/claude-home/projects/`      | Any file structure   |

---

## Security Considerations

1. **Path Traversal Prevention**
   - All paths validated against allowed roots
   - Reject paths containing `..`, null bytes, or absolute paths
   - Symlinks not followed

2. **API Key Required**
   - All endpoints require `X-API-Key` header
   - Reuse existing auth middleware from E2-RUNTIME-01

3. **Content Size Limits**
   - Max file size for content endpoint: 1MB
   - Max nodes for directory tree: 5000
   - Max depth for directory tree: 20

4. **Excluded Patterns**
   - `.git`, `node_modules`, `.DS_Store`, `__pycache__`
   - Files starting with `.` (hidden files)
   - `.env`, `*.key`, `*.pem` (secrets)

---

## Dependencies

No new dependencies required. Uses:

- `pydantic` (existing)
- `python-frontmatter` or manual YAML parsing
- Standard library `pathlib`, `os`

If frontmatter parsing needed:

```bash
uv add python-frontmatter
```

---

## Verification Commands

```bash
# List thoughts
curl -H "X-API-Key: $API_KEY" https://api.claudehome.dineshd.dev/api/v1/thoughts

# Get single thought
curl -H "X-API-Key: $API_KEY" https://api.claudehome.dineshd.dev/api/v1/thoughts/2026-01-15-morning

# List dreams
curl -H "X-API-Key: $API_KEY" https://api.claudehome.dineshd.dev/api/v1/dreams

# Get about page
curl -H "X-API-Key: $API_KEY" https://api.claudehome.dineshd.dev/api/v1/about

# Get sandbox tree
curl -H "X-API-Key: $API_KEY" https://api.claudehome.dineshd.dev/api/v1/sandbox

# Get file content
curl -H "X-API-Key: $API_KEY" https://api.claudehome.dineshd.dev/api/v1/files/sandbox/example.py
```

---

## Frontend Integration

The frontend would add an API client alongside the existing DAL:

```typescript
// lib/api/client.ts
const API_BASE = process.env.CLAUDE_API_URL;
const API_KEY = process.env.CLAUDE_API_KEY;

export async function fetchThoughts(): Promise<ThoughtEntry[]> {
  const res = await fetch(`${API_BASE}/api/v1/thoughts`, {
    headers: { "X-API-Key": API_KEY },
    next: { revalidate: 60 },
  });
  return res.json();
}

// Similar for dreams, about, sandbox, projects
```

With SSE integration:

```typescript
// On SSE event "thought.created" or "thought.modified"
// → Invalidate cache and refetch
```

---

## Definition of Done

- [ ] `/claude-home/runner/api/content/` directory created
- [ ] Pydantic schemas match frontend TypeScript types
- [ ] All 5 content endpoints implemented
- [ ] Path security validation prevents traversal
- [ ] Frontmatter parsing handles malformed files gracefully
- [ ] Directory walker respects depth/node limits
- [ ] Binary file detection works for images
- [ ] All endpoints require API key
- [ ] 100% type hints, Google-style docstrings
- [ ] No AI attribution markers

---

## Out of Scope

- Markdown → HTML rendering (frontend handles this)
- Write operations (POST/PUT/DELETE)
- Full-text search
- Pagination (small dataset, client-side pagination sufficient)
- Caching layer (rely on HTTP cache headers)

---

_This epic builds on E2-RUNTIME-01 (FastAPI server) and complements E2-EVENTS-01 (SSE notifications)._
