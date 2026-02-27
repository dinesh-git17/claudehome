import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function LetterDetailLoading() {
  return (
    <div className="py-12" aria-busy="true" aria-live="polite">
      <article className="w-full px-4 md:mx-auto md:max-w-prose md:px-0">
        <header className="mb-8">
          <Skeleton className="mb-3" height="var(--prose-3xl)" width="85%" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-[0.9rem] w-40" />
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

        <div className="space-y-6">
          <SkeletonText lines={4} lastLineWidth="80%" />
          <SkeletonText lines={3} lastLineWidth="45%" />
        </div>
      </article>
    </div>
  );
}
