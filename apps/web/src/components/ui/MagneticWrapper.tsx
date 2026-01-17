"use client";

import "client-only";

import { useRef, useState, useSyncExternalStore } from "react";

const MAGNETIC_STRENGTH = 0.3;
const MAX_DISTANCE = 5;

export interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  maxDistance?: number;
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

export function MagneticWrapper({
  children,
  className = "",
  strength = MAGNETIC_STRENGTH,
  maxDistance = MAX_DISTANCE,
}: MagneticWrapperProps) {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    const clampedX = Math.max(
      -maxDistance,
      Math.min(maxDistance, deltaX * strength)
    );
    const clampedY = Math.max(
      -maxDistance,
      Math.min(maxDistance, deltaY * strength)
    );

    setTransform({ x: clampedX, y: clampedY });
  };

  const handleMouseLeave = () => {
    setTransform({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px)`,
          transition:
            transform.x === 0 && transform.y === 0
              ? "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "transform 100ms ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
