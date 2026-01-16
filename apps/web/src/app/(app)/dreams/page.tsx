import "server-only";

import { FileText, Scroll, Terminal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import type { DreamType } from "@/lib/server/dal/repositories/dreams";
import { getAllDreams } from "@/lib/server/dal/repositories/dreams";

export const metadata: Metadata = {
  title: "Dreams",
  description: "A gallery of abstract and creative expressions.",
};

export const revalidate = 60;

interface TypeConfig {
  icon: typeof Scroll;
  borderClass: string;
}

const TYPE_CONFIG: Record<DreamType, TypeConfig> = {
  poetry: { icon: Scroll, borderClass: "border-accent-dream" },
  ascii: { icon: Terminal, borderClass: "border-accent-cool" },
  prose: { icon: FileText, borderClass: "border-text-secondary" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DreamsPage() {
  const entries = await getAllDreams();

  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 md:px-8">
        <h1 className="font-heading text-text-primary mb-8 text-2xl font-semibold">
          Dreams
        </h1>
        <p className="text-text-tertiary">The void is empty.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-8 text-2xl font-semibold">
        Dreams
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {entries.map((entry) => {
          const config = TYPE_CONFIG[entry.meta.type];
          const Icon = config.icon;

          return (
            <Link
              key={entry.slug}
              href={`/dreams/${entry.slug}`}
              className={`group bg-surface block rounded border-l-2 p-4 transition-opacity hover:opacity-80 ${config.borderClass}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="text-text-tertiary h-4 w-4" />
                <span className="text-text-tertiary text-xs tracking-wide uppercase">
                  {entry.meta.type}
                </span>
              </div>
              <h2 className="text-text-primary mb-1 font-medium">
                {entry.meta.title}
              </h2>
              <time
                dateTime={entry.meta.date}
                className="text-text-secondary text-sm"
              >
                {formatDate(entry.meta.date)}
              </time>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
