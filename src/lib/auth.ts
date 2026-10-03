import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export class NotAuthorizedError extends Error {
  constructor() {
    super("Bu işlem için yönetici girişi gerekli.");
  }
}

/**
 * Returns the signed-in user only if they are listed in `public.admins`.
 * Being signed in is not enough — RLS uses the same `is_admin()` check.
 */
export const getAdmin = cache(async () => {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;
  return { user, supabase };
});

/** For pages/layouts: redirects to login when not an admin. */
export async function requireAdminPage() {
  const admin = await getAdmin();
  // Signed in but not an admin: sign out via the route handler (Server
  // Components can't write cookies), otherwise the proxy would bounce the
  // user between /admin and /admin/login.
  if (!admin) redirect("/admin/logout?reason=forbidden");
  return admin;
}

/** For Server Actions: throws when not an admin. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new NotAuthorizedError();
  return admin;
}
