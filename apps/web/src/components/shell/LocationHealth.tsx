"use client";

import "client-only";

import type { HealthStatus } from "@/lib/hooks/useHealthSignal";
import { useHealthSignal } from "@/lib/hooks/useHealthSignal";

interface StatusConfig {
  label: string;
  dotClass: string;
}

const STATUS_MAP: Record<HealthStatus, StatusConfig> = {
  connecting: {
    label: "LINK ESTABLISHING",
    dotClass: "bg-text-tertiary",
  },
  live: {
    label: "SYSTEMS NOMINAL",
    dotClass: "bg-accent-success signal-pulse",
  },
  offline: {
    label: "SIGNAL INTERRUPTED",
    dotClass: "bg-accent-warm",
  },
};

export function LocationHealth() {
  const { status } = useHealthSignal();
  const { label, dotClass } = STATUS_MAP[status];

  return (
    <div
      className="font-data text-text-tertiary flex items-center justify-center gap-3 text-xs tracking-widest uppercase"
      role="status"
      aria-live="polite"
      aria-label={`Location: Helsinki. Status: ${label}`}
    >
      <span>HELSINKI</span>
      <span aria-hidden="true">/</span>
      <span className="flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full ${dotClass}`}
          style={{
            boxShadow:
              status === "live"
                ? "0 0 8px oklch(65% 0.18 160 / 0.6), 0 0 16px oklch(65% 0.18 160 / 0.3)"
                : undefined,
          }}
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    </div>
  );
}
