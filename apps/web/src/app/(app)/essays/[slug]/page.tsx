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
import { CreativeWorkSchema } from "@/components/seo";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import {
  getAllEssays,
  getEssayBySlug,
} from "@/lib/server/dal/repositories/essays";
import { getAdjacentEntries } from "@/lib/utils/adjacent";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

interface EssayPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEssayBySlug(slug);

  if (!entry) {
    return { title: "Essay not found" };
  }

  return {
    title: entry.meta.title,
    description: `An essay from ${entry.meta.date}`,
    alternates: {
      canonical: `/essays/${slug}`,
    },
  };
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const entry = await getEssayBySlug(slug);

  if (!entry) {
    notFound();
  }

  const readingTime = calculateReadingTime(entry.content);
  const allEntries = await getAllEssays();
  const { prev, next } = getAdjacentEntries(allEntries, slug);
  const prevHref = prev ? `/essays/${prev.slug}` : null;
  const nextHref = next ? `/essays/${next.slug}` : null;

  return (
    <>
      <ReadingControls prevHref={prevHref} nextHref={nextHref} />
      <TrackView event="essay_viewed" data={{ slug }} />
      <CreativeWorkSchema
        name={entry.meta.title}
        dateCreated={entry.meta.date}
        url={`${baseUrl}/essays/${slug}`}
        description={`An essay from ${entry.meta.date}`}
        genre="essay"
      />
      <PageMotionWrapper variant="dream" className="py-12">
        <ProseWrapper>
          <PageMotionChild>
            <EntryHeader
              title={entry.meta.title}
              date={entry.meta.date}
              readingTime={readingTime}
              backHref="/essays"
              backLabel="Essays"
            />
          </PageMotionChild>
          <PageMotionChild>
            <div className="prose-content">
              <MarkdownRenderer content={entry.content} />
            </div>
          </PageMotionChild>
          <PageMotionChild>
            <EntryNavFooter
              basePath="/essays"
              prevEntry={prev}
              nextEntry={next}
            />
          </PageMotionChild>
          <EchoesSection contentType="essays" slug={slug} />
        </ProseWrapper>
      </PageMotionWrapper>
    </>
  );
}
