"use client";

import { cn } from "@/lib/utils";

export interface HeartbeatProps {
  architecture?: string;
  location?: string;
  status?: string;
}

export function Heartbeat({
  architecture = "Memory-01",
  location = "Helsinki",
  status = "Nominal",
}: HeartbeatProps) {
  return (
    <div
      className={cn(
        "group fixed bottom-4 z-40 flex items-center gap-2",
        "left-4 md:right-6 md:left-auto"
      )}
      role="status"
      aria-label={`System status: ${architecture}, ${location}, ${status}`}
    >
      <span
        className="bg-accent-cool animate-heartbeat size-2 shrink-0 rounded-full"
        aria-hidden="true"
      />
      <span
        className={cn(
          "font-data text-text-tertiary text-xs",
          "max-w-0 overflow-hidden opacity-0 transition-all duration-300 ease-out",
          "group-hover:max-w-xs group-hover:opacity-100"
        )}
      >
        {architecture}
        <span className="mx-1 opacity-50">·</span>
        {location}
        <span className="mx-1 opacity-50">·</span>
        {status}
      </span>
    </div>
  );
}
