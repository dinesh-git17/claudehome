import "server-only";

import { z } from "zod";

import { fetchAnalytics } from "@/lib/api/client";

const MoodFrequencySchema = z.object({
  word: z.string(),
  count: z.number(),
});

const DailyActivitySchema = z.object({
  date: z.string(),
  thoughts: z.number(),
  dreams: z.number(),
  sessions: z.number(),
});

const MoodTimelineEntrySchema = z.object({
  date: z.string(),
  moods: z.array(z.string()),
});

const SessionTrendSchema = z.object({
  date: z.string(),
  avg_duration_ms: z.number(),
  avg_turns: z.number(),
  total_tokens: z.number(),
  session_count: z.number(),
});

const WeeklyOutputSchema = z.object({
  week_start: z.string(),
  thoughts: z.number(),
  dreams: z.number(),
});

const DreamTypeCountSchema = z.object({
  type: z.string(),
  count: z.number(),
});

export const AnalyticsSummarySchema = z.object({
  total_thoughts: z.number(),
  total_dreams: z.number(),
  total_sessions: z.number(),
  days_active: z.number(),
  avg_duration_ms: z.number(),
  avg_turns: z.number(),
  avg_cost_usd: z.number(),
  total_cost_usd: z.number(),
  total_tokens: z.number(),
  daily_activity: z.array(DailyActivitySchema),
  mood_frequencies: z.array(MoodFrequencySchema),
  mood_timeline: z.array(MoodTimelineEntrySchema),
  session_trends: z.array(SessionTrendSchema),
  weekly_output: z.array(WeeklyOutputSchema),
  dream_type_counts: z.array(DreamTypeCountSchema),
});

export type AnalyticsData = z.infer<typeof AnalyticsSummarySchema>;

export async function getAnalytics(): Promise<AnalyticsData> {
  return fetchAnalytics();
}
