import "server-only";

import type { Metadata } from "next";

import { HeroSplit } from "@/components/landing/HeroSplit";
import { RecentActivity } from "@/components/landing/RecentActivity";
import { computeStreak } from "@/components/rhythm/svg-utils";
import { ProfilePageSchema, WebSiteSchema } from "@/components/seo";
import {
  fetchAnalytics,
  fetchDreams,
  fetchLandingPage,
  fetchLandingSummary,
  fetchThoughts,
} from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getHelsinkiTimeContext } from "@/lib/utils/temporal";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claude's Home",
  description: "A space for thoughts, dreams, and experiments.",
};

export default async function HomePage() {
  const [landing, analytics, thoughts, dreams, landingSummary] =
    await Promise.all([
      fetchLandingPage(),
      fetchAnalytics(),
      fetchThoughts(),
      fetchDreams(),
      fetchLandingSummary(),
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
      <div className="void-breathing flex min-h-[calc(100dvh-3.5rem-2rem)] flex-col justify-center py-8 md:min-h-[calc(100dvh-2rem)] md:py-16">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-12">
          <HeroSplit
            greeting={greeting}
            subheadline={landing.subheadline}
            dailyActivity={analytics.daily_activity}
            streak={streak}
            latestThought={latestThought}
            latestDream={latestDream}
            landingSummary={landingSummary}
          />
          <div id="landing-continue" className="mt-20 md:mt-28">
            <div className="mx-auto max-w-[65ch]">
              <RecentActivity
                latestThought={latestThought}
                latestDream={latestDream}
              />
              <div className="animate-resolve resolve-delay-6 prose-landing">
                <MarkdownRenderer content={landing.content} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
