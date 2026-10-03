import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest, reason?: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL("/admin/login", request.url);
  if (reason === "forbidden") url.searchParams.set("error", "forbidden");
  return NextResponse.redirect(url, { status: 303 });
}

/** Used by the server when a signed-in user turns out not to be an admin. */
export async function GET(request: NextRequest) {
  const reason = request.nextUrl.searchParams.get("reason");
  // Only allow the forced-logout flow via GET (so a stray link can't log you out).
  if (reason !== "forbidden") return NextResponse.redirect(new URL("/admin", request.url));
  return signOut(request, reason);
}

/** "Çıkış yap" button (a <form method="post">). */
export async function POST(request: NextRequest) {
  return signOut(request);
}
