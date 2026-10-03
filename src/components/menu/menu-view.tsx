"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/cn";
import { greeting, todayStatus } from "@/lib/format";
import type { OpeningHoursDay, Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { ProductSheet } from "./product-sheet";
import { SearchEmpty, SearchResults, searchProducts } from "./menu-search";

export type MenuViewSection = { id: string; name: string; products: Product[] };

export type MenuViewProps = {
  cafeName: string;
  logoUrl: string | null;
  subtitle: string | null;
  tagline: string | null;
  wifiPassword: string | null;
  openingHours: OpeningHoursDay[];
  sections: MenuViewSection[];
};

/** Distance from the viewport top at which a section counts as "current". */
const SPY_OFFSET_MOBILE = 140;
const SPY_OFFSET_DESKTOP = 110;

export function MenuView({
  cafeName,
  logoUrl,
  subtitle,
  tagline,
  wifiPassword,
  openingHours,
  sections,
}: MenuViewProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [selected, setSelected] = useState<Product | null>(null);
  const [condensed, setCondensed] = useState(false);
  const [now, setNow] = useState<{ greet: string; status: ReturnType<typeof todayStatus> } | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const chipBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);

  const searching = query.trim().length > 0;
  const hits = useMemo(() => searchProducts(sections, query), [sections, query]);
  const categoryOf = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((s) => s.products.forEach((p) => map.set(p.id, s.name)));
    return map;
  }, [sections]);
  const suggestions = useMemo(
    () =>
      sections
        .flatMap((s) => s.products)
        .filter((p) => p.in_stock)
        .slice(0, 3)
        .map((p) => p.name),
    [sections],
  );

  // Time-dependent copy is computed on the client so the cached page stays
  // correct all day (Istanbul time).
  useEffect(() => {
    const tick = () => setNow({ greet: greeting(), status: todayStatus(openingHours) });
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [openingHours]);

  // Compact header once the welcome block has scrolled away (mobile).
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCondensed(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [searchOpen]);

  // Scroll-spy: the current category is the last section whose top has
  // passed under the sticky bars.
  useEffect(() => {
    if (searching) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = window.matchMedia("(min-width: 768px)").matches
          ? SPY_OFFSET_DESKTOP
          : SPY_OFFSET_MOBILE;
        let current = sections[0]?.id ?? "";
        for (const s of sections) {
          const el = document.getElementById(`kategori-${s.id}`);
          if (el && el.getBoundingClientRect().top <= offset) current = s.id;
        }
        const atBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom && sections.length) current = sections[sections.length - 1].id;
        setActiveId(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections, searching]);

  // Keep the active chip visible in the horizontal bar.
  useEffect(() => {
    const bar = chipBarRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-cat="${activeId}"]`);
    if (!bar || !chip) return;
    const left = chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2;
    bar.scrollTo({ left, behavior: "smooth" });
  }, [activeId]);

  // Back button closes the product sheet on phones.
  useEffect(() => {
    const onPop = () => setSelected(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openProduct = useCallback((p: Product) => {
    setSelected(p);
    window.history.pushState({ menuSheet: p.id }, "");
  }, []);
  const closeProduct = useCallback(() => {
    if (window.history.state?.menuSheet) window.history.back();
    else setSelected(null);
  }, []);

  const jumpTo = (id: string) => {
    setActiveId(id);
    document.getElementById(`kategori-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };
  const closeSearch = () => {
    setQuery("");
    setSearchOpen(false);
  };
  const resetSearch = () => {
    setQuery("");
    setSearchOpen(false);
    if (desktopSearchRef.current) desktopSearchRef.current.value = "";
    window.scrollTo({ top: 0 });
  };

  const totalProducts = sections.reduce((n, s) => n + s.products.length, 0);
  const greet = now?.greet ?? "Merhaba";

  return (
    <div className="min-h-dvh">
      {/* ── Desktop header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 hidden h-[76px] items-center gap-4 border-b border-divider bg-bg/95 px-14 backdrop-blur-sm md:flex">
        <BrandMark name={cafeName} logoUrl={logoUrl} size={42} />
        <span className="font-heading text-[21px] font-semibold">{cafeName}</span>
        <span className="text-[13px] text-neutral-700">Menü</span>
        <label className="ml-auto flex h-11 w-[340px] items-center gap-2.5 rounded-lg border border-divider px-3.5 text-neutral-700 focus-within:border-accent focus-within:outline-[3px] focus-within:outline-accent-100">
          <Search size={17} strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Menüde ara</span>
          <input
            ref={desktopSearchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Menüde ara…"
            enterKeyHint="search"
            className="h-full flex-1 bg-transparent text-[14px] text-text outline-none placeholder:text-neutral-700"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Aramayı temizle"
              className="grid size-8 cursor-pointer place-items-center rounded-full hover:bg-text/7"
            >
              <X size={15} strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </label>
      </header>

      {/* ── Mobile: welcome / search header ────────────────────────── */}
      {searchOpen ? (
        <div className="sticky top-0 z-20 flex items-center gap-1.5 border-b border-divider bg-bg py-4 pr-3 pl-5 md:hidden">
          <label className="flex h-12 flex-1 items-center gap-2.5 rounded-lg border border-accent pr-1.5 pl-3.5 outline-[3px] outline-accent-100 outline-solid">
            <Search size={18} strokeWidth={1.75} className="text-accent-700" aria-hidden />
            <span className="sr-only">Menüde ara</span>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kahve, tatlı, tost…"
              enterKeyHint="search"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-neutral-600"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Aramayı temizle"
                className="grid size-9 cursor-pointer place-items-center rounded-full text-neutral-700 hover:bg-text/7"
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            ) : null}
          </label>
          <button
            type="button"
            onClick={closeSearch}
            className="flex h-11 cursor-pointer items-center px-2 font-heading text-[15px] font-semibold text-accent-700"
          >
            Vazgeç
          </button>
        </div>
      ) : (
        <div ref={heroRef} className="flex flex-col gap-3.5 px-5 pt-5 pb-[18px] md:hidden">
          <div className="flex items-center gap-3">
            <BrandMark name={cafeName} logoUrl={logoUrl} size={44} />
            <div className="flex flex-1 flex-col">
              <span className="font-heading text-[19px] leading-[1.1] font-semibold">{cafeName}</span>
              {subtitle ? <span className="text-[12px] text-neutral-700">{subtitle}</span> : null}
            </div>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Menüde ara"
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-divider hover:bg-text/7"
            >
              <Search size={19} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 pt-1.5">
            <h1 className="text-[36px] leading-[1.05] font-normal tracking-[-0.02em]">
              {greet}, <em>hoş geldin.</em>
            </h1>
            {tagline ? (
              <p className="text-[14px] leading-normal text-pretty text-neutral-700">{tagline}</p>
            ) : null}
          </div>
          <StatusLine status={now?.status ?? null} wifiPassword={wifiPassword} />
        </div>
      )}

      {/* ── Mobile: sticky compact header + category chips ─────────── */}
      {!searchOpen && sections.length > 0 ? (
        <div className="sticky top-0 z-20 bg-bg md:hidden">
          <div
            aria-hidden={!condensed}
            className={cn(
              "flex items-center gap-2.5 overflow-hidden border-divider bg-bg pr-3 pl-5 transition-[height] duration-200",
              condensed ? "h-[60px] border-b" : "h-0",
            )}
          >
            <BrandMark name={cafeName} logoUrl={logoUrl} size={32} />
            <span className="flex-1 font-heading text-[18px] font-semibold">{cafeName}</span>
            <button
              type="button"
              tabIndex={condensed ? 0 : -1}
              onClick={openSearch}
              aria-label="Menüde ara"
              className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-text/7"
            >
              <Search size={19} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          <nav aria-label="Kategoriler" className="relative border-b border-divider">
            <div ref={chipBarRef} className="no-scrollbar flex gap-1 overflow-x-auto px-5 py-2 whitespace-nowrap">
              {sections.map((s) => {
                const active = s.id === activeId;
                return (
                  <a
                    key={s.id}
                    href={`#kategori-${s.id}`}
                    data-cat={s.id}
                    aria-current={active ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      jumpTo(s.id);
                    }}
                    className={cn(
                      "flex h-11 flex-none items-center rounded-full border font-heading text-[15px] font-semibold transition-colors",
                      active
                        ? "border-accent bg-accent-100 px-4 text-accent-800"
                        : "border-transparent px-3.5 text-neutral-700 hover:text-text",
                    )}
                  >
                    {s.name}
                  </a>
                );
              })}
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-r from-transparent to-bg"
            />
          </nav>
        </div>
      ) : null}

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 md:px-10 md:pt-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16 lg:px-14">
        {/* Desktop sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-[124px] flex flex-col gap-1.5">
            <h1 className="mb-1.5 text-[40px] leading-[1.05] font-normal">
              {greet}, <em>hoş geldin.</em>
            </h1>
            {tagline ? <p className="mb-2 text-[14px] text-neutral-700">{tagline}</p> : null}
            <StatusLine status={now?.status ?? null} wifiPassword={wifiPassword} stacked className="mb-4" />
            <nav aria-label="Kategoriler" className="flex flex-col">
              {sections.map((s) => {
                const active = !searching && s.id === activeId;
                return (
                  <a
                    key={s.id}
                    href={`#kategori-${s.id}`}
                    aria-current={active ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      setQuery("");
                      requestAnimationFrame(() => jumpTo(s.id));
                    }}
                    className={cn(
                      "flex h-11 items-center border-l-2 pl-3.5 font-heading text-[17px] font-semibold transition-colors",
                      active
                        ? "border-accent text-accent-800"
                        : "border-divider text-neutral-700 hover:text-text",
                    )}
                  >
                    {s.name}
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        <main id="menu" className="px-5 pb-16 md:px-0">
          {searching ? (
            hits.length ? (
              <SearchResults query={query} hits={hits} onSelect={openProduct} />
            ) : (
              <SearchEmpty
                query={query}
                suggestions={suggestions}
                onSuggestion={(s) => {
                  setQuery(s);
                  searchInputRef.current?.focus();
                }}
                onReset={resetSearch}
              />
            )
          ) : searchOpen ? (
            <p className="pt-10 text-center text-[14px] text-neutral-700">
              Ne arıyorsun? Ürün adı, içerik ya da kategori yazabilirsin.
            </p>
          ) : totalProducts === 0 ? (
            <MenuEmpty />
          ) : (
            sections.map((s, si) => (
              <section
                key={s.id}
                id={`kategori-${s.id}`}
                aria-labelledby={`baslik-${s.id}`}
                className="scroll-mt-[64px] pt-[22px] md:scroll-mt-[100px] md:pt-0 md:pb-9"
              >
                <div className="flex items-baseline gap-2.5 pb-1 md:gap-3 md:border-b md:border-divider md:pb-1.5">
                  <h2 id={`baslik-${s.id}`} className="text-[26px] font-normal md:text-[30px]">
                    {s.name}
                  </h2>
                  <span className="tnum text-[12px] text-neutral-600">{s.products.length} ürün</span>
                </div>
                <ul className="md:grid md:grid-cols-1 md:gap-x-10 xl:grid-cols-2">
                  {s.products.map((p, pi) => (
                    <li key={p.id}>
                      <ProductCard product={p} onSelect={openProduct} priority={si === 0 && pi < 3} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </main>
      </div>

      <ProductSheet
        product={selected}
        categoryName={selected ? categoryOf.get(selected.id) : undefined}
        onClose={closeProduct}
      />
    </div>
  );
}

function StatusLine({
  status,
  wifiPassword,
  stacked,
  className,
}: {
  status: ReturnType<typeof todayStatus> | null;
  wifiPassword: string | null;
  stacked?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[19px] flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-neutral-800",
        stacked && "flex-col items-start",
        className,
      )}
    >
      {status ? (
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn("size-[7px] rounded-full", status.open ? "bg-accent" : "border border-neutral-500")}
          />
          <span>{status.label}</span>
        </span>
      ) : null}
      {status && wifiPassword && !stacked ? (
        <span className="text-neutral-500" aria-hidden>
          ·
        </span>
      ) : null}
      {wifiPassword ? (
        <span>
          Wi‑Fi: <span className="font-mono text-[11px]">{wifiPassword}</span>
        </span>
      ) : null}
    </div>
  );
}

function MenuEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 pt-16 text-center">
      <h2 className="text-[28px] font-normal">Menü hazırlanıyor</h2>
      <p className="max-w-[300px] text-[14px] leading-normal text-neutral-700">
        Şu an listelenecek ürün yok. Kasaya uğra, bugün neler olduğunu anlatalım.
      </p>
    </div>
  );
}
