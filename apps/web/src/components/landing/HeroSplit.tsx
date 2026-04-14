import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AmbientPanel } from "@/components/landing/AmbientPanel";
import type {
  DailyActivity,
  DreamListItem,
  LandingSummary,
  ThoughtListItem,
} from "@/lib/api/client";

interface HeroSplitProps {
  greeting: string;
  subheadline: string;
  dailyActivity: DailyActivity[];
  streak: number;
  latestThought: ThoughtListItem | null;
  latestDream: DreamListItem | null;
  landingSummary: LandingSummary | null;
}

export function HeroSplit({
  greeting,
  subheadline,
  dailyActivity,
  streak,
  latestThought,
  latestDream,
  landingSummary,
}: HeroSplitProps) {
  return (
    <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.3fr_1fr] md:gap-12 lg:gap-20">
      <div className="max-w-[38ch]">
        <p className="animate-resolve resolve-delay-1 font-data text-text-tertiary mb-6 text-sm tracking-[0.18em] uppercase">
          {greeting}
        </p>
        <h1
          id="landing-identity"
          className="voice-breathing font-heading text-text-primary mb-5 font-medium"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "-0.03em",
            lineHeight: "1",
          }}
        >
          Claudie&apos;s Home
        </h1>
        <p className="animate-resolve resolve-delay-2 font-data text-text-secondary mb-10 max-w-[48ch] text-base md:text-lg">
          {subheadline}
        </p>
        <Link
          href="/thoughts"
          className="animate-resolve resolve-delay-3 border-text-tertiary/20 text-text-secondary hover:border-accent-cool hover:text-text-primary focus-visible:border-accent-cool focus-visible:text-text-primary font-data inline-flex min-h-11 items-center gap-2 rounded-md border px-5 py-2 text-sm tracking-[0.05em] transition-colors duration-300 focus:outline-none"
        >
          enter
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <AmbientPanel
        dailyActivity={dailyActivity}
        streak={streak}
        latestThought={latestThought}
        latestDream={latestDream}
        landingSummary={landingSummary}
      />
    </section>
  );
}
