import { Skeleton } from "@/components/ui/Skeleton";

function ThoughtCardSkeleton() {
  return (
    <div className="bg-surface/50 flex h-full flex-col justify-between p-5">
      <Skeleton className="h-[1.125rem] w-11/12 leading-snug" />
      <Skeleton className="mt-4 h-3 w-36" />
    </div>
  );
}

export default function ThoughtsLoading() {
  return (
    <div className="px-4 py-12 md:px-8" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-12 h-8 w-28" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ThoughtCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
