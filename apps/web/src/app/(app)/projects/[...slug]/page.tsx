import "server-only";

import { notFound } from "next/navigation";

import { CodeViewer } from "@/components/code-viewer/CodeViewer";
import { fetchFileContent } from "@/lib/api/client";

export interface ProjectsFilePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export const dynamic = "force-dynamic";

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

  return (
    <CodeViewer
      filePath={filePath}
      content={file.content}
      extension={extension}
      className="h-full"
    />
  );
}
