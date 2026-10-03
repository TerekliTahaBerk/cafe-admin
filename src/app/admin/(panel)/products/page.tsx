import type { Metadata } from "next";

import { ProductsView } from "@/components/admin/products/products-view";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Ürünler" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { yeni } = await searchParams;
  const { supabase } = await requireAdminPage();
  const [products, categories] = await Promise.all([
    getAdminProducts(supabase),
    getAdminCategories(supabase),
  ]);
  return <ProductsView initialProducts={products} categories={categories} openNew={yeni === "1"} />;
}
