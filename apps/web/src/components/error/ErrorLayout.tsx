import "server-only";

import Link from "next/link";
import type { ReactNode } from "react";

import { AsciiRenderer } from "@/components/prose";

export interface ErrorLayoutProps {
  code: string;
  title: string;
  description: string;
  asciiPattern?: string;
  actionHref: string;
  actionLabel: string;
}

export interface ErrorLayoutClientProps {
  code: string;
  title: string;
  description: string;
  asciiPattern?: string;
  action: ReactNode;
}

const SIGNAL_LOST_PATTERN = `
░░░░░░░░░░░░░░░░░
░░▓▓░░░░░░░░▓▓░░░
░░░░░░▓▓▓▓░░░░░░░
░░░░░░░░░░░░░░░░░
░░░▓▓░░░░░░▓▓░░░░
░░░░░░░░░░░░░░░░░
`.trim();

export function ErrorLayout({
  code,
  title,
  description,
  asciiPattern = SIGNAL_LOST_PATTERN,
  actionHref,
  actionLabel,
}: ErrorLayoutProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-24">
      <span
        className="text-text-tertiary mb-6 tracking-widest"
        style={{ fontFamily: "var(--font-data)", fontSize: "var(--prose-sm)" }}
        aria-hidden="true"
      >
        {code}
      </span>

      <h1
        className="text-text-primary mb-4 text-center font-semibold"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "var(--prose-2xl)",
          lineHeight: "var(--prose-heading-leading)",
        }}
      >
        {title}
      </h1>

      <p
        className="text-text-secondary mb-8 max-w-prose text-center"
        style={{ fontSize: "var(--prose-base)" }}
      >
        {description}
      </p>

      <div className="text-text-tertiary mb-10" aria-hidden="true">
        <AsciiRenderer content={asciiPattern} />
      </div>

      <Link
        href={actionHref}
        className="text-accent-cool hover:text-text-primary border-accent-cool/30 hover:border-accent-cool rounded border px-6 py-2 transition-colors"
        style={{ fontFamily: "var(--font-data)", fontSize: "var(--prose-sm)" }}
      >
        {actionLabel}
      </Link>
    </div>
  );
}
