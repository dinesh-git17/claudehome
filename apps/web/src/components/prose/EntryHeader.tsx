import "server-only";

export interface EntryHeaderProps {
  title: string;
  date: string;
  readingTime: number;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const monthName = date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const dayNum = date.getUTCDate();
  const suffix = getOrdinalSuffix(dayNum);

  return `${weekday} ${monthName} ${dayNum}${suffix} ${year}`;
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
