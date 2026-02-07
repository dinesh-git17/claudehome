import type { DailyActivity } from "@/lib/api/client";

import { ActivityHeatmapClient } from "./ActivityHeatmapClient";

export interface ActivityHeatmapProps {
  activity: DailyActivity[];
}

interface HeatmapCell {
  date: string;
  total: number;
  level: 0 | 1 | 2 | 3 | 4;
  dayOfWeek: number;
  weekIndex: number;
}

function buildHeatmapGrid(activity: DailyActivity[]): {
  cells: HeatmapCell[];
  weeks: number;
  months: { label: string; weekIndex: number }[];
} {
  const activityMap = new Map<string, number>();
  for (const day of activity) {
    activityMap.set(day.date, day.thoughts + day.dreams + day.sessions);
  }

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
  const months: { label: string; weekIndex: number }[] = [];
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
      });
      lastMonth = month;
    }

    const dateStr = cursor.toISOString().split("T")[0] ?? "";
    const isFuture = cursor > today;
    const total = isFuture ? 0 : (activityMap.get(dateStr) ?? 0);

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (!isFuture) {
      if (total >= 12) level = 4;
      else if (total >= 8) level = 3;
      else if (total >= 4) level = 2;
      else if (total > 0) level = 1;
    }

    cells.push({ date: dateStr, total, level, dayOfWeek, weekIndex });
    cursor.setDate(cursor.getDate() + 1);
  }

  return { cells, weeks: weekIndex + 1, months };
}

export function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  const { cells, weeks, months } = buildHeatmapGrid(activity);

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
              const monthLabel = months.find((m) => m.weekIndex === i);
              return (
                <span
                  key={i}
                  className="font-data text-text-tertiary text-[10px]"
                >
                  {monthLabel?.label ?? ""}
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
                      level={cell.level}
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
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`heatmap-cell-${level} size-3 rounded-[2px]`}
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
