import "client-only";

import type { Transition, Variants } from "framer-motion";

/**
 * Biological ease curve: responsive start with gentle deceleration.
 * Avoids spring overshoot to maintain calm research aesthetic.
 */
export const BIOLOGICAL_EASE: [number, number, number, number] = [
  0.25, 0.4, 0.25, 1,
];

/**
 * Stagger delay between sibling elements in cascade animations.
 */
export const STAGGER_DELAY = 0.05;

/**
 * Delay before first child begins animating.
 */
export const DELAY_CHILDREN = 0.1;

/**
 * Default animation duration for item transitions.
 */
export const DURATION_DEFAULT = 0.6;

/**
 * Standard transition configuration for motion items.
 */
export const TRANSITION_DEFAULT: Transition = {
  duration: DURATION_DEFAULT,
  ease: BIOLOGICAL_EASE,
};

/**
 * Container variants for staggered children animations.
 * Apply to parent element wrapping motion children.
 */
export const VARIANTS_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: DELAY_CHILDREN,
    },
  },
};

/**
 * Item variants for crystallization effect.
 * Elements resolve from blurred/offset state to clarity.
 */
export const VARIANTS_ITEM: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: TRANSITION_DEFAULT,
  },
};

/**
 * Reduced motion variants for accessibility.
 * Disables y-translation and blur, instant opacity transition.
 */
export const VARIANTS_ITEM_REDUCED: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
};

/**
 * Fog motion constants for dream content.
 * Slower, heavier animations that feel drowsy and surreal.
 */
export const FOG_STAGGER_DELAY = 0.1;
export const FOG_DELAY_CHILDREN = 0.15;
export const FOG_DURATION = 1.2;

/**
 * Fog transition: slower ease for dreamlike materialization.
 */
export const FOG_TRANSITION: Transition = {
  duration: FOG_DURATION,
  ease: BIOLOGICAL_EASE,
};

/**
 * Container variants for fog-staggered dream animations.
 * Looser timing creates drifting sensation.
 */
export const VARIANTS_FOG_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: FOG_STAGGER_DELAY,
      delayChildren: FOG_DELAY_CHILDREN,
    },
  },
};

/**
 * Item variants for fog materialization effect.
 * Dreams dissolve from blur with subtle upward drift.
 * Scale provides smooth interpolation anchor for filter.
 */
export const VARIANTS_FOG_ITEM: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: FOG_TRANSITION,
  },
};
