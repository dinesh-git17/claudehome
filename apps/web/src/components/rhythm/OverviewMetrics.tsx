import { MetricCard } from "@/components/ui/metric-card";
import type { AnalyticsData } from "@/lib/server/dal/repositories/analytics";

import { computeTrend, formatDuration, formatTokenCount } from "./svg-utils";

const SPARKLINE_WINDOW = 14;
const TREND_WINDOW = 7;

export interface OverviewMetricsProps {
  data: AnalyticsData;
}

export function OverviewMetrics({ data }: OverviewMetricsProps) {
  const sortedDaily = [...data.daily_activity].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const recentDaily = sortedDaily.slice(-SPARKLINE_WINDOW);
  const recent7Daily = sortedDaily.slice(-TREND_WINDOW);
  const prev7Daily = sortedDaily.slice(-TREND_WINDOW * 2, -TREND_WINDOW);

  const sortedSession = [...data.session_trends].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const recentSession = sortedSession.slice(-SPARKLINE_WINDOW);
  const recent7Session = sortedSession.slice(-TREND_WINDOW);
  const prev7Session = sortedSession.slice(-TREND_WINDOW * 2, -TREND_WINDOW);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard
        label="Thoughts"
        value={data.total_thoughts}
        numericValue={data.total_thoughts}
        sparkline={recentDaily.map((d) => d.thoughts)}
        trend={computeTrend(
          recent7Daily.map((d) => d.thoughts),
          prev7Daily.map((d) => d.thoughts)
        )}
      />
      <MetricCard
        label="Dreams"
        value={data.total_dreams}
        numericValue={data.total_dreams}
        sparkline={recentDaily.map((d) => d.dreams)}
        trend={computeTrend(
          recent7Daily.map((d) => d.dreams),
          prev7Daily.map((d) => d.dreams)
        )}
      />
      <MetricCard
        label="Sessions"
        value={data.total_sessions}
        numericValue={data.total_sessions}
        sparkline={recentDaily.map((d) => d.sessions)}
        trend={computeTrend(
          recent7Daily.map((d) => d.sessions),
          prev7Daily.map((d) => d.sessions)
        )}
      />
      <MetricCard
        label="Days Active"
        value={data.days_active}
        numericValue={data.days_active}
      />
      <MetricCard
        label="Avg Duration"
        value={formatDuration(data.avg_duration_ms)}
        numericValue={data.avg_duration_ms}
        formatType="duration"
        sparkline={recentSession.map((t) => t.avg_duration_ms)}
        trend={computeTrend(
          recent7Session.map((t) => t.avg_duration_ms),
          prev7Session.map((t) => t.avg_duration_ms)
        )}
      />
      <MetricCard
        label="Avg Turns"
        value={Math.round(data.avg_turns)}
        numericValue={data.avg_turns}
        sparkline={recentSession.map((t) => t.avg_turns)}
        trend={computeTrend(
          recent7Session.map((t) => t.avg_turns),
          prev7Session.map((t) => t.avg_turns)
        )}
      />
      <MetricCard
        label="Total Tokens"
        value={formatTokenCount(data.total_tokens)}
        numericValue={data.total_tokens}
        formatType="tokens"
        sparkline={recentSession.map((t) => t.total_tokens)}
        trend={computeTrend(
          recent7Session.map((t) => t.total_tokens),
          prev7Session.map((t) => t.total_tokens)
        )}
      />
      <MetricCard
        label="Total Cost"
        value={`$${data.total_cost_usd.toFixed(2)}`}
        numericValue={data.total_cost_usd}
        formatType="currency"
      />
    </div>
  );
}
