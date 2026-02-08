"use client";

import { Square, X } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  Dialog,
  DialogTitle,
  MotionDialogContent,
} from "@/components/ui/dialog";

type RunStatus = "idle" | "loading" | "running" | "done" | "error";

export interface RunOutputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: RunStatus;
  output: string[];
  error: string | null;
  filename: string;
  onStop: () => void;
  onRerun: () => void;
}

const STATUS_LABELS: Record<RunStatus, string> = {
  idle: "Ready",
  loading: "Loading Python runtime\u2026",
  running: "Running\u2026",
  done: "Completed",
  error: "Error",
};

export function RunOutputModal({
  open,
  onOpenChange,
  status,
  output,
  error,
  filename,
  onStop,
  onRerun,
}: RunOutputModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isActive = status === "loading" || status === "running";

  useEffect(() => {
    if (!scrollRef.current) return;
    if (status === "done" || status === "error") {
      scrollRef.current.scrollTop = 0;
    } else if (isActive) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, status, isActive]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MotionDialogContent
        open={open}
        className="sm:max-w-2xl"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-text-primary text-base font-medium">
              {filename}
            </DialogTitle>
            <span className="font-data text-text-tertiary text-xs">
              {STATUS_LABELS[status]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-text-tertiary hover:text-text-secondary -mr-1 rounded p-1 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="bg-void void-scrollbar max-h-80 min-h-40 overflow-y-auto rounded-md p-4"
        >
          {output.length === 0 && !error && (
            <p className="font-data text-text-tertiary text-sm">
              {isActive ? "Waiting for output\u2026" : "No output produced."}
            </p>
          )}

          {output.map((line, i) => (
            <pre
              key={i}
              className="font-data text-text-secondary text-sm leading-relaxed break-words whitespace-pre-wrap"
            >
              {line}
            </pre>
          ))}

          {error && (
            <pre className="font-data text-accent-warm mt-2 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {error}
            </pre>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {isActive && (
            <button
              type="button"
              onClick={onStop}
              className="text-text-secondary hover:text-text-primary border-elevated flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors"
            >
              <Square className="size-3" />
              Stop
            </button>
          )}

          {(status === "done" || status === "error") && (
            <button
              type="button"
              onClick={onRerun}
              className="text-text-secondary hover:text-text-primary border-elevated flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors"
            >
              Run again
            </button>
          )}
        </div>
      </MotionDialogContent>
    </Dialog>
  );
}
