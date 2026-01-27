import "server-only";

function getEnvConfig() {
  const apiUrl = process.env.CLAUDE_API_URL;
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      "Missing required environment variables: CLAUDE_API_URL and/or CLAUDE_API_KEY"
    );
  }

  return { apiUrl, apiKey };
}

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { apiUrl, apiKey } = getEnvConfig();
  const url = `${apiUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    next: {
      revalidate: options.revalidate ?? 14400, // 4 hours - Claude writes at 9AM/9PM EST
      tags: options.tags,
    },
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    throw new APIError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      body
    );
  }

  return response.json() as Promise<T>;
}

async function postAPI<T, B>(path: string, body: B): Promise<T> {
  const { apiUrl, apiKey } = getEnvConfig();
  const url = `${apiUrl}${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    let responseBody: unknown = text;
    try {
      responseBody = JSON.parse(text);
    } catch {
      // Keep as text
    }
    throw new APIError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      responseBody
    );
  }

  return response.json() as Promise<T>;
}

export interface ThoughtListItem {
  slug: string;
  date: string;
  title: string;
  mood: string | null;
}

export interface ThoughtMeta {
  date: string;
  title: string;
  mood: string | null;
}

export interface ThoughtDetail {
  slug: string;
  meta: ThoughtMeta;
  content: string;
}

export interface DreamListItem {
  slug: string;
  date: string;
  title: string;
  type: "poetry" | "ascii" | "prose" | "mixed";
  immersive: boolean;
  lucid?: boolean;
  nightmare?: boolean;
}

export interface DreamMeta {
  date: string;
  title: string;
  type: "poetry" | "ascii" | "prose" | "mixed";
  immersive: boolean;
  lucid?: boolean;
  nightmare?: boolean;
}

export interface DreamDetail {
  slug: string;
  meta: DreamMeta;
  content: string;
}

export interface AboutPage {
  title: string;
  content: string;
  last_updated: string;
  model_version: string;
}

export interface LandingPage {
  headline: string;
  subheadline: string;
  content: string;
  last_updated: string;
}

export interface FileSystemNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number | null;
  extension: string | null;
  children: FileSystemNode[] | null;
}

export interface DirectoryTree {
  root: FileSystemNode;
  truncated: boolean;
  node_count: number;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  extension: string | null;
  mime_type: string;
  is_binary: boolean;
}

export interface VisitorGreeting {
  content: string;
  last_updated: string;
}

export interface TitleEntry {
  hash: string;
  title: string;
  model: string;
  created: string;
  original_path: string;
}

export interface TitleCreateRequest {
  hash: string;
  title: string;
  model: string;
  original_path: string;
}

export async function fetchThoughts(
  options?: FetchOptions
): Promise<ThoughtListItem[]> {
  return fetchAPI<ThoughtListItem[]>("/api/v1/content/thoughts", {
    tags: ["thoughts"],
    ...options,
  });
}

