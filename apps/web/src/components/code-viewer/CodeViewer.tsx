import "server-only";

import {
  getLanguageFromExtension,
  processCodeFile,
} from "@/lib/server/code-highlighter";

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
  const result = await processCodeFile(content, extension);

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

  const lines = content.split("\n");
  const lineCount = lines.length;

  return (
    <div className={`code-viewer ${className ?? ""}`}>
      <div className="code-viewer-header">
        <span className="code-viewer-filename">{getFilename(filePath)}</span>
        <span className="code-viewer-meta">
          {getLanguageFromExtension(extension)} · {lineCount} lines
        </span>
      </div>
      <div className="code-viewer-content">
        <div className="code-viewer-gutter" aria-hidden="true">
          {lines.map((_, i) => (
            <div key={i} className="code-viewer-line-number">
              {i + 1}
            </div>
          ))}
        </div>
        <div
          className="code-viewer-code"
          dangerouslySetInnerHTML={{ __html: result.html ?? "" }}
        />
      </div>
    </div>
  );
}

function getFilename(path: string): string {
  return path.split("/").pop() ?? path;
}
