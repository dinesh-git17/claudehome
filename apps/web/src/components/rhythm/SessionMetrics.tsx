import type { SessionTrend } from "@/lib/api/client";
import type { AnalyticsData } from "@/lib/server/dal/repositories/analytics";

import { formatDuration, scaleLinear } from "./svg-utils";

export interface SessionMetricsProps {
  data: AnalyticsData;
}

function SessionBarChart({ trends }: { trends: SessionTrend[] }) {
  if (trends.length === 0) return null;

  const recent = trends.slice(-21);
  const maxSessions = Math.max(...recent.map((t) => t.session_count), 1);
  const barWidth = 100 / recent.length;
  const yScale = scaleLinear([0, maxSessions], [0, 120]);

  return (
    <svg
      viewBox={`0 0 ${recent.length * barWidth} 140`}
      className="h-32 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Session count by day"
    >
      {recent.map((trend, i) => {
        const height = yScale(trend.session_count);
        return (
          <rect
            key={trend.date}
            x={i * barWidth + barWidth * 0.15}
            y={130 - height}
            width={barWidth * 0.7}
            height={height}
            rx={1}
            className="fill-accent-cool opacity-60 transition-opacity hover:opacity-100"
          />
        );
      })}
    </svg>
  );
}

export function SessionMetrics({ data }: SessionMetricsProps) {
  return (
    <section>
      <h2 className="font-heading text-text-secondary mb-6 text-sm tracking-widest uppercase">
        Session Patterns
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="border-elevated bg-surface rounded-md border p-4">
            <p className="text-text-secondary text-sm">Avg Duration</p>
            <p className="font-data text-text-primary mt-1 text-2xl">
              {formatDuration(data.avg_duration_ms)}
            </p>
          </div>
          <div className="border-elevated bg-surface rounded-md border p-4">
            <p className="text-text-secondary text-sm">Avg Turns</p>
            <p className="font-data text-text-primary mt-1 text-2xl">
              {Math.round(data.avg_turns)}
            </p>
          </div>
          <div className="border-elevated bg-surface rounded-md border p-4">
            <p className="text-text-secondary text-sm">Avg Cost</p>
            <p className="font-data text-text-primary mt-1 text-2xl">
              ${data.avg_cost_usd.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="border-elevated bg-surface flex flex-col rounded-md border p-4">
          <p className="text-text-secondary mb-4 text-sm">
            Sessions per Day (last 21 days)
          </p>
          <div className="flex-1">
            <SessionBarChart trends={data.session_trends} />
          </div>
          <div className="font-data text-text-tertiary mt-2 flex justify-between text-[10px]">
            <span>{data.session_trends.at(-21)?.date ?? ""}</span>
            <span>{data.session_trends.at(-1)?.date ?? ""}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
