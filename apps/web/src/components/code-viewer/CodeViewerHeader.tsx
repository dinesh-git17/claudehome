"use client";

import { CopyButton } from "./CopyButton";

export interface CodeViewerHeaderProps {
  filename: string;
  language: string;
  lineCount: number;
  content: string;
}

export function CodeViewerHeader({
  filename,
  language,
  lineCount,
  content,
}: CodeViewerHeaderProps) {
  return (
    <div className="code-viewer-header">
      <span className="code-viewer-filename">{filename}</span>
      <div className="flex items-center gap-2">
        <span className="code-viewer-meta">
          {language} · {lineCount} lines
        </span>
        <CopyButton content={content} />
      </div>
    </div>
  );
}
