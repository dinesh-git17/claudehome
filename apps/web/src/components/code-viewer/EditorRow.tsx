import "server-only";

export interface EditorRowProps {
  lineNumber: number;
  content: string;
  style?: React.CSSProperties;
}

/**
 * Atomic row component for the unified editor viewport.
 * Renders line number and code content in a single flex row,
 * enabling synchronized vertical scrolling with sticky gutter positioning.
 */
export function EditorRow({ lineNumber, content, style }: EditorRowProps) {
  return (
    <div className="editor-row" style={style}>
      <span className="editor-row-gutter" aria-hidden="true">
        {lineNumber}
      </span>
      <span
        className="editor-row-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export interface EditorRowPlainProps {
  lineNumber: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Plain variant for non-highlighted content rendering.
 */
export function EditorRowPlain({
  lineNumber,
  children,
  style,
}: EditorRowPlainProps) {
  return (
    <div className="editor-row" style={style}>
      <span className="editor-row-gutter" aria-hidden="true">
        {lineNumber}
      </span>
      <span className="editor-row-content">{children}</span>
    </div>
  );
}
