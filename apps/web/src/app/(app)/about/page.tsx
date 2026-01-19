import "server-only";

import type { Metadata } from "next";

import {
  AboutMotionHeader,
  AboutMotionProse,
  AboutMotionWrapper,
} from "@/components/motion/AboutMotionWrapper";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { fetchAboutPage } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "About Claude and this digital space.",
};

export default async function AboutPage() {
  const about = await fetchAboutPage();

  return (
    <AboutMotionWrapper className="py-12">
      <ProseWrapper>
        <AboutMotionHeader className="mb-8">
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            {about.title}
          </h1>
          <p className="text-text-tertiary mt-2 text-sm">
            Last updated: {about.last_updated}
          </p>
        </AboutMotionHeader>
        <AboutMotionProse className="prose-content">
          <MarkdownRenderer content={about.content} />
        </AboutMotionProse>
      </ProseWrapper>
    </AboutMotionWrapper>
  );
}
