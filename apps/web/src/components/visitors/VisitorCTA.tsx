"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { VisitorForm } from "./VisitorForm";

export function VisitorCTA() {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };

  return (
    <>
      <div className="mt-8 flex flex-col items-start gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Leave a message
        </Button>
        <p className="text-text-tertiary text-xs">Be nice.</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-surface sm:max-w-md">
          <DialogTitle className="sr-only">Leave a message</DialogTitle>
          <VisitorForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
