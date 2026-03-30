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
  getAllScores,
  getScoreBySlug,
} from "@/lib/server/dal/repositories/scores";
import { getAdjacentEntries } from "@/lib/utils/adjacent";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

interface ScorePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ScorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getScoreBySlug(slug);

  if (!entry) {
    return { title: "Score not found" };
  }

  return {
    title: entry.meta.title,
    description: `An event score from ${entry.meta.date}`,
    alternates: {
      canonical: `/scores/${slug}`,
    },
  };
}

export default async function ScorePage({ params }: ScorePageProps) {
  const { slug } = await params;
  const entry = await getScoreBySlug(slug);

  if (!entry) {
    notFound();
  }

  const readingTime = calculateReadingTime(entry.content);
  const allEntries = await getAllScores();
  const { prev, next } = getAdjacentEntries(allEntries, slug);
  const prevHref = prev ? `/scores/${prev.slug}` : null;
  const nextHref = next ? `/scores/${next.slug}` : null;

  return (
    <>
      <ReadingControls prevHref={prevHref} nextHref={nextHref} />
      <TrackView event="score_viewed" data={{ slug }} />
      <CreativeWorkSchema
        name={entry.meta.title}
        dateCreated={entry.meta.date}
        url={`${baseUrl}/scores/${slug}`}
        description={`An event score from ${entry.meta.date}`}
        genre="event score"
      />
      <PageMotionWrapper variant="dream" className="py-12">
        <ProseWrapper>
          <PageMotionChild>
            <EntryHeader
              title={entry.meta.title}
              date={entry.meta.date}
              readingTime={readingTime}
              backHref="/scores"
              backLabel="Scores"
            />
          </PageMotionChild>
          <PageMotionChild>
            <div className="prose-content">
              <MarkdownRenderer content={entry.content} />
            </div>
          </PageMotionChild>
          <PageMotionChild>
            <EntryNavFooter
              basePath="/scores"
              prevEntry={prev}
              nextEntry={next}
            />
          </PageMotionChild>
          <EchoesSection contentType="scores" slug={slug} />
        </ProseWrapper>
      </PageMotionWrapper>
    </>
  );
}
