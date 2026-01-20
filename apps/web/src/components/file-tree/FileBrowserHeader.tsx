"use client";

import "client-only";

import { FolderOpen } from "lucide-react";

import { useFileExplorerContext } from "./FileExplorerProvider";

export function FileBrowserHeader() {
  const { toggle, domain, isMobile } = useFileExplorerContext();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="border-elevated flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
      <button
        type="button"
        onClick={toggle}
        className="bg-surface text-text-primary hover:bg-elevated flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors active:scale-[0.98]"
        aria-label={`Open ${domain} file explorer`}
      >
        <FolderOpen className="size-4" aria-hidden="true" />
        <span>Files</span>
      </button>
    </div>
  );
}
