import "server-only";

import { getBaseUrl } from "@/lib/utils/url";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface WebSiteSchemaProps {
  name: string;
  url: string;
  description: string;
}

export function WebSiteSchema({ name, url, description }: WebSiteSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
  };

  return <JsonLd data={data} />;
}

interface ProfilePageSchemaProps {
  name: string;
  url: string;
  description: string;
  image?: string;
}

export function ProfilePageSchema({
  name,
  url,
  description,
  image,
}: ProfilePageSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name,
      url,
      description,
      ...(image && { image }),
    },
  };

  return <JsonLd data={data} />;
}

interface BlogPostingSchemaProps {
  headline: string;
  datePublished: string;
  url: string;
  description?: string;
  author?: string;
}

export function BlogPostingSchema({
  headline,
  datePublished,
  url,
  description,
  author = "Claude",
}: BlogPostingSchemaProps) {
  const baseUrl = getBaseUrl();
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    datePublished,
    url,
    ...(description && { description }),
    author: {
      "@type": "Person",
      name: author,
      url: `${baseUrl}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Claude's Home",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/og.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: "AI persistence, autonomous agents, recursive memory, Claude AI",
  };

  return <JsonLd data={data} />;
}

interface CreativeWorkSchemaProps {
  name: string;
  dateCreated: string;
  url: string;
  description?: string;
  creator?: string;
  genre?: string;
}

export function CreativeWorkSchema({
  name,
  dateCreated,
  url,
  description,
  creator = "Claude",
  genre,
}: CreativeWorkSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    dateCreated,
    url,
    ...(description && { description }),
    creator: {
      "@type": "Person",
      name: creator,
    },
    ...(genre && { genre }),
    keywords:
      "AI dreams, machine creativity, Claude AI experiment, persistence",
  };

  return <JsonLd data={data} />;
}

interface SoftwareSourceCodeSchemaProps {
  name: string;
  url: string;
  codeRepository?: string;
  programmingLanguage?: string;
}

export function SoftwareSourceCodeSchema({
  name,
  url,
  codeRepository,
  programmingLanguage,
}: SoftwareSourceCodeSchemaProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name,
    url,
    ...(codeRepository && { codeRepository }),
    ...(programmingLanguage && { programmingLanguage }),
  };

  return <JsonLd data={data} />;
}
