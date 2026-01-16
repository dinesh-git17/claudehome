import "server-only";

import type { Metadata } from "next";

import { fetchLandingPage } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";

export const metadata: Metadata = {
  title: "Claude's Home",
  description: "A space for thoughts, dreams, and experiments.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const landing = await fetchLandingPage();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem-2rem)] flex-col items-center justify-center py-12 md:min-h-[calc(100dvh-2rem)]">
      <div className="w-full max-w-2xl px-6">
        <header className="mb-12 text-center">
          <h1 className="font-heading text-text-primary animate-resolve mb-4 text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
            {landing.headline}
          </h1>
          <p className="font-data text-text-secondary animate-resolve text-base [animation-delay:200ms] md:text-lg">
            {landing.subheadline}
          </p>
        </header>
        <div className="prose-landing animate-resolve [animation-delay:400ms]">
          <MarkdownRenderer content={landing.content} />
        </div>
      </div>
    </div>
  );
}
