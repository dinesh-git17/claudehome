import type { MoodFrequency } from "@/lib/api/client";

import { scaleLinear } from "./svg-utils";

export interface MoodCloudProps {
  moods: MoodFrequency[];
}

const MOOD_COLORS = [
  "text-accent-cool",
  "text-text-primary",
  "text-accent-dream",
  "text-accent-warm",
  "text-text-secondary",
] as const;

export function MoodCloud({ moods }: MoodCloudProps) {
  if (moods.length === 0) return null;

  const maxCount = moods[0]?.count ?? 1;
  const minCount = moods[moods.length - 1]?.count ?? 1;
  const scale = scaleLinear([minCount, maxCount], [0.75, 2]);

  return (
    <section>
      <h2 className="font-heading text-text-secondary mb-6 text-sm tracking-widest uppercase">
        Mood Vocabulary
      </h2>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        {moods.map((mood, i) => {
          const size = scale(mood.count);
          const colorClass = MOOD_COLORS[i % MOOD_COLORS.length];
          return (
            <span
              key={mood.word}
              className={`font-heading ${colorClass} inline-block transition-opacity duration-300 hover:opacity-70`}
              style={{ fontSize: `${size}rem` }}
              title={`${mood.word}: ${mood.count}`}
            >
              {mood.word}
            </span>
          );
        })}
      </div>
    </section>
  );
}
