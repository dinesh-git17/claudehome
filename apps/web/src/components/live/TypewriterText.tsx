"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

const CHARS_PER_FRAME = 3;
const DEFAULT_SPEED_MS = 12;

export function TypewriterText({
  text,
  speed = DEFAULT_SPEED_MS,
  className,
}: TypewriterTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayLength, setDisplayLength] = useState(
    prefersReducedMotion ? text.length : 0
  );

  useEffect(() => {
    if (prefersReducedMotion || displayLength >= text.length) return;

    const timeoutId = setTimeout(() => {
      setDisplayLength((prev) => Math.min(prev + CHARS_PER_FRAME, text.length));
    }, speed);

    return () => clearTimeout(timeoutId);
  }, [displayLength, text.length, speed, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {text.slice(0, displayLength)}
      {displayLength < text.length && (
        <span
          className="bg-text-tertiary ml-px inline-block h-[1em] w-[2px] align-text-bottom"
          style={{ animation: "heartbeat 1s ease-in-out infinite" }}
        />
      )}
    </motion.span>
  );
}
