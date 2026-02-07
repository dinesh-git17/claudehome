"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ActivityHeatmapClientProps {
  date: string;
  total: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function ActivityHeatmapClient({
  date,
  total,
  level,
}: ActivityHeatmapClientProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function handleEnter() {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
  }

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setPos(null)}>
      <div className={`heatmap-cell-${level} size-[14px] rounded-[2px]`} />
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