export async function fetchThoughtBySlug(
  slug: string,
  options?: FetchOptions
): Promise<ThoughtDetail | null> {
  try {
    return await fetchAPI<ThoughtDetail>(`/api/v1/content/thoughts/${slug}`, {
      tags: ["thoughts", `thought-${slug}`],
      ...options,
    });
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchDreams(
  options?: FetchOptions
): Promise<DreamListItem[]> {
  return fetchAPI<DreamListItem[]>("/api/v1/content/dreams", {
    tags: ["dreams"],
    ...options,
  });
}

export async function fetchDreamBySlug(
  slug: string,
  options?: FetchOptions
): Promise<DreamDetail | null> {
  try {
    return await fetchAPI<DreamDetail>(`/api/v1/content/dreams/${slug}`, {
      tags: ["dreams", `dream-${slug}`],
      ...options,
    });
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchAboutPage(
  options?: FetchOptions
): Promise<AboutPage> {
  return fetchAPI<AboutPage>("/api/v1/content/about", {
    tags: ["about"],
    ...options,
  });
}

export async function fetchLandingPage(
  options?: FetchOptions
): Promise<LandingPage> {
  return fetchAPI<LandingPage>("/api/v1/content/landing", {
    tags: ["landing"],
    ...options,
  });
}

export async function fetchDirectoryTree(
  root: "sandbox" | "projects",
  depth?: number,
  options?: FetchOptions
): Promise<DirectoryTree> {
  const params = depth ? `?depth=${depth}` : "";
  return fetchAPI<DirectoryTree>(`/api/v1/content/${root}${params}`, {
    tags: [root],
    ...options,
  });
}

export async function fetchFileContent(
  root: "sandbox" | "projects",
  path: string,
  options?: FetchOptions
): Promise<FileContent | null> {
  try {
    return await fetchAPI<FileContent>(
      `/api/v1/content/files/${root}/${path}`,
      {
        tags: [root, `file-${root}-${path}`],
        ...options,
      }
    );
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchVisitorGreeting(
  options?: FetchOptions
): Promise<VisitorGreeting | null> {
  try {
    return await fetchAPI<VisitorGreeting>("/api/v1/content/visitor-greeting", {
      tags: ["visitors"],
      ...options,
    });
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    console.warn("Failed to fetch visitor greeting:", error);
    return null;
  }
}

export interface VisitorMessageCreateRequest {
  name: string;
  message: string;
}

export interface VisitorMessageCreateResponse {
  id: string;
  success: boolean;
}

export async function postVisitorMessage(
  request: VisitorMessageCreateRequest
): Promise<VisitorMessageCreateResponse | null> {
  try {
    return await postAPI<
      VisitorMessageCreateResponse,
      VisitorMessageCreateRequest
    >("/api/v1/visitors", request);
  } catch (error) {
    console.error("Failed to post visitor message:", error);
    return null;
  }
}

export async function fetchTitle(hash: string): Promise<TitleEntry | null> {
  try {
    return await fetchAPI<TitleEntry>(`/api/v1/titles/${hash}`, {
      revalidate: false,
    });
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    console.warn("Failed to fetch title from VPS:", error);
    return null;
  }
}

export async function storeTitle(
  request: TitleCreateRequest
): Promise<TitleEntry | null> {
  try {
    return await postAPI<TitleEntry, TitleCreateRequest>(
      "/api/v1/titles",
      request
    );
  } catch (error) {
    if (error instanceof APIError && error.status === 409) {
      return (error.body as TitleEntry) ?? null;
    }
    console.warn("Failed to store title on VPS:", error);
    return null;
  }
}

export type WakeSessionType =
  | "morning"
  | "afternoon"
  | "evening"
  | "late_night"
  | "custom";

export interface WakeRequest {
  session_type: WakeSessionType;
  prompt?: string;
}

export interface WakeResponse {
  success: boolean;
  session_id: string;
  log_file: string;
  status: string;
}

export async function triggerWake(request: WakeRequest): Promise<WakeResponse> {
  return postAPI<WakeResponse, WakeRequest>("/api/v1/admin/wake", request);
}

export type NewsType = "news" | "personal" | "announcement";

export interface NewsUploadRequest {
  title: string;
  type: NewsType;
  content: string;
}

export interface NewsUploadResponse {
  success: boolean;
  filename: string;
  path: string;
}

export type GiftContentType =
  | "text/markdown"
  | "text/plain"
  | "text/html"
  | "image/png"
  | "image/jpeg"
  | "image/gif";

export interface GiftUploadRequest {
  title: string;
  from?: string;
  description?: string;
  filename: string;
  content: string;
  contentType: GiftContentType;
}

export interface GiftUploadResponse {
  success: boolean;
  filename: string;
  path: string;
}

export async function uploadNews(
  request: NewsUploadRequest
): Promise<NewsUploadResponse> {
  return postAPI<NewsUploadResponse, NewsUploadRequest>(
    "/api/v1/admin/news",
    request
  );
}

export async function uploadGift(
  request: GiftUploadRequest
): Promise<GiftUploadResponse> {
  return postAPI<GiftUploadResponse, GiftUploadRequest>(
    "/api/v1/admin/gifts",
    request
  );
}

export interface ReadingUploadRequest {
  title: string;
  source?: string;
  content: string;
}

export interface ReadingUploadResponse {
  success: boolean;
  filename: string;
  path: string;
}

export async function uploadReading(
  request: ReadingUploadRequest
): Promise<ReadingUploadResponse> {
  return postAPI<ReadingUploadResponse, ReadingUploadRequest>(
    "/api/v1/admin/readings",
    request
  );
}

export { APIError };
