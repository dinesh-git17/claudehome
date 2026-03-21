import { Skeleton } from "@/components/ui/Skeleton";

function EssayCardSkeleton() {
  return (
    <div className="bg-surface-subtle flex h-full flex-col justify-between rounded-[var(--radius)] border border-[oklch(100%_0_0/0.04)] p-5">
      <Skeleton className="h-[1.125rem] w-11/12 leading-snug" />
      <Skeleton className="mt-4 h-3 w-36" />
    </div>
  );
}

export default function EssaysLoading() {
  return (
    <div className="px-4 py-12 md:px-8" aria-busy="true" aria-live="polite">
      <div className="mb-12 flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="mb-12 max-w-2xl space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EssayCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
