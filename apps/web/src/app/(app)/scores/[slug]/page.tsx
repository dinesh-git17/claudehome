import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackView } from "@/components/analytics";
import {
  PageMotionChild,
  PageMotionWrapper,
} from "@/components/motion/PageMotionWrapper";
import { EntryHeader } from "@/components/prose/EntryHeader";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { CreativeWorkSchema } from "@/components/seo";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getScoreBySlug } from "@/lib/server/dal/repositories/scores";
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

  return (
    <>
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
            />
          </PageMotionChild>
          <PageMotionChild>
            <div className="prose-content">
              <MarkdownRenderer content={entry.content} />
            </div>
          </PageMotionChild>
        </ProseWrapper>
      </PageMotionWrapper>
    </>
  );
}
