"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AlignJustify, LayoutGrid, Pencil, Plus, Search, Trash, X } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct, setProductStock, setProductVisibility } from "@/app/admin/actions/products";
import { PageHeader, StatsStrip } from "@/components/admin/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/field";
import { MenuButton } from "@/components/ui/menu-button";
import { Photo } from "@/components/ui/photo";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { publicImageUrl } from "@/lib/env";
import { formatPrice, normalizeSearch } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { ProductEditor, type EditorTarget } from "./product-editor";

type StatusFilter = "all" | "in" | "out";

/** Short category labels for the narrow mobile rows (design: "Sıcak · ₺120"). */
function shortCategory(name: string) {
  const first = name.split(/\s+/)[0];
  return name.length > 12 ? first : name;
}

export function ProductsView({
  initialProducts,
  categories,
  openNew = false,
}: {
  initialProducts: Product[];
  categories: Category[];
  openNew?: boolean;
}) {
  // Local copy for optimistic updates; re-synced whenever the server sends
  // fresh data (after revalidation).
  const [products, setProducts] = useState(initialProducts);
  const [synced, setSynced] = useState(initialProducts);
  if (initialProducts !== synced) {
    setSynced(initialProducts);
    setProducts(initialProducts);
  }

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [editor, setEditorState] = useState<EditorTarget | null>(
    openNew && categories.length ? { mode: "new" } : null,
  );
  const setEditor = (next: EditorTarget | null) => {
    // Drop the ?yeni=1 shortcut from the URL once it has been used.
    if (!next && window.location.search) window.history.replaceState(null, "", window.location.pathname);
    setEditorState(next);
  };
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, startDelete] = useTransition();

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const catOrder = useMemo(() => new Map(categories.map((c, i) => [c.id, i])), [categories]);

  const sorted = useMemo(
    () =>
      [...products].sort(
        (a, b) =>
          (catOrder.get(a.category_id) ?? 99) - (catOrder.get(b.category_id) ?? 99) ||
          a.sort_order - b.sort_order ||
          a.name.localeCompare(b.name, "tr"),
      ),
    [products, catOrder],
  );

  const inStockCount = products.filter((p) => p.in_stock).length;
  const soldOut = products.filter((p) => !p.in_stock);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    return sorted.filter(
      (p) =>
        (categoryFilter === "all" || p.category_id === categoryFilter) &&
        (status === "all" || (status === "in" ? p.in_stock : !p.in_stock)) &&
        (!q ||
          normalizeSearch(p.name).includes(q) ||
          normalizeSearch(p.description ?? "").includes(q)),
    );
  }, [sorted, query, categoryFilter, status]);

  const patch = (id: string, change: Partial<Product>) =>
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...change } : p)));

  /** One-tap stock toggle: optimistic, rolled back with a toast on failure. */
  async function toggleStock(product: Product, next: boolean, { silent = false } = {}) {
    patch(product.id, { in_stock: next });
    const res = await setProductStock(product.id, next);
    if (!res.ok) {
      patch(product.id, { in_stock: !next });
      toast.error(`${product.name} güncellenemedi. ${res.error}`);
      return;
    }
    if (silent) return;
    toast.success(
      <span>
        <strong>{product.name}</strong> {next ? "stokta olarak işaretlendi." : "tükendi olarak işaretlendi."}
      </span>,
      {
        id: `stock-${product.id}`,
        action: { label: "Geri al", onClick: () => void toggleStock(product, !next, { silent: true }) },
      },
    );
  }

  function confirmDelete() {
    const target = toDelete;
    if (!target) return;
    startDelete(async () => {
      const res = await deleteProduct(target.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setProducts((list) => list.filter((p) => p.id !== target.id));
      setToDelete(null);
      setEditor(null);
      toast.success(`“${target.name}” silindi.`);
    });
  }

  function hideInstead() {
    const target = toDelete;
    if (!target) return;
    setToDelete(null);
    patch(target.id, { is_visible: false });
    void setProductVisibility(target.id, false).then((res) => {
      if (!res.ok) {
        patch(target.id, { is_visible: true });
        toast.error(res.error);
      } else toast.success(`“${target.name}” menüde gizlendi.`);
    });
  }

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setStatus("all");
  };
  const hasFilters = !!query || categoryFilter !== "all" || status !== "all";

  const statusOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Tümü", count: products.length },
    { key: "in", label: "Stokta", count: inStockCount },
    { key: "out", label: "Tükendi", count: soldOut.length },
  ];

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-[18px] md:gap-6 md:px-10 md:py-8">
      <PageHeader
        kicker="Menü yönetimi"
        title="Ürünler"
        actions={
          <>
            <Button
              variant="primary"
              size="lg"
              className="hidden h-11 md:inline-flex"
              onClick={() => setEditor({ mode: "new" })}
            >
              <Plus size={17} strokeWidth={2} aria-hidden />
              Yeni ürün
            </Button>
            <button
              type="button"
              aria-label="Yeni ürün"
              onClick={() => setEditor({ mode: "new" })}
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-accent text-accent-700 hover:bg-accent/12 md:hidden"
            >
              <Plus size={18} strokeWidth={2} aria-hidden />
            </button>
          </>
        }
      />

      <StatsStrip
        total={products.length}
        categoryCount={categories.length}
        inStock={inStockCount}
        soldOut={soldOut.length}
        soldOutNames={soldOut.map((p) => p.name)}
      />

      {/* ── Filters ── */}
      <div className="flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-3">
        <label className="flex h-11 items-center gap-2.5 rounded-md border border-divider px-3.5 text-neutral-700 focus-within:border-accent focus-within:outline-[3px] focus-within:outline-accent-100 md:max-w-[360px] md:min-w-[240px] md:flex-1">
          <Search size={17} strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Ürün ara</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün ara"
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-text outline-none placeholder:text-neutral-700 md:text-[14px]"
          />
          {query ? (
            <button
              type="button"
              aria-label="Aramayı temizle"
              onClick={() => setQuery("")}
              className="grid size-8 cursor-pointer place-items-center rounded-full hover:bg-text/7"
            >
              <X size={15} aria-hidden />
            </button>
          ) : null}
        </label>

        {/* Desktop: category select + segmented status */}
        <div className="hidden w-[200px] md:block">
          <Select
            aria-label="Kategori filtresi"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 text-[14px]"
          >
            <option value="all">Tüm kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div role="radiogroup" aria-label="Stok durumu filtresi" className="hidden h-11 overflow-hidden rounded-md border border-divider text-[14px] md:flex">
          {statusOptions.map((o, i) => (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={status === o.key}
              onClick={() => setStatus(o.key)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 px-4 transition-colors",
                i > 0 && "border-l border-divider",
                status === o.key
                  ? "bg-accent-100 text-accent-800 shadow-[inset_0_0_0_1px_var(--color-accent)]"
                  : "hover:bg-text/7",
              )}
            >
              {o.label}
              <span className={cn("tnum text-[12px]", status !== o.key && "text-neutral-700")}>{o.count}</span>
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Görünüm" className="ml-auto hidden overflow-hidden rounded-md border border-divider md:flex">
          {(
            [
              ["list", "Liste görünümü", AlignJustify],
              ["grid", "Kart görünümü", LayoutGrid],
            ] as const
          ).map(([key, label, Icon], i) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={view === key}
              aria-label={label}
              onClick={() => setView(key)}
              className={cn(
                "grid h-[42px] w-11 cursor-pointer place-items-center",
                i > 0 && "border-l border-divider",
                view === key ? "bg-accent-100 text-accent-800" : "hover:bg-text/7",
              )}
            >
              <Icon size={17} strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>

        {/* Mobile: chips */}
        <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5 whitespace-nowrap md:hidden">
          {statusOptions.map((o) => (
            <button
              key={o.key}
              type="button"
              aria-pressed={status === o.key}
              onClick={() => setStatus(o.key)}
              className={cn(
                "flex h-10 flex-none cursor-pointer items-center rounded-full border px-3.5 text-[13px]",
                status === o.key ? "border-accent bg-accent-100 text-accent-800" : "border-divider",
              )}
            >
              {o.label} · {o.count}
            </button>
          ))}
          <label
            className={cn(
              "relative flex h-10 flex-none items-center gap-1.5 rounded-full border px-3 text-[13px]",
              categoryFilter !== "all" ? "border-accent bg-accent-100 text-accent-800" : "border-divider",
            )}
          >
            <span>{categoryFilter === "all" ? "Kategori" : catName.get(categoryFilter)}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
            <select
              aria-label="Kategori filtresi"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="all">Tüm kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── Results ── */}
      {products.length === 0 ? (
        <EmptyState
          title="Henüz ürün yok"
          text={categories.length ? "İlk ürününü ekle; menüde hemen görünür." : "Önce bir kategori oluştur, sonra ürün ekle."}
          action={
            categories.length ? (
              <Button variant="primary" size="lg" onClick={() => setEditor({ mode: "new" })}>
                <Plus size={17} strokeWidth={2} aria-hidden /> İlk ürünü ekle
              </Button>
            ) : (
              <Link href="/admin/categories" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Kategorilere git
              </Link>
            )
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Bu filtreyle eşleşen ürün yok"
          text="Aramayı ya da filtreleri değiştirip tekrar dene."
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Filtreleri temizle
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          {view === "list" ? (
            <div role="table" aria-label="Ürünler" className="hidden border-t border-divider md:block">
              <div
                role="row"
                className="grid grid-cols-[minmax(0,2.6fr)_1.1fr_0.7fr_0.6fr_1.1fr_96px] items-center gap-4 border-b border-divider px-3 py-2.5 text-[11px] tracking-[0.08em] text-neutral-700 uppercase"
              >
                <span role="columnheader">Ürün</span>
                <span role="columnheader">Kategori</span>
                <span role="columnheader" className="text-right">
                  Fiyat
                </span>
                <span role="columnheader">Menüde</span>
                <span role="columnheader">Stok durumu</span>
                <span role="columnheader">
                  <span className="sr-only">İşlemler</span>
                </span>
              </div>
              {filtered.map((p) => (
                <div
                  role="row"
                  key={p.id}
                  className="grid grid-cols-[minmax(0,2.6fr)_1.1fr_0.7fr_0.6fr_1.1fr_96px] items-center gap-4 border-b border-divider px-3 py-2 transition-colors hover:bg-text/4"
                >
                  <div role="cell" className="flex min-w-0 items-center gap-3.5">
                    <Photo
                      src={publicImageUrl(p.image_path)}
                      alt=""
                      sizes="48px"
                      className="size-12 flex-none rounded-md border border-divider"
                    />
                    <div className="flex min-w-0 flex-col">
                      <button
                        type="button"
                        onClick={() => setEditor({ mode: "edit", product: p })}
                        className="cursor-pointer truncate text-left font-heading text-[17px] font-semibold hover:text-accent-700"
                      >
                        {p.name}
                      </button>
                      <span className="truncate text-[12px] text-neutral-700">{p.description}</span>
                    </div>
                  </div>
                  <span role="cell" className="text-[14px]">
                    {catName.get(p.category_id)}
                  </span>
                  <span role="cell" className="tnum text-right font-heading text-[17px] font-semibold">
                    {formatPrice(p.price)}
                  </span>
                  <span role="cell" className={cn("text-[13px]", p.is_visible ? "text-neutral-700" : "text-neutral-800 italic")}>
                    {p.is_visible ? "Görünür" : "Gizli"}
                  </span>
                  <div role="cell">
                    <Switch
                      checked={p.in_stock}
                      onCheckedChange={(v) => void toggleStock(p, v)}
                      onLabel="Stokta"
                      offLabel="Tükendi"
                      ariaLabel={`${p.name} stokta`}
                    />
                  </div>
                  <div role="cell" className="flex justify-end gap-1 text-neutral-800">
                    <button
                      type="button"
                      aria-label={`${p.name} düzenle`}
                      onClick={() => setEditor({ mode: "edit", product: p })}
                      className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-accent/10"
                    >
                      <Pencil size={17} strokeWidth={1.75} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`${p.name} sil`}
                      onClick={() => setToDelete(p)}
                      className="grid size-11 cursor-pointer place-items-center rounded-md hover:bg-accent/10"
                    >
                      <Trash size={17} strokeWidth={1.75} aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="hidden grid-cols-2 gap-x-6 gap-y-8 md:grid lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <li key={p.id} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: "edit", product: p })}
                    aria-label={`${p.name} düzenle`}
                    className="cursor-pointer"
                  >
                    <Photo
                      src={publicImageUrl(p.image_path)}
                      alt=""
                      sizes="(min-width: 1280px) 20vw, 30vw"
                      muted={!p.in_stock}
                      className="plate aspect-square"
                    />
                  </button>
                  <div className="flex items-baseline justify-between gap-2 border-b border-divider pb-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-heading text-[18px] font-semibold">{p.name}</span>
                      <span className="text-[12px] text-neutral-700">
                        {catName.get(p.category_id)}
                        {p.is_visible ? "" : " · Gizli"}
                      </span>
                    </div>
                    <span className="tnum font-heading text-[17px] font-semibold">{formatPrice(p.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Switch
                      checked={p.in_stock}
                      onCheckedChange={(v) => void toggleStock(p, v)}
                      onLabel="Stokta"
                      offLabel="Tükendi"
                      ariaLabel={`${p.name} stokta`}
                    />
                    <MenuButton
                      label={`${p.name} işlemleri`}
                      items={[
                        { label: "Düzenle", onSelect: () => setEditor({ mode: "edit", product: p }), icon: <Pencil size={16} aria-hidden /> },
                        { label: "Sil", onSelect: () => setToDelete(p), danger: true, icon: <Trash size={16} aria-hidden /> },
                      ]}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Mobile list */}
          <ul className="md:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="flex items-center gap-3 border-t border-divider py-2">
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "edit", product: p })}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  <Photo
                    src={publicImageUrl(p.image_path)}
                    alt=""
                    sizes="52px"
                    muted={!p.in_stock}
                    className="size-[52px] flex-none rounded-md border border-divider"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-heading text-[17px] font-semibold">{p.name}</span>
                    <span className="text-[12px] text-neutral-700">
                      {shortCategory(catName.get(p.category_id) ?? "")} ·{" "}
                      <span className="tnum">{formatPrice(p.price)}</span>
                      {p.is_visible ? "" : " · Gizli"}
                    </span>
                  </span>
                </button>
                <Switch
                  checked={p.in_stock}
                  onCheckedChange={(v) => void toggleStock(p, v)}
                  onLabel="Stokta"
                  offLabel="Tükendi"
                  ariaLabel={`${p.name} stokta`}
                  size="lg"
                  layout="stacked"
                />
                <MenuButton
                  label={`${p.name} işlemleri`}
                  items={[
                    { label: "Düzenle", onSelect: () => setEditor({ mode: "edit", product: p }), icon: <Pencil size={16} aria-hidden /> },
                    { label: "Sil", onSelect: () => setToDelete(p), danger: true, icon: <Trash size={16} aria-hidden /> },
                  ]}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <ProductEditor
        target={editor}
        categories={categories}
        onClose={() => setEditor(null)}
        onSaved={(saved, isNew) => {
          setProducts((list) => (isNew ? [...list, saved] : list.map((p) => (p.id === saved.id ? saved : p))));
          setEditor(null);
        }}
        onDelete={(p) => setToDelete(p)}
      />

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={toDelete ? `“${toDelete.name}” silinsin mi?` : ""}
      >
        <p>
          Ürün menüden ve panelden kalıcı olarak kaldırılır. Bir süreliğine gizlemek istiyorsan{" "}
          {toDelete?.is_visible ? (
            <button
              type="button"
              onClick={hideInstead}
              className="cursor-pointer text-accent-700 underline underline-offset-[3px]"
            >
              menüde gösterme
            </button>
          ) : (
            "menüde gösterme"
          )}{" "}
          yeterli.
        </p>
      </ConfirmDialog>
    </div>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-400 px-6 py-14 text-center">
      <h2 className="text-[26px] font-normal">{title}</h2>
      <p className="max-w-[340px] text-[14px] text-neutral-700">{text}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
