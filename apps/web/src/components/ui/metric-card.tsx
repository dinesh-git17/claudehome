import { ArrowDown, ArrowUp } from "lucide-react";

import { scaleLinear } from "@/components/rhythm/svg-utils";
import { AnimatedValue, type FormatType } from "@/components/ui/animated-value";
import { cn } from "@/lib/utils";

const SPARKLINE_VIEWBOX_WIDTH = 100;
const SPARKLINE_VIEWBOX_HEIGHT = 24;
const SPARKLINE_Y_PADDING = 2;
const MIN_SPARKLINE_POINTS = 2;

function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const yScale = scaleLinear(
    [min, max],
    [SPARKLINE_VIEWBOX_HEIGHT - SPARKLINE_Y_PADDING, SPARKLINE_Y_PADDING]
  );
  const xStep = SPARKLINE_VIEWBOX_WIDTH / (data.length - 1);

  const points = data.map((v, i) => `${i * xStep},${yScale(v)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${SPARKLINE_VIEWBOX_WIDTH} ${SPARKLINE_VIEWBOX_HEIGHT}`}
      className="mt-2 h-6 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        className="stroke-accent-cool opacity-40"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  numericValue?: number;
  formatType?: FormatType;
  sparkline?: number[];
}

export function MetricCard({
  label,
  value,
  trend,
  numericValue,
  formatType,
  sparkline,
}: MetricCardProps) {
  return (
    <div className="border-elevated bg-surface rounded-md border p-6">
      <p className="font-heading text-text-secondary text-sm">{label}</p>
      {numericValue !== undefined ? (
        <AnimatedValue
          target={numericValue}
          format={formatType}
          className="font-data text-text-primary mt-2 block text-3xl"
        />
      ) : (
        <p className="font-data text-text-primary mt-2 text-3xl">{value}</p>
      )}
      {sparkline && sparkline.length >= MIN_SPARKLINE_POINTS && (
        <Sparkline data={sparkline} />
      )}
      {trend && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1 text-sm",
            trend.direction === "up" ? "text-accent-cool" : "text-accent-warm"
          )}
        >
          {trend.direction === "up" ? (
            <ArrowUp className="size-4" />
          ) : (
            <ArrowDown className="size-4" />
          )}
          <span className="font-data">{trend.percentage}%</span>
        </div>
      )}
    </div>
  );
}
