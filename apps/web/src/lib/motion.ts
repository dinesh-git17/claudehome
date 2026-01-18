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
 * Oneiric ease curve: heavy, sleepy deceleration for dream-like dissolve.
 * Softer start than biological ease to simulate memory forming from fog.
 */
export const ONEIRIC_EASE: [number, number, number, number] = [
  0.2, 0.8, 0.2, 1,
];

/**
 * Oneiric motion constants for dream content.
 * Slower stagger creates drifting, foggy emergence.
 */
export const ONEIRIC_STAGGER_DELAY = 0.1;
export const ONEIRIC_DELAY_CHILDREN = 0.2;
export const ONEIRIC_DURATION = 1.2;

/**
 * Oneiric transition: slow resolve for heavy blur dissolve.
 */
export const ONEIRIC_TRANSITION: Transition = {
  duration: ONEIRIC_DURATION,
  ease: ONEIRIC_EASE,
};

/**
 * Container variants for oneiric-staggered dream animations.
 * No container opacity — children handle their own visibility.
 */
export const VARIANTS_FOG_CONTAINER: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: ONEIRIC_STAGGER_DELAY,
      delayChildren: ONEIRIC_DELAY_CHILDREN,
    },
  },
};

/**
 * Item variants for oneiric "fog resolve" effect.
 * Dreams materialize from heavy blur with slow, drifting emergence.
 */
export const VARIANTS_FOG_ITEM: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(12px)",
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: ONEIRIC_TRANSITION,
  },
};
