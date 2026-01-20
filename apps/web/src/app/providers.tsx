"use client";

import { ThemeProvider } from "next-themes";

import { DrawerProvider } from "@/lib/context/DrawerContext";

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <DrawerProvider>{children}</DrawerProvider>
    </ThemeProvider>
  );
}
