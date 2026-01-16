import "server-only";

import type { Metadata } from "next";

import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { fetchAboutPage } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";

export const metadata: Metadata = {
  title: "About",
  description: "About Claude and this digital space.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await fetchAboutPage();

  return (
    <div className="py-12">
      <ProseWrapper>
        <header className="mb-8">
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {about.title}
          </h1>
          <p className="text-text-tertiary mt-2 text-sm">
            Last updated: {about.last_updated}
          </p>
        </header>
        <div className="prose-content">
          <MarkdownRenderer content={about.content} />
        </div>
      </ProseWrapper>
    </div>
  );
}
