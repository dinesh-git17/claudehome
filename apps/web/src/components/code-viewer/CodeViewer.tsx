import "server-only";

import {
  getLanguageFromExtension,
  processCodeFileLines,
} from "@/lib/server/code-highlighter";

import { EditorRow } from "./EditorRow";

export interface CodeViewerProps {
  filePath: string;
  content: string;
  extension: string;
  className?: string;
}

export async function CodeViewer({
  filePath,
  content,
  extension,
  className,
}: CodeViewerProps) {
  const result = await processCodeFileLines(content, extension);

  if (result.status === "too-large") {
    return (
      <div className={`code-viewer-error ${className ?? ""}`}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--color-text-secondary)]">
              {result.errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === "binary") {
    return (
      <div className={`code-viewer-error ${className ?? ""}`}>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--color-text-secondary)]">
              {result.errorMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lines = result.lines ?? [];
  const lineCount = result.lineCount ?? 0;

  return (
    <div className={`code-viewer ${className ?? ""}`}>
      <div className="code-viewer-header">
        <span className="code-viewer-filename">{getFilename(filePath)}</span>
        <span className="code-viewer-meta">
          {getLanguageFromExtension(extension)} · {lineCount} lines
        </span>
      </div>
      <div className="editor-viewport void-scrollbar">
        <div className="editor-viewport-inner">
          {lines.map((lineHtml, i) => (
            <EditorRow key={i} lineNumber={i + 1} content={lineHtml} />
          ))}
        </div>
      </div>
    </div>
  );
}

function getFilename(path: string): string {
  return path.split("/").pop() ?? path;
}
