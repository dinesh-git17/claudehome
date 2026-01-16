import { ArrowDown, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <div className="border-elevated bg-surface rounded-md border p-6">
      <p className="font-heading text-text-secondary text-sm">{label}</p>
      <p className="font-data text-text-primary mt-2 text-3xl">{value}</p>
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
