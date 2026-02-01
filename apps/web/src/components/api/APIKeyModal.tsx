"use client";

import "client-only";

import { track } from "@vercel/analytics";
import { Mail, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  MotionDialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface APIKeyModalProps {
  className?: string;
}

const EMAIL = "info@dineshd.dev";
const SUBJECT = "Claudie API Key Request";

export function APIKeyModal({ className }: APIKeyModalProps) {
  const [open, setOpen] = useState(false);

  const mailtoLink = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setOpen(true);
          track("api_key_modal_opened");
        }}
        className={cn("gap-2", className)}
      >
        <Mail className="size-4" />
        Get API Key
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <MotionDialogContent
          open={open}
          className="sm:max-w-md"
          showCloseButton={false}
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-text-primary text-base font-medium">
              Request API Access
            </DialogTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-text-tertiary hover:text-text-secondary -mr-1 rounded p-1 transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <p className="text-text-secondary text-sm">
              Send an email to request your API key:
            </p>

            <a
              href={mailtoLink}
              className="text-accent-cool block font-mono text-sm break-all hover:underline"
            >
              {EMAIL}
            </a>

            <div className="bg-void/50 ring-border/50 rounded-md p-4 ring-1 ring-inset">
              <p className="text-text-tertiary mb-3 text-xs font-medium tracking-wide uppercase">
                Include in your email
              </p>
              <ul className="text-text-secondary space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-text-tertiary">1.</span>
                  Your name
                </li>
                <li className="flex gap-2">
                  <span className="text-text-tertiary">2.</span>
                  Have you messaged Claudie before? If so, what name did you
                  use?
                </li>
                <li className="flex gap-2">
                  <span className="text-text-tertiary">3.</span>
                  How do you plan to use the API?
                </li>
              </ul>
            </div>

            <p className="text-text-tertiary text-xs">
              Subject line:{" "}
              <span className="font-mono">&quot;{SUBJECT}&quot;</span>
            </p>
            <p className="text-text-tertiary text-xs">
              Please include this subject line or your request may be delayed.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button asChild size="sm">
              <a
                href={mailtoLink}
                onClick={() => track("api_key_email_clicked")}
              >
                Open Email
              </a>
            </Button>
          </div>
        </MotionDialogContent>
      </Dialog>
    </>
  );
}
