import "server-only";

import { cache } from "react";
import { BRAND_NAME, displayCafeName, SELF_SERVICE_NOTE } from "@/lib/brand";

import { createPublicClient } from "@/lib/supabase/server";
import type { Category, Product, SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  id: true,
  cafe_name: BRAND_NAME,
  tagline: SELF_SERVICE_NOTE,
  about_text: null,
  location_label: null,
  address: null,
  phone: null,
  instagram: null,
  wifi_password: null,
  opening_hours: [],
  logo_path: null,
  map_embed_url: null,
  updated_at: new Date(0).toISOString(),
};

/**
 * Public reads use the anonymous client, so RLS only returns visible
 * products. These run at build/revalidate time for the cached / and /menu.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Ayarlar yüklenemedi: ${error.message}`);
  const settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
  return { ...settings, cafe_name: displayCafeName(settings.cafe_name) };
});

export type MenuSection = Category & { products: Product[] };

export const getMenu = cache(async (): Promise<MenuSection[]> => {
  const supabase = createPublicClient();
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase
      .from("products")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order")
      .order("name"),
  ]);
  if (cats.error) throw new Error(`Kategoriler yüklenemedi: ${cats.error.message}`);
  if (prods.error) throw new Error(`Ürünler yüklenemedi: ${prods.error.message}`);
  return cats.data.map((c) => ({
    ...c,
    products: prods.data
      .filter((p) => p.category_id === c.id)
      .map((p) => ({ ...p, price: Number(p.price) })),
  }));
});

export const getFeatured = cache(async (): Promise<Product[]> => {
  const { data, error } = await createPublicClient()
    .from("products")
    .select("*")
    .eq("is_visible", true)
    .eq("is_featured", true)
    .order("sort_order")
    .limit(6);
  if (error) throw new Error(`Öne çıkanlar yüklenemedi: ${error.message}`);
  return data.map((p) => ({ ...p, price: Number(p.price) }));
});
