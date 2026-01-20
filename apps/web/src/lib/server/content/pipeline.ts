import "server-only";

import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import rehypeExternalLinks from "rehype-external-links";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createHighlighter, type Highlighter } from "shiki";
import { unified } from "unified";

import { sanitizeSchema } from "./sanitize-schema";
import { contemplativeTheme } from "./shiki-theme";

const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "python",
  "css",
  "html",
  "markdown",
  "yaml",
] as const;

const parser = unified().use(remarkParse).use(remarkGfm);

let highlighterInstance: Highlighter | null = null;

async function getOrCreateHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: [contemplativeTheme],
      langs: [...SUPPORTED_LANGUAGES],
    });
  }
  return highlighterInstance;
}

/** Reset highlighter instance (for testing only) */
export function resetHighlighter(): void {
  highlighterInstance = null;
}

export function parseMarkdown(content: string): MdastRoot {
  return parser.parse(content);
}

export async function transformToHast(content: string): Promise<HastRoot> {
  const highlighter = await getOrCreateHighlighter();

  const prettyCodeOptions: PrettyCodeOptions = {
    theme: "contemplative" as unknown as PrettyCodeOptions["theme"],
    keepBackground: false,
    defaultLang: "text",
    getHighlighter: () => Promise.resolve(highlighter),
  };

  const transformer = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeExternalLinks, {
      rel: ["noopener", "noreferrer"],
      target: "_blank",
    })
    .use(rehypeSanitize, sanitizeSchema);

  const file = await transformer.run(transformer.parse(content));
  return file as HastRoot;
}
