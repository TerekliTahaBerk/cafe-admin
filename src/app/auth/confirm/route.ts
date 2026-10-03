import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for links in Supabase auth e-mails (password reset).
 * Supports both the PKCE `code` flow and the `token_hash` template flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/admin";
  // Only allow same-site relative redirects.
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/admin";

  const supabase = await createClient();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  }

  const target = new URL(ok ? next : "/admin/login?error=link", request.url);
  return NextResponse.redirect(target, { status: 303 });
}
