"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { Wordmark } from "@/components/site/wordmark";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { localizedPath, optionLabel, resultsLabel, stockLabel, translate, type Locale } from "@/lib/i18n";
import { SELF_SERVICE_NOTE } from "@/lib/brand";
import { cn } from "@/lib/cn";
import type { OpeningHoursDay, Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { ProductSheet } from "./product-sheet";
import { searchProducts } from "./menu-search";

export type MenuViewSection = { id: string; name: string; products: Product[] };
export type MenuViewProps = {
  locale?: Locale;
  cafeName: string;
  logoUrl: string | null;
  subtitle: string | null;
  tagline: string | null;
  wifiPassword: string | null;
  openingHours: OpeningHoursDay[];
  sections: MenuViewSection[];
};

export function MenuView({ cafeName, logoUrl, wifiPassword, sections, locale = "tr" }: MenuViewProps) {
  const t = (text: string) => translate(locale, text);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const searching = deferredQuery.trim().length > 0;
  const visible = useMemo(() => {
    const hits = searching ? new Set(searchProducts(sections, deferredQuery).map((h) => h.product.id)) : null;
    return sections.filter((s) => category === "all" || s.id === category).map((s) => ({
      ...s, products: s.products.filter((p) => (!availableOnly || p.in_stock) && (!hits || hits.has(p.id))),
    })).filter((s) => s.products.length > 0);
  }, [sections, category, availableOnly, searching, deferredQuery]);
  const count = visible.reduce((sum, s) => sum + s.products.length, 0);
  const total = sections.reduce((sum, s) => sum + s.products.length, 0);
  const categoryOf = useMemo(() => new Map(sections.flatMap((s) => s.products.map((p) => [p.id, s.name] as const))), [sections]);

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
  const resetFilters = () => { setQuery(""); setCategory("all"); setAvailableOnly(false); };

  return (
    <div className="public-menu" lang={locale}>
      <a href="#menu" className="skip-link">{t("Menüye geç")}</a>
      <header className="menu-brand-header site-container">
        <Link href={localizedPath(locale)} className="menu-back" aria-label={t("Ana sayfaya dön")}><ArrowLeft size={20} aria-hidden /><span>{t("Ana sayfa")}</span></Link>
        <Link href={localizedPath(locale)} className="brand-link"><Wordmark name={cafeName} logoUrl={logoUrl} /></Link>
        <LanguageSwitcher locale={locale} page="/menu" />
      </header>
      <div className="site-container menu-intro">
        <p className="eyebrow">{t("Jön menüsü")}</p>
        <h1>{t("Bugün canın")}<br className="mobile-only" /> <em>{t("ne ister?")}</em></h1>
        <p>{t(SELF_SERVICE_NOTE)}</p>
      </div>
      <div className="menu-tools">
        <div className="site-container">
          <div className="menu-search-row">
            <label className="menu-search-field"><Search size={20} aria-hidden /><span className="sr-only">{t("Menüde ara")}</span><input type="search" placeholder={t("Kahve, tatlı, bir şeyler ara…")} value={query} onChange={(e) => setQuery(e.target.value)} enterKeyHint="search" />{query ? <button type="button" aria-label={t("Aramayı temizle")} onClick={() => setQuery("")}><X size={18} aria-hidden /></button> : null}</label>
            <button type="button" className={cn("availability-filter", availableOnly && "is-active")} aria-label={t("Yalnızca stokta olanları göster")} aria-pressed={availableOnly} onClick={() => setAvailableOnly((v) => !v)}><SlidersHorizontal size={20} aria-hidden /><span>{t("Stoktakiler")}</span></button>
          </div>
          <nav aria-label={t("Menü kategorileri")} className="menu-categories no-scrollbar">
            <button type="button" aria-pressed={category === "all"} className={cn("category-pill", category === "all" && "is-active")} onClick={() => setCategory("all")}>{t("Tümü")}</button>
            {sections.map((s) => <button type="button" key={s.id} aria-pressed={category === s.id} className={cn("category-pill", category === s.id && "is-active")} onClick={() => setCategory(s.id)}>{s.name}</button>)}
          </nav>
        </div>
      </div>
      <main id="menu" className="site-container menu-body">
        <div className="menu-result-line" aria-live="polite" aria-atomic="true"><span>{searching ? resultsLabel(locale, deferredQuery.trim(), count) : availableOnly ? stockLabel(locale, count) : t("Kahve, tatlı & küçük mutluluklar")}</span><span>{t("Fiyatlar ₺ cinsindendir")}</span></div>
        {count === 0 ? (
          <section className="menu-empty"><span aria-hidden>✳</span><h2>{t(total === 0 ? "Menümüz hazırlanıyor." : "Aradığını bulamadık.")}</h2><p>{t(total === 0 ? "Güncel ürünlerimizi öğrenmek için kasaya uğrayabilirsin." : "Başka bir kelime deneyebilir veya tüm menüye dönebilirsin.")}</p>{total > 0 ? <button type="button" className="jon-button" onClick={resetFilters}>{t("Tüm menüyü göster")}</button> : null}</section>
        ) : visible.map((s, si) => (
          <section key={s.id} className="menu-section" aria-labelledby={`baslik-${s.id}`}>
            <div className="menu-section-heading"><h2 id={`baslik-${s.id}`}>{s.name}</h2><span>{s.products.length} {optionLabel(locale, s.products.length)}</span></div>
            <ul className="product-grid">{s.products.map((p, pi) => <li key={p.id} className={cn(p.is_featured && pi === 0 && "featured-menu-item")}><ProductCard locale={locale} product={p} onSelect={openProduct} priority={si === 0 && pi < 2} /></li>)}</ul>
          </section>
        ))}
        <footer className="menu-footer"><span className="menu-footer-star" aria-hidden>✳</span><p>{t("Bir yudum, küçük bir mola.")}</p><span>{t(SELF_SERVICE_NOTE)}</span>{wifiPassword ? <span className="menu-wifi">Wi-Fi: {wifiPassword}</span> : null}<Link href={localizedPath(locale)}>{cafeName}</Link></footer>
      </main>
      <ProductSheet locale={locale} product={selected} categoryName={selected ? categoryOf.get(selected.id) : undefined} onClose={closeProduct} />
    </div>
  );
}
