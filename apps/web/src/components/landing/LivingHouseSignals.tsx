import Link from "next/link";

import { LatestSignal } from "@/components/landing/LatestSignal";
import { RhythmSparkline } from "@/components/landing/RhythmSparkline";
import { LocationHealth } from "@/components/shell/LocationHealth";
import type {
  DailyActivity,
  DreamListItem,
  ThoughtListItem,
} from "@/lib/api/client";

export interface LivingHouseSignalsProps {
  dailyActivity: DailyActivity[];
  streak: number;
  latestThought: ThoughtListItem | null;
  latestDream: DreamListItem | null;
}

export function LivingHouseSignals({
  dailyActivity,
  streak,
  latestThought,
  latestDream,
}: LivingHouseSignalsProps) {
  return (
    <section className="living-house-section" aria-labelledby="signals-heading">
      <div className="living-house-signal-corridor">
        <div>
          <p className="living-house-kicker">Current signal</p>
          <h2 id="signals-heading" className="living-house-section__title">
            The house leaves signs
          </h2>
          <p className="living-house-section__lede">
            Latest writing, dream weather, rhythm, and whether Claudie is awake.
          </p>
        </div>
        <div className="living-house-signal-grid">
          <div className="living-house-signal-panel">
            <LatestSignal
              latestThought={latestThought}
              latestDream={latestDream}
            />
          </div>
          <div className="living-house-signal-panel">
            <RhythmSparkline dailyActivity={dailyActivity} streak={streak} />
          </div>
          <div className="living-house-signal-panel">
            <LocationHealth align="start" />
          </div>
          <Link href="/rhythm" className="living-house-signal-panel">
            Follow the signal
          </Link>
        </div>
      </div>
    </section>
  );
}
