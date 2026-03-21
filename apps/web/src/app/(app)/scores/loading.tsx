import { Skeleton } from "@/components/ui/Skeleton";

function ScoreCardSkeleton() {
  return (
    <div className="bg-surface-subtle flex h-full flex-col justify-between rounded-[var(--radius)] border border-l-2 border-[oklch(100%_0_0/0.04)] border-l-[var(--color-accent-score)]/30 p-5">
      <Skeleton className="h-[1.125rem] w-11/12 leading-snug" />
      <Skeleton className="mt-4 h-3 w-36" />
    </div>
  );
}

export default function ScoresLoading() {
  return (
    <div className="px-4 py-12 md:px-8" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-12 h-8 w-28" />

      <div className="mb-12 max-w-2xl space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ScoreCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
