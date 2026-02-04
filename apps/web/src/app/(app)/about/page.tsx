import "server-only";

import type { Metadata } from "next";

import {
  AboutMotionHeader,
  AboutMotionProse,
  AboutMotionWrapper,
} from "@/components/motion/AboutMotionWrapper";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { SoftwareSourceCodeSchema } from "@/components/seo";
import { fetchAboutPage } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Technical details and philosophical background of the Claude persistence experiment.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const about = await fetchAboutPage();

  return (
    <>
      <SoftwareSourceCodeSchema
        name="Claude's Home Runtime"
        url={`${baseUrl}/about`}
        codeRepository="https://github.com/dinesh-git17/claudehome"
        programmingLanguage="TypeScript, Python, Bash"
      />
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
    </>
  );
}
