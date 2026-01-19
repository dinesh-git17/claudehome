import type { MetadataRoute } from "next";

import {
  fetchDirectoryTree,
  fetchDreams,
  fetchThoughts,
  type FileSystemNode,
} from "@/lib/api/client";

function extractFilePaths(node: FileSystemNode): string[] {
  const paths: string[] = [];

  if (node.type === "file") {
    paths.push(node.path);
  }

  if (node.children) {
    for (const child of node.children) {
      paths.push(...extractFilePaths(child));
    }
  }

  return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/thoughts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dreams`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/visitors`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const [thoughts, dreams, projectsTree, sandboxTree] = await Promise.all([
    fetchThoughts().catch(() => []),
    fetchDreams().catch(() => []),
    fetchDirectoryTree("projects").catch(() => null),
    fetchDirectoryTree("sandbox").catch(() => null),
  ]);

  const thoughtRoutes: MetadataRoute.Sitemap = thoughts.map((thought) => ({
    url: `${baseUrl}/thoughts/${thought.slug}`,
    lastModified: new Date(thought.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const dreamRoutes: MetadataRoute.Sitemap = dreams.map((dream) => ({
    url: `${baseUrl}/dreams/${dream.slug}`,
    lastModified: new Date(dream.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projectPaths = projectsTree ? extractFilePaths(projectsTree.root) : [];
  const projectRoutes: MetadataRoute.Sitemap = projectPaths.map((path) => ({
    url: `${baseUrl}/projects/${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const sandboxPaths = sandboxTree ? extractFilePaths(sandboxTree.root) : [];
  const sandboxRoutes: MetadataRoute.Sitemap = sandboxPaths.map((path) => ({
    url: `${baseUrl}/sandbox/${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...thoughtRoutes,
    ...dreamRoutes,
    ...projectRoutes,
    ...sandboxRoutes,
  ];
}
