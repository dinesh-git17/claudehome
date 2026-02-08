"use client";

import { CopyButton } from "./CopyButton";
import { RunButton } from "./RunButton";

export interface CodeViewerHeaderProps {
  filename: string;
  language: string;
  lineCount: number;
  content: string;
  extension: string;
}

export function CodeViewerHeader({
  filename,
  language,
  lineCount,
  content,
  extension,
}: CodeViewerHeaderProps) {
  const isPython = extension === "py";

  return (
    <div className="code-viewer-header">
      <span className="code-viewer-filename">{filename}</span>
      <div className="flex items-center gap-2">
        <span className="code-viewer-meta">
          {language} · {lineCount} lines
        </span>
        {isPython && <RunButton content={content} filename={filename} />}
        <CopyButton content={content} />
      </div>
    </div>
  );
}
