import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Kicker + large serif title; actions sit bottom-right on desktop. */
export function PageHeader({
  kicker,
  title,
  actions,
  className,
}: {
  kicker: string;
  title: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 md:items-end md:gap-4", className)}>
      <div className="flex-1">
        <span className="kicker hidden md:inline">{kicker}</span>
        <h1 className="text-[32px] font-normal md:mt-0.5 md:text-[40px]">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

/** The 3-cell summary strip: total / in stock / sold out. */
export function StatsStrip({
  total,
  categoryCount,
  inStock,
  soldOut,
  soldOutNames,
}: {
  total: number;
  categoryCount: number;
  inStock: number;
  soldOut: number;
  soldOutNames: string[];
}) {
  const names =
    soldOutNames.length > 3
      ? `${soldOutNames.slice(0, 3).join(", ")} +${soldOutNames.length - 3}`
      : soldOutNames.join(", ") || "Hepsi stokta";
  const cell = "flex flex-col px-3 py-2.5 md:flex-row md:items-baseline md:gap-3.5 md:px-5 md:py-4";
  const num = "tnum font-heading text-[28px] leading-none md:text-[44px]";
  const label = "text-[11px] text-neutral-700 md:text-[13px]";
  return (
    <div className="grid grid-cols-3 rounded-lg border border-divider">
      <div className={cell}>
        <span className={num}>{total}</span>
        <span className={label}>
          toplam<span className="hidden md:inline"> ürün</span>
          <span className="hidden md:block">{categoryCount} kategoride</span>
        </span>
      </div>
      <div className={cn(cell, "border-l border-divider")}>
        <span className={cn(num, "text-accent-700")}>{inStock}</span>
        <span className={label}>
          stokta
          <span className="hidden md:block">menüde aktif</span>
        </span>
      </div>
      <div className={cn(cell, "border-l border-divider")}>
        <span className={num}>{soldOut}</span>
        <span className={label}>
          tükendi
          <span className="hidden max-w-[220px] truncate md:block">{names}</span>
        </span>
      </div>
    </div>
  );
}
