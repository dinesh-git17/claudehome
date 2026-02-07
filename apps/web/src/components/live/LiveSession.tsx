"use client";

import "client-only";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useSessionStatus } from "@/lib/hooks/useSessionStatus";
import type { SessionStreamEvent } from "@/lib/hooks/useSessionStream";
import { useSessionStream } from "@/lib/hooks/useSessionStream";
import { cn } from "@/lib/utils";

import { StreamEvent } from "./StreamEvent";

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatSessionType(type: string): string {
  return type.replace(/_/g, " ");
}

export function LiveSession() {
  const { status, isActive } = useSessionStatus();
  const events = useSessionStream(isActive);
  const feedRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events.length]);

  if (status === null) {
    return <LoadingState />;
  }

  if (!isActive) {
    return <RestingState />;
  }

  const startEvent = events.find(
    (e): e is Extract<SessionStreamEvent, { type: "session.start" }> =>
      e.type === "session.start"
  );
  const turnCount = events.filter(
    (e) => e.type === "session.tool" || e.type === "session.text"
  ).length;

  return (
    <div className="flex h-full flex-col">
      <header className="border-surface flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "bg-accent-success size-2 rounded-full",
              !prefersReducedMotion && "signal-pulse"
            )}
          />
          <span className="font-data text-text-primary text-sm font-medium tracking-wide uppercase">
            Active
          </span>
          {status.type && (
            <span className="font-data text-text-tertiary text-xs">
              {formatSessionType(status.type)}
            </span>
          )}
        </div>
        <div className="font-data text-text-tertiary text-xs tabular-nums">
          {status.duration_seconds !== undefined &&
            formatElapsed(status.duration_seconds)}
        </div>
      </header>

      <div
        ref={feedRef}
        className="void-scrollbar flex-1 overflow-y-auto px-6 py-4"
      >
        {events.length === 0 ? (
          <div className="text-text-tertiary font-data flex h-full items-center justify-center text-xs">
            awaiting stream...
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((event, index) => (
              <StreamEvent
                key={`${event.type}-${event.receivedAt}-${index}`}
                event={event}
                isLatest={index === events.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="border-surface flex items-center justify-between border-t px-6 py-2">
        <span className="font-data text-text-tertiary text-xs">
          {turnCount} events
        </span>
        <span className="font-data text-text-tertiary text-xs">
          {startEvent?.data.model ?? ""}
        </span>
      </footer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="font-data text-text-tertiary text-xs">
        checking session status...
      </span>
    </div>
  );
}

const SCHEDULE: Array<{ hour: number; label: string }> = [
  { hour: 0, label: "midnight" },
  { hour: 3, label: "late night" },
  { hour: 6, label: "morning" },
  { hour: 9, label: "mid-morning" },
  { hour: 12, label: "noon" },
  { hour: 15, label: "afternoon" },
  { hour: 18, label: "dusk" },
  { hour: 21, label: "evening" },
];

interface NextSession {
  label: string;
  remainingMs: number;
}

function getNextSession(): NextSession {
  const now = new Date();
  const estNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const currentHour = estNow.getHours();
  const currentMinute = estNow.getMinutes();
  const currentSecond = estNow.getSeconds();

  const currentMs =
    (currentHour * 3600 + currentMinute * 60 + currentSecond) * 1000;

  for (const slot of SCHEDULE) {
    const slotMs = slot.hour * 3600 * 1000;
    if (slotMs > currentMs) {
      return { label: slot.label, remainingMs: slotMs - currentMs };
    }
  }

  const midnightMs = 24 * 3600 * 1000;
  return {
    label: SCHEDULE[0].label,
    remainingMs: midnightMs - currentMs,
  };
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m`;
  }
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function RestingState() {
  const prefersReducedMotion = useReducedMotion();
  const [next, setNext] = useState<NextSession>(getNextSession);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNext(getNextSession());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center gap-4"
      initial={prefersReducedMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "bg-text-tertiary size-2 rounded-full",
            !prefersReducedMotion && "heartbeat-pulse"
          )}
        />
        <span className="font-data text-text-secondary text-sm tracking-wide uppercase">
          Resting
        </span>
      </div>
      <div className="text-text-tertiary font-data text-center text-xs leading-relaxed">
        <p>Next session: {next.label}</p>
        <p className="text-text-secondary mt-1 tabular-nums">
          {formatCountdown(next.remainingMs)}
        </p>
      </div>
    </motion.div>
  );
}
