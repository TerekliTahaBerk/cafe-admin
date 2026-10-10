import "server-only";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { IMAGE_MAX_BYTES, IMAGE_TYPES } from "@/lib/constants";
import { NotAuthorizedError } from "@/lib/auth";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/env";
import type { Database } from "@/lib/types";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok<T = null>(data: T = null as T) {
  return { ok: true as const, data };
}

export function fail(error: string, fieldErrors?: Record<string, string>) {
  return { ok: false as const, error, fieldErrors };
}

/** Turns thrown errors into a user-facing message; never leaks internals. */
export function toFailure(err: unknown) {
  if (err instanceof NotAuthorizedError) return fail(err.message);
  console.error(err);
  return fail("Bir şeyler ters gitti. Lütfen tekrar dene.");
}

/** Public pages that show menu data. */
export function revalidatePublic() {
  revalidatePath("/menu");
  revalidatePath("/");
  for (const locale of ["en", "de"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/menu`);
  }
}

export function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

const MAGIC: Record<(typeof IMAGE_TYPES)[number], (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) =>
    String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.slice(8, 12)) === "WEBP",
};

const EXT: Record<(typeof IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Server-side image check: declared type, size, and the file's actual magic
 * bytes (so a renamed file can't slip through).
 */
export async function validateImage(file: File, label = "Görsel") {
  if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number])) {
    return { ok: false as const, error: `${label} yüklenemedi: yalnızca JPG, PNG ya da WebP.` };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { ok: false as const, error: `${label} yüklenemedi: dosya 5 MB'tan büyük.` };
  }
  if (file.size === 0) {
    return { ok: false as const, error: `${label} yüklenemedi: dosya boş.` };
  }
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const type = file.type as (typeof IMAGE_TYPES)[number];
  if (!MAGIC[type](head)) {
    return { ok: false as const, error: `${label} yüklenemedi: dosya bozuk ya da türü yanlış.` };
  }
  return { ok: true as const, ext: EXT[type], type };
}

export async function uploadImage(
  supabase: SupabaseClient<Database>,
  file: File,
  folder: "products" | "site",
) {
  const check = await validateImage(file);
  if (!check.ok) return check;
  const path = `${folder}/${crypto.randomUUID()}.${check.ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    contentType: check.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("upload failed", error);
    return { ok: false as const, error: "Görsel yüklenemedi. Tekrar dene." };
  }
  return { ok: true as const, path };
}

export async function removeImage(supabase: SupabaseClient<Database>, path: string | null | undefined) {
  if (!path) return;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  if (error) console.error("image cleanup failed", path, error);
}

export function readJson(formData: FormData, key = "data"): unknown {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}
