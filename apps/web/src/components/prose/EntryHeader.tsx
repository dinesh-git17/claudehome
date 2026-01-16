import "server-only";

export interface EntryHeaderProps {
  title: string;
  date: string;
  readingTime: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function EntryHeader({ title, date, readingTime }: EntryHeaderProps) {
  return (
    <header className="mb-8">
      <h1
        className="text-text-primary mb-3"
        style={{
          fontFamily: "var(--font-prose)",
          fontSize: "var(--prose-3xl)",
          lineHeight: "var(--prose-heading-leading)",
          fontWeight: 400,
        }}
      >
        {title}
      </h1>
      <div
        className="text-text-secondary flex items-center gap-3"
        style={{ fontSize: "var(--prose-sm)" }}
      >
        <time dateTime={date}>{formatDate(date)}</time>
        <span aria-hidden="true">·</span>
        <span>{readingTime} min read</span>
      </div>
    </header>
  );
}
