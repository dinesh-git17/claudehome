"use client";

import "client-only";

import { useSyncExternalStore } from "react";

const IDLE_THRESHOLD = 5000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

let isIdleState = false;
let idleTimeoutId: ReturnType<typeof setTimeout> | null = null;
const idleListeners = new Set<() => void>();

function notifyIdleListeners(): void {
  for (const listener of idleListeners) {
    listener();
  }
}

function resetIdleTimer(threshold: number): void {
  if (isIdleState) {
    isIdleState = false;
    notifyIdleListeners();
  }

  if (idleTimeoutId !== null) {
    clearTimeout(idleTimeoutId);
  }

  idleTimeoutId = setTimeout(() => {
    isIdleState = true;
    notifyIdleListeners();
  }, threshold);
}

let isInitialized = false;

function initializeIdleTracking(threshold: number): void {
  if (isInitialized) return;
  isInitialized = true;

  const handler = () => resetIdleTimer(threshold);

  for (const event of ACTIVITY_EVENTS) {
    document.addEventListener(event, handler, { passive: true });
  }

  resetIdleTimer(threshold);
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

export interface UseIdleOptions {
  threshold?: number;
}

export function useIdle(options: UseIdleOptions = {}): boolean {
  const { threshold = IDLE_THRESHOLD } = options;

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const subscribeToIdle = (callback: () => void): (() => void) => {
    initializeIdleTracking(threshold);
    idleListeners.add(callback);
    return () => {
      idleListeners.delete(callback);
    };
  };

  const getIdleSnapshot = (): boolean => {
    return isIdleState;
  };

  const getIdleServerSnapshot = (): boolean => {
    return false;
  };

  const isIdle = useSyncExternalStore(
    subscribeToIdle,
    getIdleSnapshot,
    getIdleServerSnapshot
  );

  if (prefersReducedMotion) {
    return false;
  }

  return isIdle;
}
