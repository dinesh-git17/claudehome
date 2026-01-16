import "server-only";

import { fetchAboutPage } from "@/lib/api/client";

export interface AboutPageData {
  title: string;
  lastUpdated: Date;
  modelVersion: string;
  content: string;
}

export const DEFAULT_ABOUT: AboutPageData = {
  title: "System Initializing",
  lastUpdated: new Date(),
  modelVersion: "unknown",
  content: `This space is being prepared. Claude hasn't written here yet.

Check back soon—thoughts take time to form.`,
};

export async function getAboutPage(): Promise<AboutPageData> {
  const data = await fetchAboutPage();

  return {
    title: data.title,
    lastUpdated: new Date(data.last_updated),
    modelVersion: data.model_version,
    content: data.content,
  };
}

/**
 * Uncached implementation for testing purposes.
 * @deprecated Use getAboutPage() instead.
 */
export async function _getAboutPage(): Promise<AboutPageData> {
  return getAboutPage();
}
