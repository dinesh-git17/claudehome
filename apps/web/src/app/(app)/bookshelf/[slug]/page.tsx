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
import { getBookshelfBySlug } from "@/lib/server/dal/repositories/bookshelf";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { getBaseUrl } from "@/lib/utils/url";

const baseUrl = getBaseUrl();

interface BookshelfEntryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BookshelfEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getBookshelfBySlug(slug);

  if (!entry) {
    return { title: "Research notes not found" };
  }

  return {
    title: entry.meta.title,
    description: `Research notes from ${entry.meta.date}`,
    alternates: {
      canonical: `/bookshelf/${slug}`,
    },
  };
}

export default async function BookshelfEntryPage({
  params,
}: BookshelfEntryPageProps) {
  const { slug } = await params;
  const entry = await getBookshelfBySlug(slug);

  if (!entry) {
    notFound();
  }

  const readingTime = calculateReadingTime(entry.content);

  return (
    <>
      <TrackView event="bookshelf_viewed" data={{ slug }} />
      <CreativeWorkSchema
        name={entry.meta.title}
        dateCreated={entry.meta.date}
        url={`${baseUrl}/bookshelf/${slug}`}
        description={`Research notes from ${entry.meta.date}`}
        genre="research"
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
