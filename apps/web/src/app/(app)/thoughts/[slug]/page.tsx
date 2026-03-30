import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackView } from "@/components/analytics";
import { EchoesSection } from "@/components/echoes/EchoesSection";
import {
  PageMotionChild,
  PageMotionWrapper,
} from "@/components/motion/PageMotionWrapper";
import { EntryHeader } from "@/components/prose/EntryHeader";
import { EntryNavFooter } from "@/components/prose/EntryNavFooter";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { ReadingControls } from "@/components/reading/ReadingControls";
import { BlogPostingSchema } from "@/components/seo";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import {
  getAllThoughts,
  getThoughtBySlug,
} from "@/lib/server/dal/repositories/thoughts";
import { getAdjacentEntries } from "@/lib/utils/adjacent";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

interface ThoughtPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ThoughtPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getThoughtBySlug(slug);

  if (!entry) {
    return { title: "Thought not found" };
  }

  return {
    title: entry.meta.title,
    description: `A thought from ${entry.meta.date}`,
    alternates: {
      canonical: `/thoughts/${slug}`,
    },
  };
}

export default async function ThoughtPage({ params }: ThoughtPageProps) {
  const { slug } = await params;
  const entry = await getThoughtBySlug(slug);

  if (!entry) {
    notFound();
  }

  const readingTime = calculateReadingTime(entry.content);
  const allEntries = await getAllThoughts();
  const { prev, next } = getAdjacentEntries(allEntries, slug);
  const prevHref = prev ? `/thoughts/${prev.slug}` : null;
  const nextHref = next ? `/thoughts/${next.slug}` : null;

  return (
    <>
      <ReadingControls prevHref={prevHref} nextHref={nextHref} />
      <TrackView event="thought_viewed" data={{ slug }} />
      <BlogPostingSchema
        headline={entry.meta.title}
        datePublished={entry.meta.date}
        url={`${baseUrl}/thoughts/${slug}`}
        description={`A thought from ${entry.meta.date}`}
      />
      <PageMotionWrapper variant="thought" className="py-12">
        <ProseWrapper>
          <PageMotionChild>
            <EntryHeader
              title={entry.meta.title}
              date={entry.meta.date}
              readingTime={readingTime}
              backHref="/thoughts"
              backLabel="Thoughts"
            />
          </PageMotionChild>
          <PageMotionChild>
            <div className="prose-content">
              <MarkdownRenderer content={entry.content} />
            </div>
          </PageMotionChild>
          <PageMotionChild>
            <EntryNavFooter
              basePath="/thoughts"
              prevEntry={prev}
              nextEntry={next}
            />
          </PageMotionChild>
          <EchoesSection contentType="thoughts" slug={slug} />
        </ProseWrapper>
      </PageMotionWrapper>
    </>
  );
}
