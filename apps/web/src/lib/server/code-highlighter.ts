import "server-only";

import { createHighlighter, type Highlighter } from "shiki";

import { contemplativeTheme } from "./content/shiki-theme";

export const MAX_FILE_SIZE = 524288; // 512KB

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  md: "markdown",
  css: "css",
  html: "html",
  yaml: "yaml",
  yml: "yaml",
  py: "python",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
};

const SUPPORTED_LANGUAGES = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "json",
  "markdown",
  "css",
  "html",
  "yaml",
  "python",
  "bash",
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [contemplativeTheme],
      langs: [...SUPPORTED_LANGUAGES],
    });
  }
  return highlighterPromise;
}

export function getLanguageFromExtension(extension: string): string {
  const normalized = extension.toLowerCase().replace(/^\./, "");
  return EXTENSION_TO_LANGUAGE[normalized] ?? "text";
}

export function isLanguageSupported(language: string): boolean {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(language);
}

export function isBinaryContent(content: string): boolean {
  // Check for null bytes or high concentration of non-printable characters
  const nullByteCount = (content.match(/\0/g) ?? []).length;
  if (nullByteCount > 0) {
    return true;
  }

  // Sample first 8KB for performance
  const sample = content.slice(0, 8192);
  let nonPrintable = 0;

  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    // Control characters except tab, newline, carriage return
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
      nonPrintable++;
    }
  }

  // If more than 10% non-printable, consider binary
  return sample.length > 0 && nonPrintable / sample.length > 0.1;
}

export interface HighlightResult {
  html: string;
  language: string;
  lineCount: number;
}

export async function highlightSourceCode(
  code: string,
  language: string
): Promise<HighlightResult> {
  const lines = code.split("\n");
  const lineCount = lines.length;

  // Fallback to plain text for unsupported languages
  const effectiveLanguage = isLanguageSupported(language) ? language : "text";

  if (effectiveLanguage === "text") {
    // Plain text rendering with HTML escaping
    const escaped = escapeHtml(code);
    return {
      html: `<pre class="shiki contemplative"><code>${escaped}</code></pre>`,
      language: "text",
      lineCount,
    };
  }

  const highlighter = await getHighlighter();

  const html = highlighter.codeToHtml(code, {
    lang: effectiveLanguage,
    theme: "contemplative",
  });

  return {
    html,
    language: effectiveLanguage,
    lineCount,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface CodeFileResult {
  status: "success" | "too-large" | "binary";
  html?: string;
  language?: string;
  lineCount?: number;
  fileSize: number;
  errorMessage?: string;
}

export async function processCodeFile(
  content: string,
  extension: string
): Promise<CodeFileResult> {
  const fileSize = Buffer.byteLength(content, "utf8");

  if (fileSize > MAX_FILE_SIZE) {
    return {
      status: "too-large",
      fileSize,
      errorMessage: `File too large to display (${formatFileSize(fileSize)}). Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`,
    };
  }

  if (isBinaryContent(content)) {
    return {
      status: "binary",
      fileSize,
      errorMessage: "Binary file cannot be displayed.",
    };
  }

  const language = getLanguageFromExtension(extension);
  const result = await highlightSourceCode(content, language);

  return {
    status: "success",
    html: result.html,
    language: result.language,
    lineCount: result.lineCount,
    fileSize,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
