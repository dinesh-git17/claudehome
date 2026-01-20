"use client";

import "client-only";

import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

function subscribeToMediaQuery(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMediaQuerySnapshot(): boolean {
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

function getMediaQueryServerSnapshot(): boolean {
  return false;
}

export interface UseFileExplorerReturn {
  isOpen: boolean;
  isMobile: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export function useFileExplorer(): UseFileExplorerReturn {
  const pathname = usePathname();
  const [openOnPathname, setOpenOnPathname] = useState<string | null>(null);

  const isMobile = useSyncExternalStore(
    subscribeToMediaQuery,
    getMediaQuerySnapshot,
    getMediaQueryServerSnapshot
  );

  const isOpen = openOnPathname === pathname;

  const open = useCallback(() => {
    setOpenOnPathname(pathname);
  }, [pathname]);

  const close = useCallback(() => {
    setOpenOnPathname(null);
  }, []);

  const toggle = useCallback(() => {
    setOpenOnPathname((current) => (current === pathname ? null : pathname));
  }, [pathname]);

  const setOpen = useCallback(
    (value: boolean) => {
      setOpenOnPathname(value ? pathname : null);
    },
    [pathname]
  );

  return {
    isOpen,
    isMobile,
    open,
    close,
    toggle,
    setOpen,
  };
}
