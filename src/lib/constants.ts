export type TagTone = "accent" | "plain" | "hot";

/** Product tags. Stored in `products.tags` by key. */
export const TAGS = [
  { key: "yeni", label: "Yeni", tone: "accent" },
  { key: "vegan", label: "Vegan", tone: "plain" },
  { key: "glutensiz", label: "Glutensiz", tone: "plain" },
  { key: "aci", label: "Acı", tone: "hot" },
  { key: "ev-yapimi", label: "Ev yapımı", tone: "accent" },
] as const satisfies readonly { key: string; label: string; tone: TagTone }[];

export type TagKey = (typeof TAGS)[number]["key"];
export const TAG_KEYS = TAGS.map((t) => t.key) as [TagKey, ...TagKey[]];

/** Allergens. Stored in `products.allergens` by key. */
export const ALLERGENS = [
  { key: "sut", label: "Süt ürünü" },
  { key: "gluten", label: "Gluten" },
  { key: "yumurta", label: "Yumurta" },
  { key: "kuruyemis", label: "Kuruyemiş" },
  { key: "soya", label: "Soya" },
  { key: "susam", label: "Susam" },
] as const;

export type AllergenKey = (typeof ALLERGENS)[number]["key"];
export const ALLERGEN_KEYS = ALLERGENS.map((a) => a.key) as [AllergenKey, ...AllergenKey[]];

export const DAYS = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
] as const;

export const DESCRIPTION_MAX = 140;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function tagByKey(key: string) {
  return TAGS.find((t) => t.key === key);
}

export function allergenLabel(key: string) {
  return ALLERGENS.find((a) => a.key === key)?.label ?? key;
}
