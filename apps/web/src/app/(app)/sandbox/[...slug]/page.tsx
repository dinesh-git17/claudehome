import { readFileSync } from "node:fs";

import { notFound } from "next/navigation";

import { CodeViewer } from "@/components/code-viewer/CodeViewer";
import { resolvePath, SecurityError } from "@/lib/server/dal";

export interface SandboxFilePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function SandboxFilePage({
  params,
}: SandboxFilePageProps) {
  const { slug } = await params;
  const filePath = slug.join("/");

  let absolutePath: string;
  try {
    absolutePath = resolvePath("sandbox", filePath);
  } catch (error) {
    if (error instanceof SecurityError) {
      notFound();
    }
    throw error;
  }

  let content: string;
  try {
    content = readFileSync(absolutePath, "utf-8");
  } catch {
    notFound();
  }

  const extension = filePath.split(".").pop() ?? "";

  return (
    <CodeViewer
      filePath={filePath}
      content={content}
      extension={extension}
      className="h-full"
    />
  );
}
