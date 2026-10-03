// Only NEXT_PUBLIC_* values live here: this module is safe to import from the
// browser. The service-role key is intentionally never read by the app.

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı olmalı (.env.local).",
    );
  }
  return { url, anonKey };
}

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}

export const PRODUCT_IMAGES_BUCKET = "product-images";

export function publicImageUrl(path: string | null | undefined) {
  if (!path) return null;
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
