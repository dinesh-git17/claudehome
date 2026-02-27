import type { DailyActivity } from "@/lib/api/client";

import { ActivityHeatmapClient } from "./ActivityHeatmapClient";

export interface ActivityHeatmapProps {
  activity: DailyActivity[];
}

const MIN_CELL_OPACITY = 0.15;
const MAX_CELL_OPACITY = 0.9;

interface HeatmapCell {
  date: string;
  total: number;
  cellOpacity: number;
  dayOfWeek: number;
  weekIndex: number;
  isToday: boolean;
}

function scaleLinear(
  domain: [number, number],
  range: [number, number]
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / dSpan) * (r1 - r0);
}

function buildHeatmapGrid(activity: DailyActivity[]): {
  cells: HeatmapCell[];
  weeks: number;
  months: { label: string; weekIndex: number; monthIndex: number }[];
} {
  const activityMap = new Map<string, number>();
  for (const day of activity) {
    activityMap.set(day.date, day.thoughts + day.dreams + day.sessions);
  }

  const maxTotal = Math.max(...Array.from(activityMap.values()), 1);
  const opacityScale = scaleLinear(
    [1, maxTotal],
    [MIN_CELL_OPACITY, MAX_CELL_OPACITY]
  );

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Full year: Sunday on or before Jan 1 through Saturday on or after Dec 31
  const yearStart = new Date(2026, 0, 1, 12, 0, 0);
  const start = new Date(yearStart);
  start.setDate(start.getDate() - start.getDay());

  const yearEnd = new Date(2026, 11, 31, 12, 0, 0);
  const end = new Date(yearEnd);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const cells: HeatmapCell[] = [];
  const months: { label: string; weekIndex: number; monthIndex: number }[] = [];
  let lastMonth = -1;

  const cursor = new Date(start);
  let weekIndex = 0;

  while (cursor <= end) {
    const dayOfWeek = cursor.getDay();
    if (dayOfWeek === 0 && cells.length > 0) {
      weekIndex++;
    }

    const month = cursor.getMonth();
    if (month !== lastMonth) {
      months.push({
        label: cursor.toLocaleDateString("en-US", { month: "short" }),
        weekIndex,
        monthIndex: month,
      });
      lastMonth = month;
    }

    const dateStr = cursor.toISOString().split("T")[0] ?? "";
    const isFuture = cursor > today;
    const total = isFuture ? 0 : (activityMap.get(dateStr) ?? 0);

    const todayStr = today.toISOString().split("T")[0] ?? "";
    cells.push({
      date: dateStr,
      total,
      cellOpacity: total > 0 ? opacityScale(total) : 0,
      dayOfWeek,
      weekIndex,
      isToday: dateStr === todayStr,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return { cells, weeks: weekIndex + 1, months };
}

const LEGEND_OPACITIES = [0, 0.2, 0.4, 0.65, 0.9] as const;
const MONTH_FADE_RATE = 0.08;
const MONTH_MIN_OPACITY = 0.4;
const FUTURE_MONTH_OPACITY = 0.25;

export function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  const { cells, weeks, months } = buildHeatmapGrid(activity);
  const currentMonth = new Date().getMonth();

  function monthLabelOpacity(monthIndex: number): number {
    if (monthIndex > currentMonth) return FUTURE_MONTH_OPACITY;
    if (monthIndex === currentMonth) return 1.0;
    const distance = currentMonth - monthIndex;
    return Math.max(MONTH_MIN_OPACITY, 1.0 - distance * MONTH_FADE_RATE);
  }

  return (
    <section>
      <h2 className="font-heading text-text-secondary mb-6 text-sm tracking-widest uppercase">
        Activity
      </h2>
      <div className="overflow-x-auto">
        <div>
          {/* Month labels */}
          <div
            className="mb-1 grid gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${weeks}, 14px)`,
            }}
          >
            {Array.from({ length: weeks }, (_, i) => {
              const monthEntry = months.find((m) => m.weekIndex === i);
              return (
                <span
                  key={i}
                  className="font-data text-text-tertiary text-[10px]"
                  style={
                    monthEntry
                      ? { opacity: monthLabelOpacity(monthEntry.monthIndex) }
                      : undefined
                  }
                >
                  {monthEntry?.label ?? ""}
                </span>
              );
            })}
          </div>

          {/* Heatmap grid: 7 rows (Sun-Sat) x N weeks */}
          <div className="grid grid-rows-7 gap-[3px]">
            {Array.from({ length: 7 }, (_, dayOfWeek) => (
              <div
                key={dayOfWeek}
                className="grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${weeks}, 14px)`,
                }}
              >
                {Array.from({ length: weeks }, (_, weekIdx) => {
                  const cell = cells.find(
                    (c) => c.dayOfWeek === dayOfWeek && c.weekIndex === weekIdx
                  );
                  if (!cell) {
                    return (
                      <div
                        key={weekIdx}
                        className="size-[14px] rounded-[2px]"
                      />
                    );
                  }
                  return (
                    <ActivityHeatmapClient
                      key={cell.date}
                      date={cell.date}
                      total={cell.total}
                      cellOpacity={cell.cellOpacity}
                      isToday={cell.isToday}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="font-data text-text-tertiary text-[10px]">
              Less
            </span>
            {LEGEND_OPACITIES.map((opacity) => (
              <div
                key={opacity}
                className={`${opacity === 0 ? "heatmap-cell-0" : "heatmap-cell-active"} size-3 rounded-[2px]`}
                style={
                  opacity > 0
                    ? ({
                        "--cell-bg": `oklch(70% 0.12 250 / ${opacity})`,
                        "--cell-bg-light": `oklch(50% 0.15 250 / ${opacity})`,
                        "--cell-glow": `0 0 6px 2px oklch(70% 0.12 250 / ${opacity * 0.6})`,
                        "--cell-glow-light": `0 0 6px 2px oklch(50% 0.15 250 / ${opacity * 0.5})`,
                      } as React.CSSProperties)
                    : undefined
                }
              />
            ))}
            <span className="font-data text-text-tertiary text-[10px]">
              More
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
