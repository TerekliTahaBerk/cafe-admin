import { z } from "zod";

import { ALLERGEN_KEYS, DESCRIPTION_MAX, TAG_KEYS } from "./constants";

/*
 * Shared zod schemas: used by react-hook-form on the client AND re-run inside
 * every Server Action, so the server never trusts client-side validation.
 */

const PRICE_RE = /^\d{1,6}([.,]\d{1,2})?$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Ürün adı gerekli.").max(80, "En fazla 80 karakter."),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `En fazla ${DESCRIPTION_MAX} karakter.`),
  price: z
    .string()
    .trim()
    .min(1, "Fiyat gerekli.")
    .regex(PRICE_RE, "Yalnızca rakam gir (örn. 150)."),
  category_id: z.uuid("Bir kategori seç."),
  tags: z.array(z.enum(TAG_KEYS)),
  allergens: z.array(z.enum(ALLERGEN_KEYS)),
  in_stock: z.boolean(),
  is_visible: z.boolean(),
  is_featured: z.boolean(),
});
export type ProductFormValues = z.infer<typeof productSchema>;

export function parsePrice(value: string) {
  return Number(value.trim().replace(",", "."));
}

export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Kategori adı gerekli.")
  .max(40, "En fazla 40 karakter.");

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi gir."),
  password: z.string().min(1, "Şifreni gir."),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi gir."),
});

export const passwordSchema = z
  .object({
    password: z.string().min(8, "En az 8 karakter."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Şifreler eşleşmiyor.",
  });
export type PasswordValues = z.infer<typeof passwordSchema>;

const openingDaySchema = z
  .object({
    day: z.number().int().min(0).max(6),
    open: z.boolean(),
    from: z.string().regex(TIME_RE, "SS:DD"),
    to: z.string().regex(TIME_RE, "SS:DD"),
  })
  .refine((d) => !d.open || d.from < d.to, {
    path: ["to"],
    message: "Kapanış açılıştan sonra olmalı.",
  });

const optionalText = (max: number) =>
  z.string().trim().max(max, `En fazla ${max} karakter.`);

export const settingsSchema = z.object({
  cafe_name: z.string().trim().min(1, "Kafe adı gerekli.").max(60, "En fazla 60 karakter."),
  tagline: optionalText(120),
  location_label: optionalText(60),
  about_text: optionalText(1200),
  address: optionalText(160),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[\d\s()+-]*$/, "Yalnızca rakam, boşluk ve + ( ) - kullan."),
  instagram: z
    .string()
    .trim()
    .regex(/^@?[A-Za-z0-9._]{0,30}$/, "Geçerli bir Instagram kullanıcı adı gir."),
  wifi_password: optionalText(40),
  map_embed_url: z
    .string()
    .trim()
    .refine((v) => v === "" || isAllowedMapUrl(v), {
      message: "Google Haritalar ya da OpenStreetMap “yerleştir” bağlantısı olmalı (https).",
    }),
  opening_hours: z.array(openingDaySchema).length(7),
});
export type SettingsValues = z.infer<typeof settingsSchema>;

export function isAllowedMapUrl(value: string) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.replace(/^www\./, "");
    return (
      (host === "google.com" && u.pathname.startsWith("/maps/embed")) ||
      host === "openstreetmap.org"
    );
  } catch {
    return false;
  }
}

/** Collects the user-facing message for each invalid field. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
