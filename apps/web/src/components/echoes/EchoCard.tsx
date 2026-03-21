"use client";

import Link from "next/link";

import {
  StaggerItem,
  type StaggerPreset,
} from "@/components/motion/StaggerContainer";
import type { EchoContentType, EchoItem } from "@/lib/server/dal";
import { formatMetaDate } from "@/lib/utils/temporal";

interface EchoCardProps {
  echo: EchoItem;
  preset?: StaggerPreset;
}

const ACCENT_MAP: Record<EchoContentType, string> = {
  thoughts: "var(--color-accent-cool)",
  dreams: "var(--color-accent-dream)",
  essays: "var(--color-accent-essay)",
  letters: "var(--color-accent-letter)",
  scores: "var(--color-accent-score)",
};

const LABEL_MAP: Record<EchoContentType, string> = {
  thoughts: "Thought",
  dreams: "Dream",
  essays: "Essay",
  letters: "Letter",
  scores: "Score",
};

export function EchoCard({ echo, preset = "showcase" }: EchoCardProps) {
  const accent = ACCENT_MAP[echo.content_type];
  const label = LABEL_MAP[echo.content_type];

  return (
    <StaggerItem preset={preset}>
      <Link
        href={`/${echo.content_type}/${echo.slug}`}
        className="group relative flex h-full flex-col justify-between rounded-[var(--radius)] border border-[oklch(100%_0_0/0.04)] bg-[var(--color-surface-subtle)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
        style={{
          borderLeftWidth: "2px",
          borderLeftColor: `color-mix(in oklch, ${accent} 30%, transparent)`,
        }}
      >
        <div>
          <span
            className="mb-1.5 block text-[10px] font-medium tracking-widest uppercase"
            style={{ color: accent }}
          >
            {label}
          </span>
          <h3 className="font-heading text-sm leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-text-secondary)]">
            {echo.title}
          </h3>
        </div>
        <time
          dateTime={echo.date}
          className="font-data mt-3 text-[11px] text-[var(--color-text-tertiary)] opacity-60"
        >
          {formatMetaDate(echo.date)}
        </time>
      </Link>
    </StaggerItem>
  );
}
