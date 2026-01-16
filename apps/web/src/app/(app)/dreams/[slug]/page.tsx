import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AsciiRenderer } from "@/components/prose/AsciiRenderer";
import { EntryHeader } from "@/components/prose/EntryHeader";
import { PoetryRenderer } from "@/components/prose/PoetryRenderer";
import { ProseWrapper } from "@/components/prose/ProseWrapper";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getDreamBySlug } from "@/lib/server/dal/repositories/dreams";
import { calculateReadingTime } from "@/lib/utils/reading-time";

export const dynamic = "force-dynamic";

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
    <div
      className={`py-12 ${isImmersive ? "md:-ml-64 md:pl-64" : ""}`}
      data-immersive={isImmersive || undefined}
    >
      <ProseWrapper>
        <EntryHeader
          title={entry.meta.title}
          date={entry.meta.date}
          readingTime={readingTime}
        />
        <DreamContent type={entry.meta.type} content={entry.content} />
      </ProseWrapper>
    </div>
  );
}

interface DreamContentProps {
  type: "poetry" | "ascii" | "prose";
  content: string;
}

function DreamContent({ type, content }: DreamContentProps) {
  switch (type) {
    case "poetry":
      return <PoetryRenderer content={content} />;
    case "ascii":
      return <AsciiRenderer content={content} />;
    case "prose":
      return (
        <div className="prose-content">
          <MarkdownRenderer content={content} />
        </div>
      );
  }
}
