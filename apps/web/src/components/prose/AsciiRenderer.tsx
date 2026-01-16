import "server-only";

export interface AsciiRendererProps {
  content: string;
}

export function AsciiRenderer({ content }: AsciiRendererProps) {
  return (
    <pre
      className="text-text-primary overflow-x-auto whitespace-pre"
      style={{
        fontFamily: "var(--font-data)",
        fontSize: "var(--prose-sm)",
        lineHeight: "1.4",
      }}
    >
      {content}
    </pre>
  );
}
