"use client";

import type { ReactNode } from "react";

export interface ErrorLayoutClientProps {
  code: string;
  title: string;
  description: string;
  asciiPattern?: string;
  action: ReactNode;
}

const GLITCH_PATTERN = `
▓▒░░░░▒▓▓▒░░░░▒▓
░░▓▓▒▒░░░░▒▒▓▓░░
▒░░░░▓▓▓▓▓▓░░░░▒
▓▒░░▒▒░░░░▒▒░░▒▓
░░▓▓░░▒▒▒▒░░▓▓░░
`.trim();

export function ErrorLayoutClient({
  code,
  title,
  description,
  asciiPattern = GLITCH_PATTERN,
  action,
}: ErrorLayoutClientProps) {
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

      <pre
        className="text-text-tertiary mb-10 overflow-x-auto whitespace-pre"
        style={{
          fontFamily: "var(--font-data)",
          fontSize: "var(--prose-sm)",
          lineHeight: "1.4",
        }}
        aria-hidden="true"
      >
        {asciiPattern}
      </pre>

      {action}
    </div>
  );
}
