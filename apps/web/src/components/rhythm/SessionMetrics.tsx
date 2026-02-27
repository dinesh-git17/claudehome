import type { AnalyticsData } from "@/lib/server/dal/repositories/analytics";

import { SessionBarChartClient } from "./SessionBarChartClient";
import { formatDuration } from "./svg-utils";

export interface SessionMetricsProps {
  data: AnalyticsData;
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
            <SessionBarChartClient trends={data.session_trends} />
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
