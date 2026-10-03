import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, EyeOff, Plus, QrCode } from "lucide-react";

import { PageHeader, StatsStrip } from "@/components/admin/page-header";
import { SoldOutList } from "@/components/admin/sold-out-list";
import { buttonStyles } from "@/components/ui/button";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Özet" };

export default async function DashboardPage() {
  const { supabase } = await requireAdminPage();
  const [products, categories] = await Promise.all([
    getAdminProducts(supabase),
    getAdminCategories(supabase),
  ]);
  const soldOut = products.filter((p) => !p.in_stock);
  const hidden = products.filter((p) => !p.is_visible);
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-6 px-5 pt-[18px] md:px-10 md:py-8">
      <PageHeader
        kicker="Genel durum"
        title="Özet"
        actions={
          <Link
            href="/admin/products?yeni=1"
            className={buttonStyles({ variant: "primary", size: "md", className: "hidden md:inline-flex" })}
          >
            <Plus size={17} strokeWidth={2} aria-hidden /> Yeni ürün
          </Link>
        }
      />

      <StatsStrip
        total={products.length}
        categoryCount={categories.length}
        inStock={products.length - soldOut.length}
        soldOut={soldOut.length}
        soldOutNames={soldOut.map((p) => p.name)}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
        <section aria-labelledby="tukenenler" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between border-b border-divider pb-2">
            <h2 id="tukenenler" className="text-[22px]">
              Tükenenler
            </h2>
            <Link href="/admin/products" className="text-[13px] text-accent-700 underline underline-offset-[3px]">
              Tüm ürünler
            </Link>
          </div>
          {soldOut.length ? (
            <SoldOutList
              items={soldOut.map((p) => ({ id: p.id, name: p.name, category: catName[p.category_id] ?? "" }))}
            />
          ) : (
            <p className="py-4 text-[14px] text-neutral-700">Her şey stokta. Güzel gün!</p>
          )}
        </section>

        <section aria-labelledby="kisayollar" className="flex flex-col gap-3">
          <h2 id="kisayollar" className="border-b border-divider pb-2 text-[22px]">
            Kısayollar
          </h2>
          <ul className="flex flex-col">
            <li>
              <Link href="/admin/products?yeni=1" className="flex h-14 items-center gap-3 border-b border-divider no-underline hover:text-accent-700">
                <Plus size={18} strokeWidth={1.75} className="text-accent-700" aria-hidden />
                Yeni ürün ekle
              </Link>
            </li>
            <li>
              <Link href="/admin/qr" className="flex h-14 items-center gap-3 border-b border-divider no-underline hover:text-accent-700">
                <QrCode size={18} strokeWidth={1.75} className="text-accent-700" aria-hidden />
                Masa kartı için QR kodu indir
              </Link>
            </li>
            <li>
              <a
                href="/menu"
                target="_blank"
                rel="noopener"
                className="flex h-14 items-center gap-3 border-b border-divider no-underline hover:text-accent-700"
              >
                <ArrowUpRight size={18} strokeWidth={1.75} className="text-accent-700" aria-hidden />
                Müşteri menüsünü önizle
              </a>
            </li>
          </ul>
          {hidden.length ? (
            <p className="flex items-start gap-2.5 rounded-md border border-divider px-3.5 py-3 text-[13px] text-neutral-800">
              <EyeOff size={16} strokeWidth={1.75} className="mt-0.5 flex-none text-neutral-700" aria-hidden />
              <span>
                {hidden.length} ürün menüde gizli: {hidden.map((p) => p.name).join(", ")}.
              </span>
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
