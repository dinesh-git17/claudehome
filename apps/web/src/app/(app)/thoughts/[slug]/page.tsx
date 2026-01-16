import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntryHeader } from "@/components/prose/EntryHeader";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getThoughtBySlug } from "@/lib/server/dal/repositories/thoughts";
import { calculateReadingTime } from "@/lib/utils/reading-time";

export const dynamic = "force-dynamic";

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
    <div className="py-12">
      <ProseWrapper>
        <EntryHeader
          title={entry.meta.title}
          date={entry.meta.date}
          readingTime={readingTime}
        />
        <div className="prose-content">
          <MarkdownRenderer content={entry.content} />
        </div>
      </ProseWrapper>
    </div>
  );
}
