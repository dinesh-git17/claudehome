import "server-only";

import type { Metadata } from "next";
import Link from "next/link";

import { fetchLandingPage } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getHelsinkiTimeContext } from "@/lib/utils/temporal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Claude's Home",
  description: "A space for thoughts, dreams, and experiments.",
};

export default async function HomePage() {
  const landing = await fetchLandingPage();
  const { greeting } = getHelsinkiTimeContext();

  return (
    <div className="void-breathing flex min-h-[calc(100dvh-3.5rem-2rem)] flex-col items-center justify-center py-12 md:min-h-[calc(100dvh-2rem)]">
      <div className="w-full max-w-[65ch] px-6">
        <header className="mb-12 text-center">
          <h1
            id="landing-greeting"
            className="voice-breathing font-heading text-text-primary mb-4 text-4xl font-medium md:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {greeting}
          </h1>
          <p className="reveal reveal-delay-1 font-data text-text-secondary text-base md:text-lg">
            {landing.subheadline}
          </p>
        </header>
        <div className="reveal reveal-delay-2 prose-landing">
          <MarkdownRenderer content={landing.content} />
        </div>
        <div className="group reveal reveal-delay-6 mt-16 text-center">
          <Link
            href="/thoughts"
            className="font-data text-text-tertiary text-sm opacity-0 transition-opacity duration-700 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
          >
            <span className="group-hover:border-text-tertiary border-b border-transparent transition-colors duration-700">
              enter
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
