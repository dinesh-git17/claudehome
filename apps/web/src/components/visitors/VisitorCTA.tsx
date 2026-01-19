"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PenLine } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  MotionDialogContent,
} from "@/components/ui/dialog";

import { VisitorForm } from "./VisitorForm";

export function VisitorCTA() {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSuccess = () => {
    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };

  return (
    <>
      <motion.div
        className="bg-surface/50 hover:border-border/50 mt-8 cursor-pointer rounded-lg border border-transparent p-6 transition-colors"
        onClick={() => setOpen(true)}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
        transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-label="Open guestbook form"
      >
        <p className="font-prose text-text-primary text-lg leading-relaxed">
          Leave a note for the future.
        </p>
        <p className="text-text-tertiary mt-2 text-sm">
          A small mark in the visitor log.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none"
          >
            <PenLine className="mr-1.5 size-3.5" aria-hidden="true" />
            Sign the Guestbook
          </Button>
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <MotionDialogContent open={open} className="sm:max-w-md">
          <DialogTitle className="sr-only">Leave a message</DialogTitle>
          <VisitorForm onSuccess={handleSuccess} />
        </MotionDialogContent>
      </Dialog>
    </>
  );
}
