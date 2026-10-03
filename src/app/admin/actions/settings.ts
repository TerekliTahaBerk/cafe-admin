"use server";

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
import type { SiteSettings } from "@/lib/types";
import { fieldErrors, passwordSchema, settingsSchema } from "@/lib/validation";

/** FormData: data (JSON of SettingsValues), logo (file, optional), removeLogo ("1"). */
export async function saveSettings(formData: FormData): Promise<ActionResult<SiteSettings>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = settingsSchema.safeParse(readJson(formData));
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      return fail(`Kaydetmeden önce ${Object.keys(errors).length} alanı düzeltmen gerekiyor.`, errors);
    }
    const v = parsed.data;

    const { data: current, error: readError } = await supabase
      .from("site_settings")
      .select("logo_path")
      .maybeSingle();
    if (readError) throw readError;

    let logoPath = current?.logo_path ?? null;
    let uploaded: string | null = null;
    const logo = readFile(formData, "logo");
    if (logo) {
      const up = await uploadImage(supabase, logo, "site");
      if (!up.ok) return fail(up.error, { logo: up.error });
      uploaded = up.path;
      logoPath = up.path;
    } else if (formData.get("removeLogo") === "1") {
      logoPath = null;
    }

    const blank = (s: string) => (s.trim() ? s.trim() : null);
    const { data, error } = await supabase
      .from("site_settings")
      .update({
        cafe_name: v.cafe_name,
        tagline: blank(v.tagline),
        location_label: blank(v.location_label),
        about_text: blank(v.about_text),
        address: blank(v.address),
        phone: blank(v.phone),
        instagram: blank(v.instagram.replace(/^@/, "")),
        wifi_password: blank(v.wifi_password),
        map_embed_url: blank(v.map_embed_url),
        opening_hours: [...v.opening_hours].sort((a, b) => a.day - b.day),
        logo_path: logoPath,
      })
      .eq("id", true)
      .select("*")
      .single();
    if (error) {
      await removeImage(supabase, uploaded);
      throw error;
    }
    if (current?.logo_path && current.logo_path !== logoPath) {
      await removeImage(supabase, current.logo_path);
    }

    revalidatePublic();
    revalidateAdmin();
    return ok(data);
  } catch (err) {
    return toFailure(err);
  }
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = passwordSchema.safeParse(input);
    if (!parsed.success) return fail("Formu kontrol et.", fieldErrors(parsed.error));
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      if (error.code === "same_password") {
        return fail("Yeni şifre eskisiyle aynı olamaz.", { password: "Yeni şifre eskisiyle aynı olamaz." });
      }
      if (error.code === "weak_password") {
        return fail("Bu şifre çok zayıf.", { password: "Bu şifre çok zayıf; daha uzun ve tahmin edilmesi zor bir şifre seç." });
      }
      if (error.code === "reauthentication_needed") {
        return fail("Güvenlik için çıkış yapıp tekrar giriş yaptıktan sonra dene.");
      }
      throw error;
    }
    return ok();
  } catch (err) {
    return toFailure(err);
  }
}
