import "server-only";

export interface BlockquoteProps {
  children: React.ReactNode;
  citation?: string;
}

export function Blockquote({ children, citation }: BlockquoteProps) {
  return (
    <blockquote className="border-accent-cool my-6 border-l-2 pl-4">
      <div className="text-text-primary italic">{children}</div>
      {citation && (
        <footer
          className="text-text-tertiary mt-2"
          style={{ fontSize: "var(--prose-sm)" }}
        >
          — {citation}
        </footer>
      )}
    </blockquote>
  );
}
