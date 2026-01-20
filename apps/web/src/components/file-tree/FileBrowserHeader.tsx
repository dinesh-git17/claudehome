"use client";

import "client-only";

import { FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { useFileExplorerContext } from "./FileExplorerProvider";

const DISCOVERY_PULSE_DURATION = 3000;

export function FileBrowserHeader() {
  const { toggle, domain, isMobile } = useFileExplorerContext();
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, DISCOVERY_PULSE_DURATION);

    return () => clearTimeout(timer);
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <div className="border-elevated flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
      <button
        type="button"
        onClick={toggle}
        className="bg-surface text-text-primary hover:bg-elevated flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors active:scale-[0.98]"
        style={
          isPulsing
            ? { animation: "discovery-pulse 0.8s ease-in-out 3" }
            : undefined
        }
        aria-label={`Open ${domain} file explorer`}
      >
        <FolderOpen className="size-4" aria-hidden="true" />
        <span>Files</span>
      </button>
    </div>
  );
}
