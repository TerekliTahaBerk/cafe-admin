import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/env";
import { REMEMBER_COOKIE, withRememberPreference } from "@/lib/supabase/cookies";

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
];

/**
 * Guards /admin/*: refreshes the Supabase session cookie and sends visitors
 * without a session to /admin/login. Admin *role* is checked again on the
 * server (layout + every Server Action) and enforced by RLS in the database.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();
  const remember = request.cookies.get(REMEMBER_COOKIE)?.value !== "0";

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, withRememberPreference(options, remember)),
        );
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it validates
  // the JWT and refreshes the session if needed.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = !!data?.claims?.sub;

  const { pathname } = request.nextUrl;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (!isSignedIn && !isPublicAdminPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  if (isSignedIn && pathname === "/admin/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/admin";
    home.search = "";
    const redirect = NextResponse.redirect(home);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
