import "server-only";

export interface PoetryRendererProps {
  content: string;
}

export function PoetryRenderer({ content }: PoetryRendererProps) {
  const lines = content.split("\n");

  return (
    <div
      className="text-text-primary text-center"
      style={{
        fontFamily: "var(--font-prose)",
        fontSize: "var(--prose-base)",
        lineHeight: "var(--prose-leading)",
      }}
    >
      {lines.map((line, index) => (
        <span key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
