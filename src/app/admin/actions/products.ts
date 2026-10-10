"use server";

import { z } from "zod";

import {
  fail,
  ok,
  readFile,
  readJson,
  removeImage,
  revalidateAdmin,
  revalidatePublic,
  toFailure,
  uploadImage,
  type ActionResult,
} from "@/lib/action-utils";
import { requireAdmin } from "@/lib/auth";
import type { Product } from "@/lib/types";
import { fieldErrors, parsePrice, productSchema } from "@/lib/validation";

const idSchema = z.uuid();

function normalize(p: Product): Product {
  return { ...p, price: Number(p.price) };
}

/**
 * Create or update a product. FormData:
 *  - data: JSON of ProductFormValues
 *  - id: product id when editing
 *  - image: new image file (optional)
 *  - removeImage: "1" to clear the current image
 */
export async function saveProduct(formData: FormData): Promise<ActionResult<Product>> {
  try {
    const { supabase } = await requireAdmin();

    const parsed = productSchema.safeParse(readJson(formData));
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      return fail(`Kaydetmeden önce ${Object.keys(errors).length} alanı düzeltmen gerekiyor.`, errors);
    }
    const values = parsed.data;

    const rawId = formData.get("id");
    const id = rawId ? idSchema.safeParse(rawId) : null;
    if (id && !id.success) return fail("Geçersiz ürün.");

    let existing: Pick<Product, "image_path"> | null = null;
    if (id) {
      const { data, error } = await supabase
        .from("products")
        .select("image_path")
        .eq("id", id.data)
        .maybeSingle();
      if (error) throw error;
      if (!data) return fail("Ürün bulunamadı; başka biri silmiş olabilir.");
      existing = data;
    }

    let imagePath = existing?.image_path ?? null;
    let uploadedPath: string | null = null;
    const file = readFile(formData, "image");
    if (file) {
      const upload = await uploadImage(supabase, file, "products");
      if (!upload.ok) return fail(upload.error, { image: upload.error });
      uploadedPath = upload.path;
      imagePath = upload.path;
    } else if (formData.get("removeImage") === "1") {
      imagePath = null;
    }

    const row = {
      name: values.name,
      name_en: values.name_en || null,
      name_de: values.name_de || null,
      description_en: values.description_en || null,
      description_de: values.description_de || null,
      description: values.description || null,
      price: parsePrice(values.price),
      category_id: values.category_id,
      tags: values.tags,
      allergens: values.allergens,
      in_stock: values.in_stock,
      is_visible: values.is_visible,
      is_featured: values.is_featured,
      image_path: imagePath,
    };

    let saved: Product;
    if (id) {
      const { data, error } = await supabase
        .from("products")
        .update(row)
        .eq("id", id.data)
        .select("*")
        .single();
      if (error) {
        await removeImage(supabase, uploadedPath);
        throw error;
      }
      saved = data;
    } else {
      const { data: last } = await supabase
        .from("products")
        .select("sort_order")
        .eq("category_id", values.category_id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data, error } = await supabase
        .from("products")
        .insert({ ...row, sort_order: (last?.sort_order ?? 0) + 1 })
        .select("*")
        .single();
      if (error) {
        await removeImage(supabase, uploadedPath);
        throw error;
      }
      saved = data;
    }

    // The old file is only removed once the row points at the new one.
    if (existing?.image_path && existing.image_path !== imagePath) {
      await removeImage(supabase, existing.image_path);
    }

    revalidatePublic();
    revalidateAdmin();
    return ok(normalize(saved));
  } catch (err) {
    return toFailure(err);
  }
}

export async function setProductStock(id: string, inStock: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = z.object({ id: z.uuid(), inStock: z.boolean() }).safeParse({ id, inStock });
    if (!parsed.success) return fail("Geçersiz istek.");
    const { data, error } = await supabase
      .from("products")
      .update({ in_stock: parsed.data.inStock })
      .eq("id", parsed.data.id)
      .select("id");
    if (error) throw error;
    if (!data.length) return fail("Ürün bulunamadı.");
    revalidatePublic();
    revalidateAdmin();
    return ok();
  } catch (err) {
    return toFailure(err);
  }
}

export async function setProductVisibility(id: string, visible: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = z.object({ id: z.uuid(), visible: z.boolean() }).safeParse({ id, visible });
    if (!parsed.success) return fail("Geçersiz istek.");
    const { error } = await supabase
      .from("products")
      .update({ is_visible: parsed.data.visible })
      .eq("id", parsed.data.id);
    if (error) throw error;
    revalidatePublic();
    revalidateAdmin();
    return ok();
  } catch (err) {
    return toFailure(err);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) return fail("Geçersiz istek.");
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", parsed.data)
      .select("image_path");
    if (error) throw error;
    if (!data.length) return fail("Ürün bulunamadı.");
    await removeImage(supabase, data[0].image_path);
    revalidatePublic();
    revalidateAdmin();
    return ok();
  } catch (err) {
    return toFailure(err);
  }
}
