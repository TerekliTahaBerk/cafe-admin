import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_SETTINGS } from "@/lib/data";
import type { Category, Database, Product, SiteSettings } from "@/lib/types";

type Client = SupabaseClient<Database>;

/** Admin reads go through the signed-in client: RLS returns hidden products too. */
export async function getAdminProducts(supabase: Client): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data.map((p) => ({ ...p, price: Number(p.price) }));
}

export type CategoryWithCount = Category & { product_count: number };

export async function getAdminCategories(supabase: Client): Promise<CategoryWithCount[]> {
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("products").select("category_id"),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  const counts = new Map<string, number>();
  prods.data.forEach((p) => counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1));
  return cats.data.map((c) => ({ ...c, product_count: counts.get(c.id) ?? 0 }));
}

export async function getAdminSettings(supabase: Client): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
  if (error) throw error;
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
}
