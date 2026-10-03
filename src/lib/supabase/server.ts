import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/types";
import { REMEMBER_COOKIE, withRememberPreference } from "./cookies";

/** Cookie-aware client: acts as the signed-in admin (RLS applies). */
export async function createClient(options: { remember?: boolean } = {}) {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();
  const remember = options.remember ?? cookieStore.get(REMEMBER_COOKIE)?.value !== "0";

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, withRememberPreference(options, remember)),
          );
        } catch {
          // Called from a Server Component: cookies are read-only there. The
          // proxy refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Anonymous, cookie-less client for public pages (/, /menu). Not touching
 * cookies keeps those routes statically renderable and cacheable (ISR).
 */
export function createPublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createPlainClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
