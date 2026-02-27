"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import type { SessionTrend } from "@/lib/api/client";

import { scaleLinear } from "./svg-utils";

export interface SessionBarChartClientProps {
  trends: SessionTrend[];
}

const MOVING_AVG_WINDOW = 7;
const TODAY_BAR_CAP_HEIGHT = 1.5;
const CHART_BOTTOM = 130;
const CHART_RANGE = 120;
const VIEWBOX_HEIGHT = 140;

function computeMovingAverage(data: SessionTrend[], window: number): number[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    return slice.reduce((sum, d) => sum + d.session_count, 0) / slice.length;
  });
}

export function SessionBarChartClient({ trends }: SessionBarChartClientProps) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  if (trends.length === 0) return null;

  const today = new Date().toISOString().split("T")[0] ?? "";
  const recent = trends.slice(-21);
  const maxSessions = Math.max(...recent.map((t) => t.session_count), 1);
  const barWidth = 100 / recent.length;
  const yScale = scaleLinear([0, maxSessions], [0, CHART_RANGE]);
  const svgWidth = recent.length * barWidth;

  const movingAvg = computeMovingAverage(recent, MOVING_AVG_WINDOW);
  const polylinePoints = movingAvg
    .map((avg, i) => {
      const x = i * barWidth + barWidth / 2;
      const y = CHART_BOTTOM - yScale(avg);
      return `${x},${y}`;
    })
    .join(" ");

  function handleBarEnter(e: React.MouseEvent<SVGRectElement>, index: number) {
    const rect = e.currentTarget.getBoundingClientRect();
    setHover({ x: rect.left + rect.width / 2, y: rect.top, index });
  }

  function handleBarLeave() {
    setHover(null);
  }

  const hoveredTrend = hover !== null ? recent[hover.index] : undefined;

  return (
    <>
      <svg
        viewBox={`0 0 ${svgWidth} ${VIEWBOX_HEIGHT}`}
        className="h-32 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Session count by day"
      >
        <defs>
          <linearGradient
            id="session-bar-grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={CHART_BOTTOM}
            x2="0"
            y2={CHART_BOTTOM - CHART_RANGE}
          >
            <stop offset="0%" style={{ stopColor: "var(--color-surface)" }} />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-accent-cool)" }}
            />
          </linearGradient>
        </defs>

        {recent.map((trend, i) => {
          const height = yScale(trend.session_count);
          const isToday = trend.date === today;
          const x = i * barWidth + barWidth * 0.15;
          const y = CHART_BOTTOM - height;
          const w = barWidth * 0.7;
          return (
            <g key={trend.date}>
              <rect
                x={x}
                y={y}
                width={w}
                height={height}
                rx={1}
                fill="url(#session-bar-grad)"
                opacity={isToday ? 1 : 0.6}
              />
              {isToday && height > 0 && (
                <rect
                  x={x}
                  y={y - TODAY_BAR_CAP_HEIGHT}
                  width={w}
                  height={TODAY_BAR_CAP_HEIGHT}
                  rx={0.5}
                  className="fill-accent-cool opacity-80"
                />
              )}
            </g>
          );
        })}

        <polyline
          points={polylinePoints}
          fill="none"
          className="stroke-accent-cool"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.7}
          vectorEffect="non-scaling-stroke"
        />

        {recent.map((trend, i) => (
          <rect
            key={`hit-${trend.date}`}
            x={i * barWidth}
            y={0}
            width={barWidth}
            height={VIEWBOX_HEIGHT}
            fill="transparent"
            onMouseEnter={(e) => handleBarEnter(e, i)}
            onMouseLeave={handleBarLeave}
          />
        ))}
      </svg>

      {hover &&
        hoveredTrend &&
        createPortal(
          <div
            className="bg-elevated text-text-primary border-surface pointer-events-none fixed z-50 -translate-x-1/2 rounded-sm border px-2 py-1 text-xs whitespace-nowrap"
            style={{ left: hover.x, top: hover.y - 8 }}
          >
            <span className="font-data">{hoveredTrend.session_count}</span>{" "}
            {hoveredTrend.session_count === 1 ? "session" : "sessions"} on{" "}
            {hoveredTrend.date}
          </div>,
          document.body
        )}
    </>
  );
}
