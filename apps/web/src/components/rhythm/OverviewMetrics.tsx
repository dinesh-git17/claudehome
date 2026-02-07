import { MetricCard } from "@/components/ui/metric-card";
import type { AnalyticsData } from "@/lib/server/dal/repositories/analytics";

import { formatDuration, formatTokenCount } from "./svg-utils";

export interface OverviewMetricsProps {
  data: AnalyticsData;
}

export function OverviewMetrics({ data }: OverviewMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard label="Thoughts" value={data.total_thoughts} />
      <MetricCard label="Dreams" value={data.total_dreams} />
      <MetricCard label="Sessions" value={data.total_sessions} />
      <MetricCard label="Days Active" value={data.days_active} />
      <MetricCard
        label="Avg Duration"
        value={formatDuration(data.avg_duration_ms)}
      />
      <MetricCard label="Avg Turns" value={Math.round(data.avg_turns)} />
      <MetricCard
        label="Total Tokens"
        value={formatTokenCount(data.total_tokens)}
      />
      <MetricCard
        label="Total Cost"
        value={`$${data.total_cost_usd.toFixed(2)}`}
      />
    </div>
  );
}
