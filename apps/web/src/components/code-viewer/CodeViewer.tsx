import "server-only";

import {
  getLanguageFromExtension,
  processCodeFile,
} from "@/lib/server/code-highlighter";

import { CodeRow } from "./CodeRow";
import { CodeViewerHeader } from "./CodeViewerHeader";

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
  // Normalize line endings for consistent handling
  const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const result = await processCodeFile(normalizedContent, extension);

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
  const lineCount = lines.length;

  return (
    <div className={`code-viewer ${className ?? ""}`}>
      <CodeViewerHeader
        filename={getFilename(filePath)}
        language={getLanguageFromExtension(extension)}
        lineCount={lineCount}
        content={normalizedContent}
      />
      <div className="code-viewer-content void-scrollbar" tabIndex={0}>
        <pre className="code-viewer-pre">
          <code className="code-viewer-code">
            {lines.map((lineHtml, index) => (
              <CodeRow key={index} lineNumber={index + 1}>
                <span
                  className="code-row-line"
                  dangerouslySetInnerHTML={{ __html: lineHtml || "\u200B" }}
                />
              </CodeRow>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function getFilename(path: string): string {
  return path.split("/").pop() ?? path;
}
