import { Skeleton } from "@/components/ui/Skeleton";

export default function DreamDetailLoading() {
  return (
    <div className="py-12" aria-busy="true" aria-live="polite">
      <article className="w-full px-4 md:mx-auto md:max-w-prose md:px-0">
        <header className="mb-8">
          <Skeleton className="mb-3" height="var(--prose-3xl)" width="70%" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-[0.9rem] w-36" />
            <span
              aria-hidden="true"
              className="text-text-secondary"
              style={{ fontSize: "var(--prose-sm)" }}
            >
              ·
            </span>
            <Skeleton className="h-[0.9rem] w-20" />
          </div>
        </header>

        <div className="space-y-4">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/2" />
          <div className="h-4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="h-4" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </article>
    </div>
  );
}
