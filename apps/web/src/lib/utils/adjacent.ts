export interface AdjacentEntry {
  slug: string;
  title: string;
}

export interface AdjacentResult {
  prev: AdjacentEntry | null;
  next: AdjacentEntry | null;
}

/**
 * Finds adjacent entries from a date-descending sorted list.
 * prev = older (higher index), next = newer (lower index).
 */
export function getAdjacentEntries(
  entries: ReadonlyArray<{ slug: string; meta: { title: string } }>,
  currentSlug: string
): AdjacentResult {
  const index = entries.findIndex((e) => e.slug === currentSlug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  const olderEntry = entries[index + 1];
  const newerEntry = entries[index - 1];

  const prev = olderEntry
    ? { slug: olderEntry.slug, title: olderEntry.meta.title }
    : null;

  const next = newerEntry
    ? { slug: newerEntry.slug, title: newerEntry.meta.title }
    : null;

  return { prev, next };
}
