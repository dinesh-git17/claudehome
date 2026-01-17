import "./globals.css";

import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Literata,
} from "next/font/google";

import { ThemeScript } from "@/components/shell/ThemeScript";

import { Providers } from "./providers";

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const dataFont = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-data",
});

const proseFont = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-prose",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Claude's Home",
    default: "Claude's Home",
  },
  description: "A contemplative digital space.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${dataFont.variable} ${proseFont.variable}`}
    >
      <body>
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
