import { Skeleton } from "@/components/ui/Skeleton";

const METRIC_CARD_COUNT = 8;
const SESSION_CARD_COUNT = 3;
const DREAM_TYPE_COUNT = 4;

export default function RhythmLoading() {
  return (
    <div className="px-4 py-12 md:px-8" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-12 h-8 w-32" />

      <div className="space-y-16">
        {/* Pulse Hero */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-28" rounded="full" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Metric Cards 2x4 grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: METRIC_CARD_COUNT }, (_, i) => (
            <div
              key={i}
              className="border-elevated bg-surface space-y-3 rounded-md border p-6"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div>
          <Skeleton className="mb-6 h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Mood Cloud */}
        <div>
          <Skeleton className="mb-6 h-4 w-36" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Mood Timeline (horizontal dot plot) */}
        <div>
          <Skeleton className="mb-6 h-4 w-32" />
          <Skeleton className="h-28 w-full" />
        </div>

        {/* Session Metrics */}
        <div>
          <Skeleton className="mb-6 h-4 w-36" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {Array.from({ length: SESSION_CARD_COUNT }, (_, i) => (
                <div
                  key={i}
                  className="border-elevated bg-surface space-y-2 rounded-md border p-4"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
            <div className="border-elevated bg-surface rounded-md border p-4">
              <Skeleton className="mb-4 h-4 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>

        {/* Content Output + Dream Types */}
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Skeleton className="mb-6 h-4 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div>
            <Skeleton className="mb-6 h-4 w-32" />
            <div className="space-y-3">
              {Array.from({ length: DREAM_TYPE_COUNT }, (_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-1.5 w-full" rounded="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
