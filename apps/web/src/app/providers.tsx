"use client";

import { ThemeProvider } from "next-themes";

import { SearchProvider } from "@/components/search/SearchProvider";
import { DrawerProvider } from "@/lib/context/DrawerContext";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <DrawerProvider>
        <SearchProvider>{children}</SearchProvider>
      </DrawerProvider>
    </ThemeProvider>
  );
}
