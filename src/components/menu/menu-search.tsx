import { Search } from "lucide-react";

import { Photo } from "@/components/ui/photo";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { publicImageUrl } from "@/lib/env";
import { formatPrice, normalizeSearch } from "@/lib/format";
import type { Product } from "@/lib/types";

export type SearchHit = { product: Product; categoryName: string };

export function searchProducts(sections: { name: string; products: Product[] }[], query: string) {
  const q = normalizeSearch(query.trim());
  if (!q) return [];
  const hits: (SearchHit & { score: number })[] = [];
  for (const s of sections) {
    for (const p of s.products) {
      const name = normalizeSearch(p.name);
      const desc = normalizeSearch(p.description ?? "");
      const idx = name.indexOf(q);
      if (idx >= 0) hits.push({ product: p, categoryName: s.name, score: idx === 0 ? 0 : 1 });
      else if (desc.includes(q) || normalizeSearch(s.name).includes(q))
        hits.push({ product: p, categoryName: s.name, score: 2 });
    }
  }
  return hits.sort((a, b) => a.score - b.score);
}

/** Underlines the matched part of the name in accent (as in the design). */
function Highlight({ text, query }: { text: string; query: string }) {
  const idx = normalizeSearch(text).indexOf(normalizeSearch(query.trim()));
  if (idx < 0 || !query.trim()) return <>{text}</>;
  const end = idx + query.trim().length;
  return (
    <>
      {text.slice(0, idx)}
      <span className="underline decoration-accent decoration-2 underline-offset-[3px]">
        {text.slice(idx, end)}
      </span>
      {text.slice(end)}
    </>
  );
}

export function SearchResults({
  query,
  hits,
  onSelect,
}: {
  query: string;
  hits: SearchHit[];
  onSelect: (product: Product) => void;
}) {
  return (
    <section aria-live="polite">
      <h2 className="pt-4 pb-1 font-body text-[12px] font-normal tracking-[0.08em] text-neutral-700 uppercase">
        “{query.trim()}” için {hits.length} sonuç
      </h2>
      <ul className="md:grid md:grid-cols-2 md:gap-x-10">
        {hits.map(({ product, categoryName }) => {
          const soldOut = !product.in_stock;
          return (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onSelect(product)}
                aria-haspopup="dialog"
                className="flex w-full cursor-pointer items-center gap-3.5 border-b border-divider py-3.5 text-left hover:bg-text/[0.025] focus-visible:outline-offset-[-2px]"
              >
                <Photo
                  src={publicImageUrl(product.image_path)}
                  alt={product.name}
                  sizes="64px"
                  muted={soldOut}
                  className="size-16 flex-none rounded-lg border border-divider"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "font-heading text-[19px] leading-tight font-semibold",
                      soldOut && "text-neutral-700",
                    )}
                  >
                    <Highlight text={product.name} query={query} />
                  </span>
                  <span className="text-[12px] text-neutral-700">
                    {categoryName}
                    {soldOut ? " · Tükendi" : ""}
                  </span>
                </span>
                <span
                  className={cn(
                    "tnum font-heading text-[18px] font-semibold",
                    soldOut && "text-neutral-700",
                  )}
                >
                  {formatPrice(product.price)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-[18px] text-center text-[12px] text-neutral-700">
        Aradığın yok mu? Kasada sor, belki tezgâhtadır.
      </p>
    </section>
  );
}

export function SearchEmpty({
  query,
  suggestions,
  onSuggestion,
  onReset,
}: {
  query: string;
  suggestions: string[];
  onSuggestion: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <section
      aria-live="polite"
      className="flex flex-col items-center gap-3 px-3 pt-[72px] text-center md:pt-16"
    >
      <div className="grid size-[72px] place-items-center rounded-full border border-accent text-accent-700">
        <Search size={28} strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="mt-2 text-[28px] font-normal">“{query.trim()}” menümüzde yok</h2>
      <p className="max-w-[280px] text-[14px] leading-normal text-pretty text-neutral-700">
        Belki farklı bir adla yazmışızdır. Bunlara ne dersin?
      </p>
      {suggestions.length ? (
        <div className="flex flex-wrap justify-center gap-2 pt-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              className="flex h-11 cursor-pointer items-center rounded-full border border-divider px-4 text-[14px] hover:bg-text/7"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onReset}
        className={buttonStyles({ variant: "primary", size: "lg", className: "mt-3.5 px-[22px]" })}
      >
        Tüm menüye dön
      </button>
    </section>
  );
}
