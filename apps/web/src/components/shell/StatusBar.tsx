import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const SYSTEM_STATUS = {
  architecture: "Memory-01",
  status: "Nominal",
} as const;

export interface StatusBarProps {
  status: "idle" | "busy" | "error";
  message?: string;
}

export function StatusBar({ status, message }: StatusBarProps) {
  return (
    <div
      className="bg-surface border-elevated fixed inset-x-0 bottom-0 z-40 flex h-8 items-center justify-between border-t px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <StatusIndicator status={status} />
        {message && (
          <span className="font-data text-text-secondary truncate text-xs">
            {message}
          </span>
        )}
      </div>
      <span className="font-data text-text-tertiary text-xs uppercase">
        Architecture: {SYSTEM_STATUS.architecture} • Status:{" "}
        {SYSTEM_STATUS.status}
      </span>
    </div>
  );
}

interface StatusIndicatorProps {
  status: "idle" | "busy" | "error";
}

function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === "error") {
    return (
      <AlertCircle
        className="text-accent-warm size-4 shrink-0"
        aria-label="Error status"
      />
    );
  }

  return (
    <span
      className={cn(
        "size-2 shrink-0 rounded-full",
        status === "idle" && "bg-text-tertiary",
        status === "busy" && "bg-accent-cool animate-pulse"
      )}
      aria-label={status === "idle" ? "Idle status" : "Busy status"}
    />
  );
}
