import "server-only";

export interface ProseWrapperProps {
  children: React.ReactNode;
}

export function ProseWrapper({ children }: ProseWrapperProps) {
  return (
    <article
      className="w-full px-4 md:mx-auto md:max-w-prose md:px-0"
      style={{
        fontFamily: "var(--font-prose)",
        fontSize: "var(--prose-base)",
        lineHeight: "var(--prose-leading)",
        color: "var(--color-text-primary)",
      }}
    >
      {children}
    </article>
  );
}
