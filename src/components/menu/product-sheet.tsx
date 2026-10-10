"use client";

import { Info, X } from "lucide-react";

import { Overlay } from "@/components/ui/overlay";
import { ProductVisual } from "./product-visual";
import { SELF_SERVICE_NOTE } from "@/lib/brand";
import { ProductTags, SoldOutStamp } from "@/components/ui/tag";
import { allergenLabel } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { SOLD_OUT_NOTE } from "./product-card";

export function ProductSheet({
  product,
  categoryName,
  onClose,
}: {
  product: Product | null;
  categoryName?: string;
  onClose: () => void;
}) {
  const soldOut = product ? !product.in_stock : false;
  return (
    <Overlay open={!!product} onClose={onClose} variant="sheet" labelledBy="product-sheet-title">
      {product ? (
        <>
          <div className="flex justify-center pt-2.5 pb-1 md:hidden" aria-hidden>
            <span className="h-1 w-10 rounded-[2px] bg-neutral-400" />
          </div>
          <div className="relative mx-4 mt-2 md:mt-4">
            <ProductVisual product={product} className="h-[250px] rounded-[22px] md:h-[300px]" />
            {soldOut ? <SoldOutStamp className="px-3 py-1 text-[12px]" /> : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="absolute top-3 right-3 grid size-11 cursor-pointer place-items-center rounded-full bg-bg shadow-md hover:bg-surface"
            >
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div className="flex flex-col gap-3 px-5 pt-5">
            {categoryName ? <span className="kicker">{categoryName}</span> : null}
            {!soldOut ? <ProductTags tags={product.tags} /> : null}
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="product-sheet-title"
                className={cn(
                  "text-[31px] leading-[1.05] font-normal",
                  soldOut && "text-neutral-700",
                )}
              >
                {product.name}
              </h2>
              <span
                className={cn(
                  "tnum font-heading text-[26px] font-semibold whitespace-nowrap",
                  soldOut && "text-neutral-700",
                )}
              >
                {formatPrice(product.price)}
              </span>
            </div>
            {soldOut ? (
              <p className="text-[13px] text-neutral-700 italic">{SOLD_OUT_NOTE}</p>
            ) : null}
            {product.description ? (
              <p className="text-[14px] leading-[1.55] text-pretty text-neutral-800">
                {product.description}
              </p>
            ) : null}
            <div className="my-1 h-px bg-divider" />
            <div className="flex flex-col gap-2">
              <span className="text-[11px] tracking-[0.1em] text-neutral-700 uppercase">Alerjenler</span>
              {product.allergens.length ? (
                <ul className="flex flex-wrap gap-2">
                  {product.allergens.map((a) => (
                    <li
                      key={a}
                      className="flex h-8 items-center gap-1.5 rounded-full border border-divider px-3 text-[13px]"
                    >
                      <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                      {allergenLabel(a)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-neutral-800">Bilinen bir alerjen içermiyor.</p>
              )}
              <p className="mt-0.5 text-[12px] leading-normal text-neutral-700">
                Aynı mutfakta un ve kuruyemiş kullanılıyor. Alerjin varsa kasada söylemen yeterli.
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2.5 border-t border-divider px-5 pt-3.5 pb-[max(24px,env(safe-area-inset-bottom))] text-[13px] text-neutral-800 md:mt-6">
            <Info size={18} strokeWidth={1.75} className="flex-none text-accent-700" aria-hidden />
            <span>{SELF_SERVICE_NOTE}</span>
          </div>
        </>
      ) : null}
    </Overlay>
  );
}
