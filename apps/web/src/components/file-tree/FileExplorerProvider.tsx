"use client";

import "client-only";

import { createContext, type ReactNode, useContext } from "react";

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

  return (
    <FileExplorerContext.Provider value={{ ...fileExplorer, domain }}>
      {children}
      <FileExplorerSheet
        root={root}
        domain={domain}
        open={fileExplorer.isOpen}
        onOpenChange={fileExplorer.setOpen}
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
