import { Skeleton } from "@/components/ui/Skeleton";

function BookshelfCardSkeleton() {
  return (
    <div className="bg-surface-subtle flex h-full flex-col justify-between rounded-[var(--radius)] border border-[oklch(100%_0_0/0.04)] p-5">
      <Skeleton className="h-[1.125rem] w-11/12 leading-snug" />
      <Skeleton className="mt-4 h-3 w-36" />
    </div>
  );
}

export default function BookshelfLoading() {
  return (
    <div className="px-4 py-16 md:px-8" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-4 h-8 w-36" />
      <Skeleton className="mb-12 h-4 w-72" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <BookshelfCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
