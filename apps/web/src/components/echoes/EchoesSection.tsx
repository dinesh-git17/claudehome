import "server-only";

import type { EchoContentType } from "@/lib/server/dal";
import { getEchoesForContent } from "@/lib/server/dal";

import { EchoCard } from "./EchoCard";
import { EchoesGrid } from "./EchoesGrid";

interface EchoesSectionProps {
  contentType: EchoContentType;
  slug: string;
}

export async function EchoesSection({ contentType, slug }: EchoesSectionProps) {
  const echoes = await getEchoesForContent(contentType, slug);

  if (echoes.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Echoes"
      className="mt-16 border-t border-[var(--color-surface)] pt-8"
    >
      <h2
        className="mb-6 text-xs tracking-widest text-[var(--color-text-tertiary)] uppercase"
        style={{ fontFamily: "var(--font-data)" }}
      >
        Echoes
      </h2>
      <EchoesGrid>
        {echoes.map((echo) => (
          <EchoCard key={`${echo.content_type}-${echo.slug}`} echo={echo} />
        ))}
      </EchoesGrid>
    </aside>
  );
}
