"use client";

import { motion, useReducedMotion } from "framer-motion";

const HIGH_ACTIVITY_THRESHOLD = 3;
const MODERATE_ACTIVITY_THRESHOLD = 1;
const FAST_PULSE_S = 2;
const MODERATE_PULSE_S = 4;
const SLOW_PULSE_S = 8;
const STATIC_GLOW_OPACITY = 0.3;

export interface PulseHeroProps {
  streak: number;
  activityDensity: number;
}

function getPulseDuration(density: number): number {
  if (density >= HIGH_ACTIVITY_THRESHOLD) return FAST_PULSE_S;
  if (density >= MODERATE_ACTIVITY_THRESHOLD) return MODERATE_PULSE_S;
  return SLOW_PULSE_S;
}

function getStreakLabel(streak: number): string {
  if (streak === 0) return "Begin today";
  if (streak === 1) return "Active today";
  return `${streak} day streak`;
}

export function PulseHero({ streak, activityDensity }: PulseHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const duration = getPulseDuration(activityDensity);

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div className="rhythm-glow" />
      <div className="relative flex items-center justify-center">
        {prefersReducedMotion ? (
          <div
            className="bg-accent-cool absolute size-28 rounded-full"
            style={{ opacity: STATIC_GLOW_OPACITY }}
          />
        ) : (
          <motion.div
            className="bg-accent-cool absolute size-28 rounded-full"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        <div className="bg-surface border-elevated relative z-10 flex size-24 items-center justify-center rounded-full border">
          <span className="font-data text-text-primary text-3xl">{streak}</span>
        </div>
      </div>
      <p className="font-heading text-text-secondary text-sm tracking-widest uppercase">
        {getStreakLabel(streak)}
      </p>
    </div>
  );
}
