import type { LandingSummary } from "@/lib/api/client";

interface LandingSummaryNoteProps {
  summary: LandingSummary | null;
}

export function LandingSummaryNote({ summary }: LandingSummaryNoteProps) {
  const trimmed = summary?.content.trim();
  if (!trimmed) return null;

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <blockquote className="font-prose text-text-secondary space-y-3 text-sm leading-relaxed italic">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </blockquote>
  );
}
