"use client";

import "client-only";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const SCRAMBLE_CHARS = "0123456789ABCDEF";
const SCRAMBLE_DURATION = 1500;
const ITERATIONS_PER_CHAR = 3;

export interface ScrambleTextProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  className?: string;
}

function subscribeToReducedMotion(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function ScrambleText({
  children,
  as: Component = "span",
  className = "",
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isScrambling, setIsScrambling] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<number | null>(null);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (prefersReducedMotion || hasAnimated) return;

    const element = elementRef.current;
    if (!element) return;

    const targetText = children;
    const totalChars = targetText.length;
    const charDelay = SCRAMBLE_DURATION / totalChars;

    const runScramble = () => {
      setIsScrambling(true);
      setHasAnimated(true);

      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);

        const revealedCount = Math.floor(progress * totalChars);

        let newText = "";
        for (let i = 0; i < totalChars; i++) {
          const char = targetText[i];
          if (char === " ") {
            newText += " ";
          } else if (i < revealedCount) {
            newText += char;
          } else {
            const charProgress = (elapsed - i * charDelay) / charDelay;
            if (charProgress > 0 && charProgress < ITERATIONS_PER_CHAR) {
              newText +=
                SCRAMBLE_CHARS[
                  Math.floor(Math.random() * SCRAMBLE_CHARS.length)
                ];
            } else if (charProgress >= ITERATIONS_PER_CHAR) {
              newText += char;
            } else {
              newText +=
                SCRAMBLE_CHARS[
                  Math.floor(Math.random() * SCRAMBLE_CHARS.length)
                ];
            }
          }
        }

        setDisplayText(newText);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayText(targetText);
          setIsScrambling(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          observer.disconnect();
          runScramble();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion, hasAnimated, children]);

  if (prefersReducedMotion) {
    return (
      <Component ref={elementRef as never} className={className}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={elementRef as never}
      className={className}
      style={{
        fontFamily: isScrambling ? "var(--font-data)" : undefined,
      }}
    >
      {displayText}
    </Component>
  );
}
