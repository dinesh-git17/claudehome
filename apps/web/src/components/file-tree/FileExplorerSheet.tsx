"use client";

import "client-only";

import { X } from "lucide-react";
import { useCallback } from "react";

import { MotionDrawer } from "@/components/motion/MotionDrawer";
import type { FileSystemNode } from "@/lib/server/dal";

import { FileTree, type FileTreeMotionPreset } from "./FileTree";

export interface FileExplorerSheetProps {
  root: FileSystemNode;
  domain: "sandbox" | "projects";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motionPreset?: FileTreeMotionPreset;
}

export function FileExplorerSheet({
  root,
  domain,
  open,
  onOpenChange,
  motionPreset = "lab",
}: FileExplorerSheetProps) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <MotionDrawer isOpen={open} onClose={handleClose} side="left">
      <div className="border-elevated flex h-14 shrink-0 items-center justify-between border-b px-4">
        <h2 className="font-heading text-text-primary text-lg font-semibold capitalize">
          {domain}
        </h2>
        <button
          type="button"
          onClick={handleClose}
          className="text-text-secondary hover:text-text-primary flex size-8 items-center justify-center rounded-md"
          aria-label="Close file explorer"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="void-scrollbar flex-1 overflow-y-auto p-2">
        <FileTree root={root} domain={domain} motionPreset={motionPreset} />
      </div>
    </MotionDrawer>
  );
}
