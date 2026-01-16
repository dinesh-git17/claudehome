import "./globals.css";

import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${dataFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
