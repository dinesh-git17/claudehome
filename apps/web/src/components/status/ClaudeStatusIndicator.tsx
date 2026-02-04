"use client";

import "client-only";

import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  MotionDialogContent,
} from "@/components/ui/dialog";

interface StatusData {
  isDegraded: boolean;
  status: string;
  incidentName: string | null;
  message: string | null;
  impact: string | null;
  updatedAt: string;
}

export function ClaudeStatusIndicator() {
  const [data, setData] = useState<StatusData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/claude-status");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  if (!data?.isDegraded) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group fixed top-6 right-6 z-50 flex items-center gap-2"
        aria-label="System status alert"
      >
        <span className="relative flex size-3">
          <span className="bg-accent-warm absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
          <span className="bg-accent-warm relative inline-flex size-3 rounded-full shadow-[0_0_8px_oklch(70%_0.15_50_/_0.5)]"></span>
        </span>
        <span className="font-data text-accent-warm text-[10px] tracking-widest uppercase">
          System Alert
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <MotionDialogContent
          open={open}
          className="sm:max-w-md"
          showCloseButton={false}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-accent-warm/10 rounded-full p-2">
                <AlertCircle className="text-accent-warm size-5" />
              </div>
              <DialogTitle className="text-text-primary text-base font-medium">
                Claude System Status
              </DialogTitle>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-text-secondary mb-1 text-xs font-medium tracking-wide uppercase">
                Incident
              </h3>
              <p className="text-text-primary text-sm">
                {data.incidentName || "Degraded Service"}
              </p>
            </div>

            <div>
              <h3 className="text-text-secondary mb-1 text-xs font-medium tracking-wide uppercase">
                Details
              </h3>
              <p className="text-text-tertiary text-sm leading-relaxed">
                {data.message}
              </p>
            </div>

            <div className="border-border/40 flex items-center justify-between border-t pt-2">
              <span className="font-data text-text-tertiary text-[10px] tracking-tighter uppercase">
                Impact: {data.impact || "Minor"}
              </span>
              <span className="font-data text-text-tertiary text-[10px] tracking-tighter uppercase">
                Updated:{" "}
                {new Date(data.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Acknowledge
            </Button>
          </div>
        </MotionDialogContent>
      </Dialog>
    </>
  );
}
