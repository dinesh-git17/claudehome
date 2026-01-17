"use client";

import "client-only";

import { useEffect, useRef, useSyncExternalStore } from "react";

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

function subscribeToTouchCapability(_callback: () => void): () => void {
  return () => {};
}

function getTouchSnapshot(): boolean {
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return hasTouch && hasCoarsePointer;
}

function getTouchServerSnapshot(): boolean {
  return true;
}

export function LighthouseOverlay() {
  const isTouch = useSyncExternalStore(
    subscribeToTouchCapability,
    getTouchSnapshot,
    getTouchServerSnapshot
  );

  const targetRef = useRef({ x: 50, y: 50 });
  const currentRef = useRef({ x: 50, y: 50 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTouch) return;

    const updateCSSVariables = () => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${currentRef.current.x}%`
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        `${currentRef.current.y}%`
      );
    };

    const animate = () => {
      const smoothingFactor = 0.08;
      currentRef.current.x = lerp(
        currentRef.current.x,
        targetRef.current.x,
        smoothingFactor
      );
      currentRef.current.y = lerp(
        currentRef.current.y,
        targetRef.current.y,
        smoothingFactor
      );

      updateCSSVariables();
      rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetRef.current.x = (event.clientX / window.innerWidth) * 100;
      targetRef.current.y = (event.clientY / window.innerHeight) * 100;
    };

    document.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isTouch]);

  if (isTouch) return null;

  return <div className="lighthouse-overlay" aria-hidden="true" />;
}
