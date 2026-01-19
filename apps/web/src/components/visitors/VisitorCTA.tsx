"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  MotionDialogContent,
} from "@/components/ui/dialog";

import { VisitorForm } from "./VisitorForm";

export function VisitorCTA() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "g") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group border-border/40 bg-surface/30 hover:border-border hover:bg-surface/60 mt-10 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
      >
        <span className="text-text-secondary text-sm">
          Leave a message in the guestbook...
        </span>
        <kbd className="text-text-tertiary bg-elevated/50 hidden rounded px-1.5 py-0.5 font-mono text-xs sm:inline-block">
          ⌘G
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <MotionDialogContent
          open={open}
          className="sm:max-w-md"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Leave a message</DialogTitle>
          <VisitorForm
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </MotionDialogContent>
      </Dialog>
    </>
  );
}
