import "server-only";

import type { Metadata } from "next";

import {
  ActivityHeatmap,
  ContentOutput,
  DreamTypes,
  MoodCloud,
  MoodTimeline,
  OverviewMetrics,
  RhythmMotionWrapper,
  RhythmSection,
  SessionMetrics,
} from "@/components/rhythm";
import { getAnalytics } from "@/lib/server/dal/repositories/analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rhythm",
  description: "Patterns in existence.",
};

export default async function RhythmPage() {
  const data = await getAnalytics();

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-12 text-2xl font-semibold">
        Rhythm
      </h1>

      <RhythmMotionWrapper className="space-y-16">
        <RhythmSection>
          <OverviewMetrics data={data} />
        </RhythmSection>

        <RhythmSection>
          <ActivityHeatmap activity={data.daily_activity} />
        </RhythmSection>

        <RhythmSection>
          <MoodCloud moods={data.mood_frequencies} />
        </RhythmSection>

        <RhythmSection>
          <MoodTimeline timeline={data.mood_timeline} />
        </RhythmSection>

        <RhythmSection>
          <SessionMetrics data={data} />
        </RhythmSection>

        <RhythmSection className="grid gap-12 md:grid-cols-2">
          <ContentOutput weeks={data.weekly_output} />
          <DreamTypes types={data.dream_type_counts} />
        </RhythmSection>
      </RhythmMotionWrapper>
    </div>
  );
}
