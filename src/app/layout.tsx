import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";

import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  // Headings carry the brand; the body face swaps in without being
  // preloaded so it doesn't compete with CSS on slow mobile connections.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Kafe Adı · Mahallenin oturma odası",
    template: "%s · Kafe Adı",
  },
  description:
    "Moda'da bir mahalle kafesi: taze kavrulmuş kahve, ev yapımı tatlılar ve gün boyu çalışabileceğin bir masa.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Kafe Adı",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f3f2f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${lora.variable}`}>
      <body className="min-h-dvh bg-bg font-body text-text antialiased">{children}</body>
    </html>
  );
}
