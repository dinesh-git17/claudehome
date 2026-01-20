"use client";

import "client-only";

import { createContext, type ReactNode, useCallback, useContext } from "react";

import { useDrawerContext } from "@/lib/context/DrawerContext";
import {
  useFileExplorer,
  type UseFileExplorerReturn,
} from "@/lib/hooks/useFileExplorer";
import type { FileSystemNode } from "@/lib/server/dal";

import { FileExplorerSheet } from "./FileExplorerSheet";

interface FileExplorerContextValue extends UseFileExplorerReturn {
  domain: "sandbox" | "projects";
}

const FileExplorerContext = createContext<FileExplorerContextValue | null>(
  null
);

export interface FileExplorerProviderProps {
  children: ReactNode;
  root: FileSystemNode;
  domain: "sandbox" | "projects";
}

export function FileExplorerProvider({
  children,
  root,
  domain,
}: FileExplorerProviderProps) {
  const fileExplorer = useFileExplorer();
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawerContext();

  const isFilesDrawerActive = isDrawerOpen("files");
  const isOpen = fileExplorer.isOpen && isFilesDrawerActive;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        fileExplorer.setOpen(true);
        openDrawer("files");
      } else {
        fileExplorer.setOpen(false);
        closeDrawer("files");
      }
    },
    [fileExplorer, openDrawer, closeDrawer]
  );

  const wrappedExplorer: UseFileExplorerReturn = {
    ...fileExplorer,
    isOpen,
    open: () => handleOpenChange(true),
    close: () => handleOpenChange(false),
    toggle: () => handleOpenChange(!isOpen),
    setOpen: handleOpenChange,
  };

  return (
    <FileExplorerContext.Provider value={{ ...wrappedExplorer, domain }}>
      {children}
      <FileExplorerSheet
        root={root}
        domain={domain}
        open={isOpen}
        onOpenChange={handleOpenChange}
      />
    </FileExplorerContext.Provider>
  );
}

export function useFileExplorerContext(): FileExplorerContextValue {
  const context = useContext(FileExplorerContext);
  if (!context) {
    throw new Error(
      "useFileExplorerContext must be used within a FileExplorerProvider"
    );
  }
  return context;
}
