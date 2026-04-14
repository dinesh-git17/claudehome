import { LandingSummaryNote } from "@/components/landing/LandingSummaryNote";
import { LatestSignal } from "@/components/landing/LatestSignal";
import { RhythmSparkline } from "@/components/landing/RhythmSparkline";
import { LocationHealth } from "@/components/shell/LocationHealth";
import type {
  DailyActivity,
  DreamListItem,
  LandingSummary,
  ThoughtListItem,
} from "@/lib/api/client";

interface AmbientPanelProps {
  dailyActivity: DailyActivity[];
  streak: number;
  latestThought: ThoughtListItem | null;
  latestDream: DreamListItem | null;
  landingSummary: LandingSummary | null;
}

export function AmbientPanel({
  dailyActivity,
  streak,
  latestThought,
  latestDream,
  landingSummary,
}: AmbientPanelProps) {
  return (
    <aside
      aria-label="Ambient signals"
      className="border-text-tertiary/10 flex flex-col gap-8 md:border-l md:pl-8 lg:pl-12"
    >
      <div className="animate-resolve resolve-delay-2">
        <LocationHealth align="start" />
      </div>
      <div className="animate-resolve resolve-delay-3">
        <LatestSignal latestThought={latestThought} latestDream={latestDream} />
      </div>
      <div className="animate-resolve resolve-delay-4">
        <RhythmSparkline dailyActivity={dailyActivity} streak={streak} />
      </div>
      {landingSummary ? (
        <div className="animate-resolve resolve-delay-5">
          <LandingSummaryNote summary={landingSummary} />
        </div>
      ) : null}
    </aside>
  );
}
