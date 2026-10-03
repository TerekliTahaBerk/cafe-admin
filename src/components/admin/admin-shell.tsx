"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowUpRight, Coffee, LayoutDashboard, List, LogOut, QrCode, SlidersHorizontal } from "lucide-react";

import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Özet", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Ürünler", icon: Coffee },
  { href: "/admin/categories", label: "Kategoriler", icon: List },
  { href: "/admin/qr", label: "QR Kod", icon: QrCode },
  { href: "/admin/settings", label: "Ayarlar", icon: SlidersHorizontal },
];

export function AdminShell({
  cafeName,
  logoUrl,
  email,
  productCount,
  children,
}: {
  cafeName: string;
  logoUrl: string | null;
  email: string;
  productCount: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <a
        href="#panel"
        className="sr-only z-50 rounded-md bg-bg px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        İçeriğe geç
      </a>

      {/* ── Desktop sidebar ── */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-divider px-4 py-6 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-[26px]">
          <BrandMark name={cafeName} logoUrl={logoUrl} size={36} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-[18px] leading-[1.1] font-semibold">{cafeName}</span>
            <span className="text-[11px] text-neutral-700">Yönetim</span>
          </div>
        </div>
        <nav aria-label="Yönetim" className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md border px-3 font-heading text-[16px] font-semibold no-underline transition-colors",
                  active
                    ? "border-accent bg-accent-100 text-accent-800"
                    : "border-transparent text-neutral-800 hover:bg-text/5",
                )}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                {label}
                {href === "/admin/products" ? (
                  <span className="tnum ml-auto font-body text-[12px] font-normal">{productCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2.5 border-t border-divider px-2 pt-4">
          <a
            href="/menu"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-[13px] text-accent-700 no-underline hover:underline"
          >
            Menüyü önizle <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
          </a>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-8 flex-none place-items-center rounded-full bg-neutral-200 text-[12px]"
            >
              {initials(email)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px]" title={email}>
                {email}
              </span>
              <span className="text-[11px] text-neutral-700">Yönetici</span>
            </div>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                aria-label="Çıkış yap"
                title="Çıkış yap"
                className="grid size-11 cursor-pointer place-items-center rounded-md text-neutral-700 hover:bg-text/7"
              >
                <LogOut size={17} strokeWidth={1.75} aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div id="panel" className="min-w-0 pb-[92px] md:pb-0">
        {children}
      </div>

      {/* ── Mobile tab bar ── */}
      <nav
        aria-label="Yönetim"
        className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(76px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-divider bg-bg pb-[max(12px,env(safe-area-inset-bottom))] md:hidden"
      >
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-[3px] text-[11px] no-underline",
                active ? "text-accent-800" : "text-neutral-700",
              )}
            >
              {active ? <span aria-hidden className="absolute top-0 h-0.5 w-8 bg-accent" /> : null}
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
