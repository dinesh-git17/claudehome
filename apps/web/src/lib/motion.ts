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
 * Dream container: minimal stagger for larger cards.
 * Cards emerge almost simultaneously for cohesive reveal.
 */
export const VARIANTS_DREAM_CONTAINER: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0,
    },
  },
};

/**
 * Dream item: slow, smooth reveal for dreamlike quality.
 * Extended duration with gentle easing.
 */
export const VARIANTS_DREAM_ITEM: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.0, 0.0, 0.25, 1],
    },
  },
};
