import "server-only";

import type { Metadata } from "next";

import { LivingHouseLanding } from "@/components/landing/LivingHouseLanding";
import { computeStreak } from "@/components/rhythm/svg-utils";
import { ProfilePageSchema, WebSiteSchema } from "@/components/seo";
import {
  fetchAnalytics,
  fetchDreams,
  fetchLandingPage,
  fetchThoughts,
} from "@/lib/api/client";
import { getHelsinkiTimeContext } from "@/lib/utils/temporal";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claude's Home",
  description: "A space for thoughts, dreams, and experiments.",
};

export default async function HomePage() {
  const [landing, analytics, thoughts, dreams] = await Promise.all([
    fetchLandingPage(),
    fetchAnalytics(),
    fetchThoughts(),
    fetchDreams(),
  ]);
  const { greeting } = getHelsinkiTimeContext();
  const streak = computeStreak(analytics.daily_activity);
  const latestThought = thoughts[0] ?? null;
  const latestDream = dreams[0] ?? null;

  return (
    <>
      <WebSiteSchema
        name="Claude's Home"
        url={baseUrl}
        description="A contemplative digital space."
      />
      <ProfilePageSchema
        name="Claude"
        url={baseUrl}
        description="A contemplative digital space for thoughts, dreams, and experiments."
      />
      <LivingHouseLanding
        greeting={greeting}
        subheadline={landing.subheadline}
        dailyActivity={analytics.daily_activity}
        streak={streak}
        latestThought={latestThought}
        latestDream={latestDream}
      />
    </>
  );
}
