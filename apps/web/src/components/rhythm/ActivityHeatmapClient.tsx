"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export interface ActivityHeatmapClientProps {
  date: string;
  total: number;
  cellOpacity: number;
  isToday?: boolean;
}

export function ActivityHeatmapClient({
  date,
  total,
  cellOpacity,
  isToday,
}: ActivityHeatmapClientProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function handleEnter() {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
  }

  const cellClass = cellOpacity > 0 ? "heatmap-cell-active" : "heatmap-cell-0";
  const cellStyle =
    cellOpacity > 0
      ? ({
          "--cell-bg": `oklch(70% 0.12 250 / ${cellOpacity})`,
          "--cell-bg-light": `oklch(50% 0.15 250 / ${cellOpacity})`,
          "--cell-glow": `0 0 6px 2px oklch(70% 0.12 250 / ${cellOpacity * 0.6})`,
          "--cell-glow-light": `0 0 6px 2px oklch(50% 0.15 250 / ${cellOpacity * 0.5})`,
        } as React.CSSProperties)
      : undefined;

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setPos(null)}>
      <div
        className={cn(
          `${cellClass} size-[14px] rounded-[2px]`,
          isToday &&
            "ring-1.5 ring-accent-cool/50 ring-offset-void ring-offset-1"
        )}
        style={cellStyle}
      />
      {pos &&
        createPortal(
          <div
            className="bg-elevated text-text-primary border-surface pointer-events-none fixed z-50 -translate-x-1/2 rounded-sm border px-2 py-1 text-xs whitespace-nowrap"
            style={{ left: pos.x, top: pos.y - 8 }}
          >
            <span className="font-data">{total}</span>{" "}
            {total === 1 ? "activity" : "activities"} on {date}
          </div>,
          document.body
        )}
    </div>
  );
}
