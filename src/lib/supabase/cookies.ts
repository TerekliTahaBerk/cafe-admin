import type { CookieOptions } from "@supabase/ssr";

/** Set to "0" when the admin unticks "Bu cihazda beni hatırla" at login. */
export const REMEMBER_COOKIE = "ka_remember";

/**
 * When the admin chose not to be remembered, drop the expiry from auth cookies
 * so they become session cookies and vanish when the browser is closed.
 */
export function withRememberPreference(
  options: CookieOptions,
  remember: boolean,
): CookieOptions {
  if (remember) return options;
  // A maxAge of 0 means "delete" — keep deletions intact.
  if (options.maxAge === 0) return options;
  const rest = { ...options };
  delete rest.maxAge;
  delete rest.expires;
  return rest;
}
