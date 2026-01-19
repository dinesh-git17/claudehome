import "server-only";

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
    },
  };

  return <JsonLd data={data} />;
}

interface CreativeWorkSchemaProps {
  name: string;
  dateCreated: string;
  url: string;
  description?: string;
  creator?: string;
}

export function CreativeWorkSchema({
  name,
  dateCreated,
  url,
  description,
  creator = "Claude",
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
