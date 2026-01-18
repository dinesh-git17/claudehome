"use client";

import "client-only";

import { useEffect, useSyncExternalStore } from "react";

export type HealthStatus = "connecting" | "live" | "offline";

const HEALTH_ENDPOINT = "https://api.claudehome.dineshd.dev/api/v1/health/live";
const POLL_INTERVAL_MS = 30_000;
const MAX_BACKOFF_MS = 120_000;
const BASE_BACKOFF_MS = 1_000;

interface HealthState {
  status: HealthStatus;
  lastChecked: number | null;
  retryCount: number;
}

let state: HealthState = {
  status: "connecting",
  lastChecked: null,
  retryCount: 0,
};

let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;
let subscriberCount = 0;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function scheduleNextPoll(delayMs: number): void {
  if (pollTimeoutId !== null) {
    clearTimeout(pollTimeoutId);
  }
  pollTimeoutId = setTimeout(() => {
    void checkHealth();
  }, delayMs);
}

function handleSuccess(): void {
  state = { status: "live", lastChecked: Date.now(), retryCount: 0 };
  emit();
  scheduleNextPoll(POLL_INTERVAL_MS);
}

function handleFailure(): void {
  const nextRetryCount = state.retryCount + 1;
  state = {
    status: "offline",
    lastChecked: Date.now(),
    retryCount: nextRetryCount,
  };
  emit();

  const backoffMs = Math.min(
    BASE_BACKOFF_MS * Math.pow(2, nextRetryCount - 1),
    MAX_BACKOFF_MS
  );
  scheduleNextPoll(backoffMs);
}

async function checkHealth(): Promise<void> {
  abortController?.abort();
  abortController = new AbortController();

  try {
    const response = await fetch(HEALTH_ENDPOINT, {
      method: "GET",
      signal: abortController.signal,
      cache: "no-store",
    });

    if (response.ok) {
      handleSuccess();
    } else {
      handleFailure();
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
    handleFailure();
  }
}

function startPolling(): void {
  if (state.status === "connecting" && state.lastChecked === null) {
    void checkHealth();
  }
}

function stopPolling(): void {
  if (pollTimeoutId !== null) {
    clearTimeout(pollTimeoutId);
    pollTimeoutId = null;
  }
  abortController?.abort();
  abortController = null;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  subscriberCount++;

  if (subscriberCount === 1) {
    startPolling();
  }

  return () => {
    listeners.delete(callback);
    subscriberCount--;

    if (subscriberCount === 0) {
      stopPolling();
    }
  };
}

function getSnapshot(): HealthStatus {
  return state.status;
}

function getServerSnapshot(): HealthStatus {
  return "connecting";
}

export interface UseHealthSignalReturn {
  status: HealthStatus;
  refresh: () => void;
}

function refresh(): void {
  state = { ...state, retryCount: 0 };
  void checkHealth();
}

export function useHealthSignal(): UseHealthSignalReturn {
  const status = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    return () => {
      // Cleanup handled by subscribe's return function
    };
  }, []);

  return { status, refresh };
}
