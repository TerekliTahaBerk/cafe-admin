import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const bodyFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
  // Headings carry the brand; the body face swaps in without being
  // preloaded so it doesn't compete with CSS on slow mobile connections.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Jön Coffee & Patisserie · Güzel bir kahve molası",
    template: "%s · Jön Coffee & Patisserie",
  },
  description:
    "Kahveni seç, tatlını bul, kendine bir mola ver. Jön Coffee & Patisserie.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Jön Coffee & Patisserie",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#d0c9be",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${bodyFont.variable}`}>
      <body className="min-h-dvh bg-bg font-body text-text antialiased">{children}</body>
    </html>
  );
}
