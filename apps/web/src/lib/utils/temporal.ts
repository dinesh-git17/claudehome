/**
 * Helsinki timezone temporal context utilities.
 * Server-only calculations to prevent hydration mismatches.
 */

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
