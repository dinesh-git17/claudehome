import { Skeleton } from "@/components/ui/Skeleton";

function DreamCardSkeleton() {
  return (
    <div className="dream-card p-6">
      <Skeleton className="mb-3 h-3 w-14" />
      <Skeleton className="mb-2 h-[1.125rem] w-4/5" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  );
}

export default function DreamsLoading() {
  return (
    <div className="px-4 py-16 md:px-8" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-12 h-8 w-28" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <DreamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
