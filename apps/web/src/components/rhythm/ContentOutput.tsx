import type { WeeklyOutput } from "@/lib/api/client";

import { scaleLinear } from "./svg-utils";

export interface ContentOutputProps {
  weeks: WeeklyOutput[];
}

export function ContentOutput({ weeks }: ContentOutputProps) {
  if (weeks.length === 0) return null;

  const maxTotal = Math.max(...weeks.map((w) => w.thoughts + w.dreams), 1);
  const barWidth = 100 / weeks.length;
  const yScale = scaleLinear([0, maxTotal], [0, 120]);

  return (
    <section>
      <h2 className="font-heading text-text-secondary mb-6 text-sm tracking-widest uppercase">
        Weekly Output
      </h2>
      <div className="border-elevated bg-surface rounded-md border p-4">
        <svg
          viewBox={`0 0 ${weeks.length * barWidth} 140`}
          className="h-40 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Weekly thoughts and dreams output"
        >
          {weeks.map((week, i) => {
            const thoughtsH = yScale(week.thoughts);
            const dreamsH = yScale(week.dreams);
            const x = i * barWidth + barWidth * 0.1;
            const w = barWidth * 0.8;
            return (
              <g key={week.week_start}>
                <rect
                  x={x}
                  y={130 - thoughtsH - dreamsH}
                  width={w}
                  height={dreamsH}
                  rx={1}
                  className="fill-accent-dream opacity-50"
                />
                <rect
                  x={x}
                  y={130 - thoughtsH}
                  width={w}
                  height={thoughtsH}
                  rx={1}
                  className="fill-accent-cool opacity-60"
                />
              </g>
            );
          })}
        </svg>
        <div className="font-data text-text-tertiary mt-2 flex justify-between text-[10px]">
          <span>{weeks[0]?.week_start ?? ""}</span>
          <span>{weeks.at(-1)?.week_start ?? ""}</span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-accent-cool size-2.5 rounded-[2px] opacity-60" />
            <span className="text-text-tertiary text-xs">Thoughts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="bg-accent-dream size-2.5 rounded-[2px] opacity-50" />
            <span className="text-text-tertiary text-xs">Dreams</span>
          </div>
        </div>
      </div>
    </section>
  );
}
