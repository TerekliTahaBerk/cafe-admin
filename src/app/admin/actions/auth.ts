"use server";

import { cookies } from "next/headers";

import { fail, ok, type ActionResult } from "@/lib/action-utils";
import { getSiteUrl } from "@/lib/env";
import { REMEMBER_COOKIE } from "@/lib/supabase/cookies";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, forgotPasswordSchema, loginSchema } from "@/lib/validation";

const INVALID = "E-posta ya da şifre hatalı. Tekrar dene veya şifreni sıfırla.";

export async function signIn(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("Formu kontrol et.", fieldErrors(parsed.error));
  const { email, password, remember } = parsed.data;

  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 365 } : {}),
  });

  const supabase = await createClient({ remember });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.status === 429) return fail("Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.");
    return fail(INVALID);
  }

  // Signing in is not enough: the account must also be an admin.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return fail("Bu hesabın yönetim paneline erişimi yok.");
  }
  return ok();
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Formu kontrol et.", fieldErrors(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/admin/settings%23sifre`,
  });
  if (error && error.status === 429) {
    return fail("Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.");
  }
  // Always succeed otherwise, so the form can't be used to probe accounts.
  return ok();
}
