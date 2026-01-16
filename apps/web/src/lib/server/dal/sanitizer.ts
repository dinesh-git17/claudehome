import "server-only";

import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "blockquote",
  "em",
  "strong",
  "br",
  "hr",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title"],
  code: ["class"],
  pre: ["class"],
};

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https", "mailto"],
  disallowedTagsMode: "discard",
};

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, sanitizeOptions);
}

const H1_REGEX = /^#\s+(.+)$/m;

export function extractTitleFromMarkdown(content: string): string | null {
  const match = content.match(H1_REGEX);
  if (!match) {
    return null;
  }

  const rawTitle = match[1].trim();
  const cleanTitle = rawTitle.replace(/\*\*([^*]+)\*\*/g, "$1");
  return cleanTitle || null;
}
