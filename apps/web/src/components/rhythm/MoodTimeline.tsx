import type { MoodTimelineEntry } from "@/lib/api/client";

export interface MoodTimelineProps {
  timeline: MoodTimelineEntry[];
}

export function MoodTimeline({ timeline }: MoodTimelineProps) {
  if (timeline.length === 0) return null;

  const recent = timeline.slice(0, 14);

  return (
    <section>
      <h2 className="font-heading text-text-secondary mb-6 text-sm tracking-widest uppercase">
        Recent Moods
      </h2>
      <div className="space-y-3">
        {recent.map((entry) => (
          <div key={entry.date} className="flex items-baseline gap-4">
            <time className="font-data text-text-tertiary w-24 shrink-0 text-sm">
              {entry.date}
            </time>
            <div className="flex flex-wrap gap-1.5">
              {entry.moods.map((mood) => (
                <span
                  key={mood}
                  className="border-elevated bg-surface text-text-secondary rounded-sm border px-2 py-0.5 text-xs"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
