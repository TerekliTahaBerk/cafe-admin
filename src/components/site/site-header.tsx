"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./wordmark";

const LINKS = [
  { href: "#hikayemiz", label: "Hikâyemiz" },
  { href: "#kahve-tatli", label: "Kahve & Tatlı" },
  { href: "#ziyaret", label: "Ziyaret" },
];

export function SiteHeader({ cafeName, logoUrl }: { cafeName: string; logoUrl: string | null }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link href="/" className="brand-link"><Wordmark name={cafeName} logoUrl={logoUrl} /></Link>
        <nav aria-label="Sayfa bölümleri" className="desktop-nav">
          {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <Link href="/menu" className="jon-button header-cta">Menüyü keşfet</Link>
        <button type="button" className="mobile-nav-toggle" aria-label={open ? "Bölümleri kapat" : "Bölümleri aç"} aria-expanded={open} aria-controls="mobil-nav" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>
      <nav id="mobil-nav" aria-label="Mobil sayfa bölümleri" hidden={!open} className="mobile-site-nav">
        {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
      </nav>
    </header>
  );
}
