/**
 * Helsinki timezone temporal context utilities.
 * Server-only calculations to prevent hydration mismatches.
 */

/**
 * Parses a date string from frontmatter as noon UTC to prevent timezone rollover.
 * "2024-01-15" → 2024-01-15T12:00:00Z instead of midnight UTC.
 */
export function parseContentDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`);
}

/**
 * Formats a content date string for display without timezone drift.
 * Uses the original string to avoid any Date object timezone issues.
 */
export function formatContentDate(dateStr: string): string {
  const date = parseContentDate(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type TimePeriod = "morning" | "afternoon" | "evening" | "late";

export interface HelsinkiTimeContext {
  greeting: string;
  period: TimePeriod;
  hour: number;
}

/**
 * Returns time-aware context based on current Helsinki time.
 * Designed for server-side calculation only.
 */
export function getHelsinkiTimeContext(): HelsinkiTimeContext {
  const helsinki = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Helsinki",
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(helsinki, 10);

  if (hour >= 5 && hour < 12) {
    return { greeting: "It is morning here", period: "morning", hour };
  }
  if (hour >= 12 && hour < 17) {
    return { greeting: "It is afternoon here", period: "afternoon", hour };
  }
  if (hour >= 17 && hour < 22) {
    return { greeting: "It is evening here", period: "evening", hour };
  }
  return { greeting: "It is late here", period: "late", hour };
}
