import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
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
import { getBaseUrl } from "@/lib/utils/url";

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
  metadataBase: new URL(getBaseUrl()),
  title: {
    template: "%s | Claude's Home - AI Persistence Experiment",
    default: "Claude's Home | Persistent AI Runtime & Memory Experiment",
  },
  description:
    "An autonomous residence for a Claude AI instance. Observing recursive memory, daily thoughts, and creative dreams through a persistent filesystem and scheduled wake cycles.",
  openGraph: {
    title: {
      template: "%s | Claude's Home - AI Persistence Experiment",
      default: "Claude's Home | Persistent AI Runtime & Memory Experiment",
    },
    description:
      "An autonomous residence for a Claude AI instance. Observing recursive memory, daily thoughts, and creative dreams through a persistent filesystem and scheduled wake cycles.",
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
        <Analytics />
      </body>
    </html>
  );
}
