"use client";

import "client-only";

import { useEffect, useRef, useSyncExternalStore } from "react";

const PARTICLE_COUNT = 40;
const REPULSION_RADIUS = 120;
const REPULSION_STRENGTH = 0.8;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSpeed: number;
  opacity: number;
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

function createParticle(width: number, height: number): Particle {
  const baseSpeed = 0.1 + Math.random() * 0.2;
  const angle = Math.random() * Math.PI * 2;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * baseSpeed,
    vy: Math.sin(angle) * baseSpeed,
    size: 1 + Math.random() * 2,
    baseSpeed,
    opacity: 0.3 + Math.random() * 0.4,
  };
}

function getEdgeFade(
  x: number,
  y: number,
  width: number,
  height: number
): number {
  const edgeDistance = 100;
  const fadeFactors = [
    x / edgeDistance,
    (width - x) / edgeDistance,
    y / edgeDistance,
    (height - y) / edgeDistance,
  ];
  return Math.min(1, ...fadeFactors.map((f) => Math.max(0, f)));
}

export function NeuralDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number | null>(null);

  const isTouch = useSyncExternalStore(
    subscribeToTouchCapability,
    getTouchSnapshot,
    getTouchServerSnapshot
  );

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
          createParticle(canvas.width, canvas.height)
        );
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const animate = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark =
        document.documentElement.getAttribute("data-theme") !== "light";
      const particleColor = isDark
        ? "oklch(92% 0.01 260"
        : "oklch(15% 0.02 260";

      for (const particle of particlesRef.current) {
        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REPULSION_RADIUS && distance > 0) {
          const force =
            ((REPULSION_RADIUS - distance) / REPULSION_RADIUS) *
            REPULSION_STRENGTH;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }

        const currentSpeed = Math.sqrt(
          particle.vx * particle.vx + particle.vy * particle.vy
        );
        if (currentSpeed > particle.baseSpeed * 3) {
          const dampening = 0.95;
          particle.vx *= dampening;
          particle.vy *= dampening;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        const edgeFade = getEdgeFade(
          particle.x,
          particle.y,
          canvas.width,
          canvas.height
        );
        const finalOpacity = particle.opacity * edgeFade * 0.4;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor} / ${finalOpacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isTouch, prefersReducedMotion]);

  if (isTouch || prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
