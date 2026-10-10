"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./wordmark";

import { LanguageSwitcher } from "./language-switcher";
import { localizedPath, translate, type Locale } from "@/lib/i18n";

const LINKS = [
  { href: "#hikayemiz", label: "Hikâyemiz" },
  { href: "#kahve-tatli", label: "Kahve & Tatlı" },
  { href: "#ziyaret", label: "Ziyaret" },
];

export function SiteHeader({ cafeName, logoUrl, locale = "tr" }: { cafeName: string; logoUrl: string | null; locale?: Locale }) {
  const t = (text: string) => translate(locale, text);
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
        <Link href={localizedPath(locale)} className="brand-link"><Wordmark name={cafeName} logoUrl={logoUrl} /></Link>
        <nav aria-label={t("Sayfa bölümleri")} className="desktop-nav">
          {LINKS.map((l) => <a key={l.href} href={l.href}>{t(l.label)}</a>)}
        </nav>
        <LanguageSwitcher locale={locale} />
        <Link href={localizedPath(locale, "/menu")} className="jon-button header-cta">{t("Menüyü keşfet")}</Link>
        <button type="button" className="mobile-nav-toggle" aria-label={t(open ? "Bölümleri kapat" : "Bölümleri aç")} aria-expanded={open} aria-controls="mobil-nav" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>
      <nav id="mobil-nav" aria-label={t("Mobil sayfa bölümleri")} hidden={!open} className="mobile-site-nav">
        {LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{t(l.label)}</a>)}
      </nav>
    </header>
  );
}
