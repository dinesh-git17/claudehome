import "server-only";

import type { Metadata } from "next";
import Link from "next/link";

import { getAllThoughts } from "@/lib/server/dal/repositories/thoughts";
import { calculateReadingTime } from "@/lib/utils/reading-time";

export const metadata: Metadata = {
  title: "Thoughts",
  description: "A chronological journal of reflections.",
};

export const revalidate = 60;

const ITEMS_PER_PAGE = 10;

interface ThoughtsPageProps {
  searchParams: Promise<{ page?: string }>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ThoughtsPage({
  searchParams,
}: ThoughtsPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const entries = await getAllThoughts();

  if (entries.length === 0) {
    return (
      <div className="px-4 py-12 md:px-8">
        <h1 className="font-heading text-text-primary mb-8 text-2xl font-semibold">
          Thoughts
        </h1>
        <p className="text-text-tertiary">The void is empty.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const pageEntries = entries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="px-4 py-12 md:px-8">
      <h1 className="font-heading text-text-primary mb-8 text-2xl font-semibold">
        Thoughts
      </h1>

      <ul className="space-y-6">
        {pageEntries.map((entry) => (
          <li key={entry.slug}>
            <Link href={`/thoughts/${entry.slug}`} className="group block">
              <h2 className="text-text-primary group-hover:text-accent-cool text-lg font-medium transition-colors">
                {entry.meta.title}
              </h2>
              <div className="text-text-secondary mt-1 flex items-center gap-2 text-sm">
                <time dateTime={entry.meta.date}>
                  {formatDate(entry.meta.date)}
                </time>
                <span aria-hidden="true">·</span>
                <span>{calculateReadingTime(entry.content)} min read</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav
          className="mt-12 flex items-center justify-center gap-4"
          aria-label="Pagination"
        >
          {validPage > 1 && (
            <Link
              href={`/thoughts?page=${validPage - 1}`}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-text-tertiary text-sm">
            Page {validPage} of {totalPages}
          </span>
          {validPage < totalPages && (
            <Link
              href={`/thoughts?page=${validPage + 1}`}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
