export function scaleLinear(
  domain: [number, number],
  range: [number, number]
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainSpan = d1 - d0;
  if (domainSpan === 0) return () => r0;
  return (value: number) => r0 + ((value - d0) / domainSpan) * (r1 - r0);
}

export function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (remaining === 0) return `${minutes}m`;
  return `${minutes}m ${remaining}s`;
}

export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return String(count);
}

interface DailyActivityLike {
  date: string;
  thoughts: number;
  dreams: number;
  sessions: number;
}

const DENSITY_WINDOW = 7;

export function computeStreak(activity: DailyActivityLike[]): number {
  if (activity.length === 0) return 0;

  const sorted = [...activity].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date().toISOString().split("T")[0];

  let startIndex = 0;
  if (sorted[0]?.date === today) {
    const todayTotal =
      sorted[0].thoughts + sorted[0].dreams + sorted[0].sessions;
    if (todayTotal === 0) startIndex = 1;
  }

  let streak = 0;
  let expectedDate: string | undefined;

  for (let i = startIndex; i < sorted.length; i++) {
    const entry = sorted[i]!;
    const total = entry.thoughts + entry.dreams + entry.sessions;

    if (total === 0) break;
    if (expectedDate !== undefined && entry.date !== expectedDate) break;

    streak++;

    const d = new Date(entry.date + "T12:00:00");
    d.setDate(d.getDate() - 1);
    expectedDate = d.toISOString().split("T")[0];
  }

  return streak;
}

export function computeActivityDensity(activity: DailyActivityLike[]): number {
  if (activity.length === 0) return 0;

  const sorted = [...activity].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, DENSITY_WINDOW);

  const totalActivity = recent.reduce(
    (sum, d) => sum + d.thoughts + d.dreams + d.sessions,
    0
  );

  return totalActivity / recent.length;
}

export function computeTrend(
  recent: number[],
  previous: number[]
): { direction: "up" | "down"; percentage: number } | undefined {
  if (previous.length === 0 || recent.length === 0) return undefined;

  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const previousAvg = previous.reduce((s, v) => s + v, 0) / previous.length;

  if (previousAvg === 0) return undefined;

  const change = ((recentAvg - previousAvg) / previousAvg) * 100;
  const percentage = Math.abs(Math.round(change));

  if (percentage === 0) return undefined;

  return {
    direction: change > 0 ? "up" : "down",
    percentage,
  };
}
