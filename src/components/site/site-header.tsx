"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";

import { BrandMark } from "@/components/ui/brand-mark";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#hakkimizda", label: "Hakkımızda" },
  { href: "#one-cikanlar", label: "Öne çıkanlar" },
  { href: "#mekan", label: "Mekân" },
  { href: "#ziyaret", label: "Ziyaret" },
];

export function SiteHeader({ cafeName, logoUrl }: { cafeName: string; logoUrl: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-divider bg-bg lg:bg-bg/92 lg:backdrop-blur-sm">
      <div className="flex h-16 items-center gap-2.5 pr-3 pl-5 lg:h-[76px] lg:gap-9 lg:px-16">
        <Link href="/" className="mr-auto flex items-center gap-2.5 rounded-md">
          <BrandMark name={cafeName} logoUrl={logoUrl} size={38} className="hidden lg:grid" />
          <span className="font-heading text-[20px] font-semibold lg:text-[21px]">{cafeName}</span>
        </Link>
        <nav aria-label="Sayfa bölümleri" className="hidden gap-[30px] text-[14px] lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="no-underline hover:text-accent-700">
              {l.label}
            </a>
          ))}
        </nav>
        <Link
          href="/menu"
          className={buttonStyles({ variant: "primary", size: "md", className: "px-4 text-[15px] lg:px-5 lg:text-[16px]" })}
        >
          Menü
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobil-nav"
          aria-label={open ? "Menüyü kapat" : "Bölümler"}
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-text/7 lg:hidden"
        >
          {open ? <X size={20} strokeWidth={1.75} aria-hidden /> : <MenuIcon size={20} strokeWidth={1.75} aria-hidden />}
        </button>
      </div>
      <nav
        id="mobil-nav"
        aria-label="Sayfa bölümleri"
        hidden={!open}
        className={cn("border-t border-divider px-5 pb-3 lg:hidden")}
      >
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex h-12 items-center border-b border-divider font-heading text-[19px] font-semibold no-underline"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
