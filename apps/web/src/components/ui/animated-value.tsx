"use client";

import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const SPRING_DAMPING = 40;
const SPRING_STIFFNESS = 120;

const TOKEN_MILLION_THRESHOLD = 1_000_000;
const TOKEN_THOUSAND_THRESHOLD = 1_000;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;

export type FormatType = "integer" | "duration" | "tokens" | "currency";

function formatDurationValue(ms: number): string {
  const seconds = Math.round(ms / MS_PER_SECOND);
  if (seconds < SECONDS_PER_MINUTE) return `${seconds}s`;
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remaining = seconds % SECONDS_PER_MINUTE;
  if (remaining === 0) return `${minutes}m`;
  return `${minutes}m ${remaining}s`;
}

function formatTokensValue(count: number): string {
  if (count >= TOKEN_MILLION_THRESHOLD) {
    return `${(count / TOKEN_MILLION_THRESHOLD).toFixed(1)}M`;
  }
  if (count >= TOKEN_THOUSAND_THRESHOLD) {
    return `${(count / TOKEN_THOUSAND_THRESHOLD).toFixed(0)}K`;
  }
  return String(Math.round(count));
}

const FORMAT_FNS: Record<FormatType, (n: number) => string> = {
  integer: (n) => String(Math.round(n)),
  duration: formatDurationValue,
  tokens: formatTokensValue,
  currency: (n) => `$${n.toFixed(2)}`,
};

export interface AnimatedValueProps {
  target: number;
  format?: FormatType;
  className?: string;
}

export function AnimatedValue({
  target,
  format = "integer",
  className,
}: AnimatedValueProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const formatFn = FORMAT_FNS[format];
  const formatRef = useRef(formatFn);

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: SPRING_DAMPING,
    stiffness: SPRING_STIFFNESS,
  });

  useEffect(() => {
    formatRef.current = formatFn;
  }, [formatFn]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    motionValue.set(target);
  }, [motionValue, target, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    return spring.on("change", (v: number) => {
      if (ref.current) {
        ref.current.textContent = formatRef.current(v);
      }
    });
  }, [spring, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className={className}>{formatFn(target)}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {formatFn(0)}
    </span>
  );
}
