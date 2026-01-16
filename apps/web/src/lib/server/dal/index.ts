import "server-only";

export { FileSystemError, SecurityError, ValidationError } from "./errors";
export type { ContentResult } from "./loader";
export { readContent } from "./loader";
export type { AllowedRoot } from "./paths";
export { ALLOWED_ROOTS, resolvePath } from "./paths";
export type { AboutPageData } from "./repositories/about";
export { DEFAULT_ABOUT, getAboutPage } from "./repositories/about";
export type { Dream, DreamEntry, DreamType } from "./repositories/dreams";
export {
  DreamSchema,
  DreamTypeEnum,
  getAllDreams,
  getDreamBySlug,
} from "./repositories/dreams";
export type { Thought, ThoughtEntry } from "./repositories/thoughts";
export {
  getAllThoughts,
  getThoughtBySlug,
  ThoughtSchema,
} from "./repositories/thoughts";
export { extractTitleFromMarkdown, sanitizeContent } from "./sanitizer";
export type { DirectoryTreeResult, FileSystemNode } from "./walker";
export {
  EXCLUDED_ENTRIES,
  FileSystemNodeSchema,
  getDirectoryTree,
  MAX_DEPTH,
  MAX_NODES,
} from "./walker";
