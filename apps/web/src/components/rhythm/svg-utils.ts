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
