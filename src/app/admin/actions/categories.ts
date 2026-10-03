"use server";

import { z } from "zod";

import {
  fail,
  ok,
  revalidateAdmin,
  revalidatePublic,
  toFailure,
  type ActionResult,
} from "@/lib/action-utils";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";
import { categoryNameSchema } from "@/lib/validation";

export async function createCategory(name: string): Promise<ActionResult<Category>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = categoryNameSchema.safeParse(name);
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const { data: last } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: parsed.data, sort_order: (last?.sort_order ?? 0) + 1 })
      .select("*")
      .single();
    if (error) throw error;
    revalidatePublic();
    revalidateAdmin();
    return ok(data);
  } catch (err) {
    return toFailure(err);
  }
}

export async function renameCategory(id: string, name: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsedId = z.uuid().safeParse(id);
    const parsed = categoryNameSchema.safeParse(name);
    if (!parsedId.success) return fail("Geçersiz istek.");
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const { error } = await supabase
      .from("categories")
      .update({ name: parsed.data })
      .eq("id", parsedId.data);
    if (error) throw error;
    revalidatePublic();
    revalidateAdmin();
    return ok();
  } catch (err) {
    return toFailure(err);
  }
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = z.array(z.uuid()).max(200).safeParse(ids);
    if (!parsed.success) return fail("Geçersiz istek.");
    const { error } = await supabase.rpc("reorder_categories", { ids: parsed.data });
    if (error) throw error;
    revalidatePublic();
    revalidateAdmin();
    return ok();
  } catch (err) {
    return toFailure(err);
  }
}

/**
 * Deletes a category. If it still has products, `moveTo` must name another
 * category: products are moved there first, then the category is removed.
 * (The FK is ON DELETE RESTRICT, so products can never be orphaned.)
 */
export async function deleteCategory(
  id: string,
  moveTo?: string | null,
): Promise<ActionResult<{ moved: number }>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = z
      .object({ id: z.uuid(), moveTo: z.uuid().nullish() })
      .refine((v) => v.id !== v.moveTo, "Aynı kategoriye taşınamaz.")
      .safeParse({ id, moveTo });
    if (!parsed.success) return fail("Geçersiz istek.");

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", parsed.data.id);
    if (countError) throw countError;

    const productCount = count ?? 0;
    if (productCount > 0) {
      if (!parsed.data.moveTo) {
        return fail(`Bu kategoride ${productCount} ürün var. Önce başka bir kategoriye taşı.`);
      }
      const { error: moveError } = await supabase
        .from("products")
        .update({ category_id: parsed.data.moveTo })
        .eq("category_id", parsed.data.id);
      if (moveError) throw moveError;
    }

    const { error } = await supabase.from("categories").delete().eq("id", parsed.data.id);
    if (error) throw error;
    revalidatePublic();
    revalidateAdmin();
    return ok({ moved: productCount });
  } catch (err) {
    return toFailure(err);
  }
}
