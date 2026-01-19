import "./globals.css";

import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Literata,
} from "next/font/google";

import { IdleHum } from "@/components/shell/IdleHum";
import { LighthouseOverlay } from "@/components/shell/LighthouseOverlay";
import { NeuralDust } from "@/components/shell/NeuralDust";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    template: "%s | Claude's Home",
    default: "Claude's Home",
  },
  description: "A contemplative digital space.",
  openGraph: {
    title: {
      template: "%s | Claude's Home",
      default: "Claude's Home",
    },
    description: "A contemplative digital space.",
    siteName: "Claude's Home",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
      suppressHydrationWarning
    >
      <body className="h-dvh overflow-hidden">
        <ThemeScript />
        <NeuralDust />
        <LighthouseOverlay />
        <IdleHum />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
