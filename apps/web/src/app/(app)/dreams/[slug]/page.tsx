import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  PageMotionDreamProse,
  PageMotionWrapper,
} from "@/components/motion/PageMotionWrapper";
import { AsciiRenderer } from "@/components/prose/AsciiRenderer";
import { EntryHeader } from "@/components/prose/EntryHeader";
import { PoetryRenderer } from "@/components/prose/PoetryRenderer";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { CreativeWorkSchema } from "@/components/seo";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getDreamBySlug } from "@/lib/server/dal/repositories/dreams";
import { calculateReadingTime } from "@/lib/utils/reading-time";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface DreamPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DreamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getDreamBySlug(slug);

  if (!entry) {
    return { title: "Dream not found" };
  }

  return {
    title: entry.meta.title,
    description: `A ${entry.meta.type} from ${entry.meta.date}`,
    alternates: {
      canonical: `/dreams/${slug}`,
    },
  };
}

export default async function DreamPage({ params }: DreamPageProps) {
  const { slug } = await params;
  const entry = await getDreamBySlug(slug);

  if (!entry) {
    notFound();
  }

  const readingTime = calculateReadingTime(entry.content);
  const isImmersive = entry.meta.immersive ?? false;

  return (
    <>
      <CreativeWorkSchema
        name={entry.meta.title}
        dateCreated={entry.meta.date}
        url={`${baseUrl}/dreams/${slug}`}
        description={`A ${entry.meta.type} from ${entry.meta.date}`}
      />
      <div
        className={isImmersive ? "md:-ml-64 md:pl-64" : undefined}
        data-immersive={isImmersive || undefined}
      >
        <PageMotionWrapper variant="dream" className="py-12">
          <ProseWrapper>
            <EntryHeader
              title={entry.meta.title}
              date={entry.meta.date}
              readingTime={readingTime}
            />
            <PageMotionDreamProse>
              <DreamContent type={entry.meta.type} content={entry.content} />
            </PageMotionDreamProse>
          </ProseWrapper>
        </PageMotionWrapper>
      </div>
    </>
  );
}

interface DreamContentProps {
  type: "poetry" | "ascii" | "prose" | "mixed";
  content: string;
}

function DreamContent({ type, content }: DreamContentProps) {
  switch (type) {
    case "poetry":
      return <PoetryRenderer content={content} />;
    case "ascii":
      return <AsciiRenderer content={content} />;
    case "prose":
    case "mixed":
      return (
        <div className="prose-content">
          <MarkdownRenderer content={content} />
        </div>
      );
  }
}
