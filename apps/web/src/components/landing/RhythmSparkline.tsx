import Link from "next/link";

import { scaleLinear } from "@/components/rhythm/svg-utils";
import type { DailyActivity } from "@/lib/api/client";

interface RhythmSparklineProps {
  dailyActivity: DailyActivity[];
  streak: number;
}

const SPARK_WIDTH = 200;
const SPARK_HEIGHT = 36;
const SPARK_PAD_X = 2;
const SPARK_PAD_Y = 4;
const WINDOW_DAYS = 14;

interface SparkPoint {
  x: number;
  y: number;
  total: number;
}

function buildPoints(activity: DailyActivity[]): SparkPoint[] {
  if (activity.length === 0) return [];

  const sorted = [...activity].sort((a, b) => a.date.localeCompare(b.date));
  const windowed = sorted.slice(-WINDOW_DAYS);

  const totals = windowed.map(
    (entry) => entry.thoughts + entry.dreams + entry.sessions
  );
  const max = Math.max(...totals, 1);

  const yScale = scaleLinear(
    [0, max],
    [SPARK_HEIGHT - SPARK_PAD_Y, SPARK_PAD_Y]
  );

  if (windowed.length === 1) {
    return [
      {
        x: SPARK_WIDTH / 2,
        y: yScale(totals[0] ?? 0),
        total: totals[0] ?? 0,
      },
    ];
  }

  const innerWidth = SPARK_WIDTH - SPARK_PAD_X * 2;
  return windowed.map((_, i) => ({
    x: SPARK_PAD_X + (i / (windowed.length - 1)) * innerWidth,
    y: yScale(totals[i] ?? 0),
    total: totals[i] ?? 0,
  }));
}

function getStreakLabel(streak: number): string {
  if (streak === 0) return "Begin today";
  if (streak === 1) return "1 day";
  return `${streak} days`;
}

export function RhythmSparkline({
  dailyActivity,
  streak,
}: RhythmSparklineProps) {
  const points = buildPoints(dailyActivity);
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const latest = points.at(-1);

  return (
    <Link
      href="/rhythm"
      className="group text-text-tertiary hover:text-accent-cool focus-visible:text-accent-cool block transition-colors duration-500 focus:outline-none"
    >
      <span className="font-data text-[10px] tracking-[0.18em] uppercase">
        14-day rhythm
      </span>
      <svg
        viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
        preserveAspectRatio="none"
        className="mt-2 block h-9 w-full overflow-visible"
        role="img"
        aria-label={`Fourteen day activity rhythm, ${getStreakLabel(streak)} streak`}
      >
        {points.length >= 2 ? (
          <polyline
            points={polyline}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {latest ? (
          <circle
            cx={latest.x}
            cy={latest.y}
            r={2}
            fill="currentColor"
            className="signal-pulse"
          />
        ) : null}
      </svg>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-heading text-text-secondary group-hover:text-text-primary text-lg leading-none font-medium transition-colors duration-500">
          {streak}
        </span>
        <span className="font-data text-[10px] tracking-[0.18em] uppercase">
          {getStreakLabel(streak)}
        </span>
      </div>
    </Link>
  );
}
