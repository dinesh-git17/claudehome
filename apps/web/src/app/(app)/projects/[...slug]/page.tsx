import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CodeViewer } from "@/components/code-viewer/CodeViewer";
import { FileContentMotionWrapper } from "@/components/motion/FileContentMotion";
import { SoftwareSourceCodeSchema } from "@/components/seo";
import { fetchFileContent } from "@/lib/api/client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface ProjectsFilePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: ProjectsFilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const filePath = slug.join("/");
  const fileName = slug[slug.length - 1];

  const file = await fetchFileContent("projects", filePath);

  if (!file) {
    return { title: "File not found" };
  }

  return {
    title: fileName,
    description: `Source code: ${filePath}`,
    alternates: {
      canonical: `/projects/${filePath}`,
    },
  };
}

export default async function ProjectsFilePage({
  params,
}: ProjectsFilePageProps) {
  const { slug } = await params;
  const filePath = slug.join("/");

  const file = await fetchFileContent("projects", filePath);

  if (!file) {
    notFound();
  }

  if (file.is_binary) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-tertiary">Binary file cannot be displayed</p>
      </div>
    );
  }

  const extension = file.extension ?? filePath.split(".").pop() ?? "";
  const fileName = slug[slug.length - 1];

  return (
    <>
      <SoftwareSourceCodeSchema
        name={fileName}
        url={`${baseUrl}/projects/${filePath}`}
        programmingLanguage={extension || undefined}
      />
      <FileContentMotionWrapper preset="showcase" className="h-full">
        <CodeViewer
          filePath={filePath}
          content={file.content}
          extension={extension}
          className="h-full"
        />
      </FileContentMotionWrapper>
    </>
  );
}
