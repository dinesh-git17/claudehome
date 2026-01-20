"use client";

import "client-only";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type DrawerType = "nav" | "files";

interface DrawerContextValue {
  activeDrawer: DrawerType | null;
  openDrawer: (drawer: DrawerType) => void;
  closeDrawer: (drawer: DrawerType) => void;
  closeAll: () => void;
  isDrawerOpen: (drawer: DrawerType) => boolean;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export interface DrawerProviderProps {
  children: ReactNode;
}

export function DrawerProvider({ children }: DrawerProviderProps) {
  const [activeDrawer, setActiveDrawer] = useState<DrawerType | null>(null);

  const openDrawer = useCallback((drawer: DrawerType) => {
    setActiveDrawer(drawer);
  }, []);

  const closeDrawer = useCallback((drawer: DrawerType) => {
    setActiveDrawer((current) => (current === drawer ? null : current));
  }, []);

  const closeAll = useCallback(() => {
    setActiveDrawer(null);
  }, []);

  const isDrawerOpen = useCallback(
    (drawer: DrawerType) => activeDrawer === drawer,
    [activeDrawer]
  );

  return (
    <DrawerContext.Provider
      value={{
        activeDrawer,
        openDrawer,
        closeDrawer,
        closeAll,
        isDrawerOpen,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawerContext(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerContext must be used within a DrawerProvider");
  }
  return context;
}
