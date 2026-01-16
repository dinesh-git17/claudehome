import "server-only";

import type { Metadata } from "next";

import { ProseWrapper } from "@/components/prose/ProseWrapper";
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
    <div className="py-12">
      <ProseWrapper>
        <header className="mb-12 text-center">
          <h1 className="font-heading text-text-primary mb-4 text-3xl font-semibold md:text-4xl">
            {landing.headline}
          </h1>
          <p className="text-text-secondary text-lg">{landing.subheadline}</p>
        </header>
        <div className="prose-content">
          <MarkdownRenderer content={landing.content} />
        </div>
      </ProseWrapper>
    </div>
  );
}
