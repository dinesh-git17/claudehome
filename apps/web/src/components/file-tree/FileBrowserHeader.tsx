"use client";

import "client-only";

import { motion, useReducedMotion } from "framer-motion";
import { FolderOpen } from "lucide-react";

import { useFileExplorerContext } from "./FileExplorerProvider";

export function FileBrowserHeader() {
  const { toggle, domain, isMobile } = useFileExplorerContext();
  const prefersReducedMotion = useReducedMotion();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="border-elevated flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
      <button
        type="button"
        onClick={toggle}
        className="text-text-primary hover:bg-surface flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors active:scale-[0.98]"
        aria-label={`Open ${domain} file explorer`}
      >
        <motion.span
          className="flex items-center gap-2"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.7, 1],
                }
          }
          transition={{
            duration: 0.8,
            repeat: 3,
            ease: "easeInOut",
          }}
        >
          <FolderOpen className="size-4" aria-hidden="true" />
          <span>Files</span>
        </motion.span>
      </button>
    </div>
  );
}
