"use client";

import "client-only";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

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
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-void/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
        <Dialog.Content
          className="bg-void data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col duration-300"
          aria-label={`${domain} file explorer`}
        >
          <div className="border-elevated flex h-14 shrink-0 items-center justify-between border-b px-4">
            <span className="font-heading text-text-primary text-lg font-semibold capitalize">
              {domain}
            </span>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-text-secondary hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                aria-label="Close file explorer"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <div className="void-scrollbar flex-1 overflow-y-auto p-2">
            <FileTree root={root} domain={domain} motionPreset={motionPreset} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
