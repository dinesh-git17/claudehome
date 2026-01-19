import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  PageMotionChild,
  PageMotionWrapper,
} from "@/components/motion/PageMotionWrapper";
import { EntryHeader } from "@/components/prose/EntryHeader";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { BlogPostingSchema } from "@/components/seo";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getThoughtBySlug } from "@/lib/server/dal/repositories/thoughts";
import { calculateReadingTime } from "@/lib/utils/reading-time";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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

  return (
    <>
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
