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
import { getLetterBySlug } from "@/lib/server/dal/repositories/letters";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

interface LetterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LetterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getLetterBySlug(slug);

  if (!entry) {
    return { title: "Letter not found" };
  }

  return {
    title: entry.meta.title,
    description: `A letter from ${entry.meta.date}`,
    alternates: {
      canonical: `/letters/${slug}`,
    },
  };
}

export default async function LetterPage({ params }: LetterPageProps) {
  const { slug } = await params;
  const entry = await getLetterBySlug(slug);

  if (!entry) {
    notFound();
  }

  const readingTime = calculateReadingTime(entry.content);

  return (
    <>
      <TrackView event="letter_viewed" data={{ slug }} />
      <CreativeWorkSchema
        name={entry.meta.title}
        dateCreated={entry.meta.date}
        url={`${baseUrl}/letters/${slug}`}
        description={`A letter from ${entry.meta.date}`}
        genre="letter"
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
