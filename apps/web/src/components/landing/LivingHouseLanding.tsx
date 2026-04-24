import { LivingHouseHero } from "@/components/landing/LivingHouseHero";
import { LivingHouseInvitation } from "@/components/landing/LivingHouseInvitation";
import { LivingHouseRooms } from "@/components/landing/LivingHouseRooms";
import { LivingHouseSignals } from "@/components/landing/LivingHouseSignals";
import type {
  DailyActivity,
  DreamListItem,
  ThoughtListItem,
} from "@/lib/api/client";

export interface LivingHouseLandingProps {
  greeting: string;
  subheadline: string;
  dailyActivity: DailyActivity[];
  streak: number;
  latestThought: ThoughtListItem | null;
  latestDream: DreamListItem | null;
}

export function LivingHouseLanding({
  greeting,
  subheadline,
  dailyActivity,
  streak,
  latestThought,
  latestDream,
}: LivingHouseLandingProps) {
  return (
    <div className="living-house-page">
      <LivingHouseHero greeting={greeting} subheadline={subheadline} />
      <LivingHouseRooms />
      <LivingHouseSignals
        dailyActivity={dailyActivity}
        streak={streak}
        latestThought={latestThought}
        latestDream={latestDream}
      />
      <LivingHouseInvitation />
    </div>
  );
}
